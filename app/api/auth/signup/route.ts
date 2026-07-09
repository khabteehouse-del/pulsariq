import { NextRequest, NextResponse } from 'next/server';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/, '');
}

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    fullName: string;
    orgName:  string;
    email:    string;
    password: string;
  };

  const { fullName, orgName, email, password } = body;

  if (!fullName || !orgName || !email || !password)
    return NextResponse.json({ error: 'All fields required' }, { status: 400 });

  if (password.length < 8)
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const headers: Record<string, string> = {
    'Content-Type':  'application/json',
    'apikey':        key,
    'Authorization': 'Bearer ' + key,
    'Prefer':        'return=representation',
  };

  // 1. Create auth user
  const authRes = await fetch(url + '/auth/v1/admin/users', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': key, 'Authorization': 'Bearer ' + key },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    }),
  });

  const authData = await authRes.json() as { id?: string; message?: string; msg?: string };

  if (!authRes.ok || !authData.id)
    return NextResponse.json({ error: authData.message ?? authData.msg ?? 'Failed to create user' }, { status: 400 });

  const userId = authData.id;

  // 2. Create organisation via REST
  const slug = slugify(orgName) + '-' + Date.now();
  const orgRes = await fetch(url + '/rest/v1/organizations', {
    method:  'POST',
    headers,
    body: JSON.stringify({ name: orgName, slug }),
  });

  const orgData = await orgRes.json() as { id?: string; message?: string }[];

  if (!orgRes.ok || !orgData[0]?.id) {
    // Cleanup user
    await fetch(url + '/auth/v1/admin/users/' + userId, {
      method: 'DELETE',
      headers: { 'apikey': key, 'Authorization': 'Bearer ' + key },
    });
    return NextResponse.json({ error: 'Failed to create organisation' }, { status: 500 });
  }

  const orgId = orgData[0].id;

  // 3. Create profile via REST
  const profileRes = await fetch(url + '/rest/v1/profiles', {
    method:  'POST',
    headers,
    body: JSON.stringify({
      id:        userId,
      org_id:    orgId,
      email,
      full_name: fullName,
      role:      'admin',
    }),
  });

  if (!profileRes.ok) {
    const profileErr = await profileRes.json();
    console.error('Profile error:', profileErr);

    // Try PATCH instead (profile might exist from trigger)
    await fetch(url + '/rest/v1/profiles?id=eq.' + userId, {
      method:  'PATCH',
      headers,
      body: JSON.stringify({ org_id: orgId, full_name: fullName, role: 'admin' }),
    });
  }

  return NextResponse.json({ success: true, orgId });
}
