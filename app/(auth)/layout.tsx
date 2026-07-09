export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#07080F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
      padding: '24px',
    }}>
      {children}
    </main>
  );
}
