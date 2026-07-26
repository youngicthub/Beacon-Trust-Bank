import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Beacon Trust] Uncaught error:', error, info);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const isMissingEnv =
      error.message.includes('SUPABASE_URL') ||
      error.message.includes('SUPABASE_PUBLISHABLE_KEY');

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, system-ui, sans-serif',
          background: '#f8fafc',
          padding: '2rem',
        }}
      >
        <div
          style={{
            maxWidth: 520,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '2.5rem',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: '1rem' }}>⚠️</div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
            {isMissingEnv ? 'Missing environment variables' : 'Something went wrong'}
          </h1>

          {isMissingEnv ? (
            <>
              <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                The app needs your Supabase credentials to start. Create a <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>.env</code> file in the project root with:
              </p>
              <pre
                style={{
                  background: '#0f172a',
                  color: '#e2e8f0',
                  padding: '1rem',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  overflowX: 'auto',
                  marginBottom: '1.25rem',
                }}
              >
{`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
PORT=8080
SESSION_SECRET=any-long-random-string`}
              </pre>
              <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
                Find your URL and key in your Supabase project under <strong>Settings → API</strong>. Then restart with <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>npm run dev</code>.
              </p>
            </>
          ) : (
            <>
              <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1rem' }}>
                An unexpected error occurred. Check the browser console for details.
              </p>
              <pre
                style={{
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  padding: '0.75rem',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {error.message}
              </pre>
            </>
          )}
        </div>
      </div>
    );
  }
}
