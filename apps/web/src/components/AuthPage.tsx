import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/authStore';
import { signIn, signUp } from '../lib/auth';
import './AuthPage.css';

export function AuthPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSignUp && !acceptPrivacy) {
      setError('You must accept the Privacy Policy to sign up');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const result = await signUp({ email, password });
        // If signup is successful but no session is returned, email confirmation is required
        if (result.user && !result.session) {
          setShowEmailConfirmation(true);
          setSignupEmail(email);
          setEmail('');
          setPassword('');
          setAcceptPrivacy(false);
        }
        // If session exists, user is automatically logged in (email confirmation disabled)
      } else {
        await signIn({ email, password });
        // Auth state will update automatically via the store
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show email confirmation message if signup was successful
  if (showEmailConfirmation) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>💡 Idea Vault</h1>
            <p>Check your email</p>
          </div>
          <div className="email-confirmation-message">
            <p className="confirmation-text">
              We've sent a confirmation email to <strong>{signupEmail}</strong>
            </p>
            <p className="confirmation-instructions">
              Please check your inbox and click the confirmation link to activate your account. 
              You'll be able to sign in once you've confirmed your email address.
            </p>
            <button
              type="button"
              onClick={() => {
                setShowEmailConfirmation(false);
                setIsSignUp(false);
                setSignupEmail('');
              }}
              className="auth-button"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>💡 Idea Vault</h1>
          <p>Your personal idea management system</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {isSignUp && (
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={acceptPrivacy}
                  onChange={(e) => setAcceptPrivacy(e.target.checked)}
                  className="checkbox-input"
                />
                <span>
                  I accept the{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      void navigate('/privacy-policy');
                    }}
                    className="privacy-link"
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            disabled={loading || (isSignUp && !acceptPrivacy)} 
            className="auth-button"
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setAcceptPrivacy(false);
              setShowEmailConfirmation(false);
            }}
            className="toggle-auth"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
