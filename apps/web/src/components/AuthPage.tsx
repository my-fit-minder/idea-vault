import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/authStore';
import { signIn, signUp, signInWithGoogle, resetPassword, updatePassword } from '../lib/auth';
import { supabase } from '../lib/supabase';
import './AuthPage.css';

interface AuthPageProps {
  hasRecoveryToken?: boolean;
}

export function AuthPage({ hasRecoveryToken }: AuthPageProps) {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

  // Check for password reset - either from URL hash or if user has a recovery session
  useEffect(() => {
    // Check if we detected a recovery token in the URL
    if (hasRecoveryToken) {
      // Let Supabase process it first, then check for session
      const checkRecoverySession = async () => {
        // Wait a bit for Supabase to process the hash
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const { data: { session } } = await supabase.auth.getSession();
        
        // If we have a session and it's from recovery, show password reset form
        if (session) {
          setShowResetPassword(true);
          // Clear the hash after processing
          window.history.replaceState(null, '', window.location.pathname);
        } else {
          // No session yet, but we have recovery token - show form anyway
          setShowResetPassword(true);
        }
      };
      
      void checkRecoverySession();
      return;
    }

    // Fallback: check URL hash directly
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');

    if (type === 'recovery') {
      setShowResetPassword(true);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [hasRecoveryToken]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      await signInWithGoogle();
      // The redirect will happen automatically, so we don't need to handle the response here
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!forgotPasswordEmail) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(forgotPasswordEmail);
      setForgotPasswordSent(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || !confirmPassword) {
      setError('Please enter and confirm your new password');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Check if we have a recovery session (from URL hash that Supabase processed)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session. Please request a new password reset link.');
      }

      // Update the password - if this is a recovery session, Supabase will allow it
      // If it's a regular session, it will also work
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error('Update password error:', updateError);
        // If update fails, the token might have expired or session is invalid
        if (updateError.message.includes('session') || updateError.message.includes('token') || updateError.message.includes('expired') || updateError.message.includes('recovery') || updateError.message.includes('password')) {
          throw new Error('Unable to reset password. The reset link may have expired. Please request a new password reset.');
        }
        throw updateError;
      }

      setPasswordResetSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      
      // Refresh the auth state after password update
      // Re-fetch session to get the updated one after password change
      const { data: { session: updatedSession } } = await supabase.auth.getSession();
      if (updatedSession) {
        useAuthStore.getState().setSession(updatedSession);
        useAuthStore.getState().setUser(updatedSession.user ? { id: updatedSession.user.id, email: updatedSession.user.email } : null);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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

  // Show password reset success
  if (showResetPassword && passwordResetSuccess) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>💡 Idea Vault</h1>
            <p>Password reset successful</p>
          </div>
          <div className="email-confirmation-message">
            <p className="confirmation-text">
              Your password has been successfully reset!
            </p>
            <p className="confirmation-instructions">
              You can now sign in with your new password.
            </p>
            <button
              type="button"
              onClick={() => {
                setShowResetPassword(false);
                setPasswordResetSuccess(false);
                setError(null);
              }}
              className="auth-button"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show password reset form (when user clicks email link)
  if (showResetPassword) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>💡 Idea Vault</h1>
            <p>Set your new password</p>
          </div>

          <form onSubmit={handlePasswordReset} className="auth-form">
            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button 
              type="submit" 
              disabled={loading} 
              className="auth-button"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Show forgot password sent confirmation
  if (showForgotPassword && forgotPasswordSent) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>💡 Idea Vault</h1>
            <p>Check your email</p>
          </div>
          <div className="email-confirmation-message">
            <p className="confirmation-text">
              We've sent a password reset link to <strong>{forgotPasswordEmail}</strong>
            </p>
            <p className="confirmation-instructions">
              Please check your inbox and click the link to reset your password. 
              The link will expire in 1 hour.
            </p>
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setForgotPasswordSent(false);
                setForgotPasswordEmail('');
                setError(null);
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

  // Show forgot password form
  if (showForgotPassword) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>💡 Idea Vault</h1>
            <p>Reset your password</p>
          </div>

          <form onSubmit={handleForgotPassword} className="auth-form">
            <div className="form-group">
              <label htmlFor="forgot-email">Email</label>
              <input
                id="forgot-email"
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                required
                placeholder="you@example.com"
                autoFocus
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button 
              type="submit" 
              disabled={loading} 
              className="auth-button"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="auth-footer">
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setForgotPasswordEmail('');
                setError(null);
              }}
              className="toggle-auth"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

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

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="google-button"
        >
          <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="divider">
          <span>or</span>
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
            <div className="password-label-row">
              <label htmlFor="password">Password</label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setError(null);
                  }}
                  className="forgot-password-link"
                >
                  Forgot password?
                </button>
              )}
            </div>
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
