import { useEffect, useState } from 'react';
import { useAuthStore } from './lib/authStore';
import { AuthPage } from './components/AuthPage';
import { IdeasApp } from './components/IdeasApp';
import './App.css';

function App() {
  const { user, loading, initialized, initialize } = useAuthStore();
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialized) {
      initialize().catch((err: any) => {
        console.error('Failed to initialize app:', err);
        setInitError(err.message || 'Failed to initialize application');
      });
    }
  }, [initialized, initialize]);

  if (loading || !initialized) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
        {initError && (
          <div style={{
            marginTop: '20px',
            padding: '12px',
            background: '#fed7d7',
            color: '#c53030',
            borderRadius: '8px',
            maxWidth: '500px',
            textAlign: 'center'
          }}>
            <strong>Configuration Error</strong>
            <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>{initError}</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>
              Please check your .env file and restart the dev server.
            </p>
          </div>
        )}
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <IdeasApp />;
}

export default App;
