import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './lib/authStore';
import { AuthPage } from './components/AuthPage';
import { IdeasRoutes } from './components/IdeasRoutes';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { Analytics } from './components/Analytics';
import './App.css';

function App() {
  const { user, loading, initialized, initialize } = useAuthStore();
  const [initError, setInitError] = useState<string | null>(null);
  
  // Check for password reset token - we'll let Supabase process it but track it
  const [hasRecoveryToken] = useState(() => {
    if (typeof window === 'undefined') return false;
    
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    return type === 'recovery';
  });

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
        <Loader2 className="spinner" size={40} />
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

  // If we detected a recovery token in URL, show AuthPage to handle password reset
  // Even if user gets auto-logged in, we'll check for recovery session in AuthPage
  const shouldShowAuth = !user || hasRecoveryToken;

  return (
    <>
      <Analytics />
      <Routes>
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        {shouldShowAuth ? (
          <Route path="*" element={<AuthPage hasRecoveryToken={hasRecoveryToken} />} />
        ) : (
          <Route path="/*" element={<IdeasRoutes />} />
        )}
      </Routes>
    </>
  );
}

export default App;
