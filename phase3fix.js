const fs   = require('fs');
const path = require('path');

fs.writeFileSync(
  path.join(process.cwd(), 'app', 'api', 'auth', 'signup', 'route.ts'),
  String.raw`
import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { slugify } from '@/lib/utils';

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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  // 1. Create auth user via direct REST call
  const authRes = await fetch(supabaseUrl + '/auth/v1/admin/users', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'apikey':        serviceKey,
      'Authorization': 'Bearer ' + serviceKey,
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    }),
  });

  const authData = await authRes.json() as { id?: string; message?: string };

  if (!authRes.ok || !authData.id)
    return NextResponse.json({ error: authData.message ?? 'Failed to create user' }, { status: 400 });

  const userId = authData.id;

  // 2. Create organisation
  const slug = slugify(orgName) + '-' + Date.now();
  const { data: org, error: orgErr } = await adminClient
    .from('organizations')
    .insert({ name: orgName, slug })
    .select()
    .single();

  if (orgErr || !org) {
    // Cleanup user
    await fetch(supabaseUrl + '/auth/v1/admin/users/' + userId, {
      method: 'DELETE',
      headers: { 'apikey': serviceKey, 'Authorization': 'Bearer ' + serviceKey },
    });
    return NextResponse.json({ error: 'Failed to create organisation' }, { status: 500 });
  }

  // 3. Update profile (created by DB trigger)
  const { error: profileErr } = await adminClient
    .from('profiles')
    .update({ org_id: org.id, full_name: fullName, role: 'admin' })
    .eq('id', userId);

  if (profileErr)
    return NextResponse.json({ error: 'Failed to set up profile: ' + profileErr.message }, { status: 500 });

  return NextResponse.json({ success: true, orgId: org.id });
}
`.trimStart(),
  'utf8'
);

console.log('  \u2713 app/api/auth/signup/route.ts patched');
console.log('  Now restart server and run curl again');
