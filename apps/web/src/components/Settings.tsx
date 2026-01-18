import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Lock, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/authStore';
import { apiClient } from '../lib/apiClient';
import { validateUsernameFormat } from '../lib/username';
import './Settings.css';

export function Settings() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{ available: boolean | null; message: string }>({ available: null, message: '' });

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoadingUser(true);
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        if (authUser) {
          // Get user metadata (username is stored in user_metadata)
          let userUsername = (authUser.user_metadata?.username as string) || '';
          
          // If no username exists, generate one and save it
          if (!userUsername) {
            const { generateRandomUsername } = await import('../lib/username');
            userUsername = generateRandomUsername();
            
            // Save the generated username
            const { error: updateError } = await supabase.auth.updateUser({
              data: { username: userUsername }
            });
            
            if (updateError) {
              console.error('Failed to save generated username:', updateError);
            }
          }
          
          setUsername(userUsername);
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoadingUser(false);
      }
    };

    void loadUserProfile();
  }, []);

  // Check username availability as user types (debounced)
  useEffect(() => {
    const trimmedUsername = username.trim();
    
    // Reset status if empty
    if (!trimmedUsername) {
      setUsernameStatus({ available: null, message: '' });
      return;
    }

    // Validate format first
    const formatValidation = validateUsernameFormat(trimmedUsername);
    if (!formatValidation.valid) {
      setUsernameStatus({ available: false, message: formatValidation.error || 'Invalid format' });
      return;
    }

    // Check if it's the same as current username
    const checkAvailability = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        const currentUsername = (currentUser?.user_metadata?.username as string) || '';
        
        if (trimmedUsername.toLowerCase() === currentUsername.toLowerCase()) {
          // Don't show status if it's the same as current username
          setUsernameStatus({ available: null, message: '' });
          return;
        }

        setCheckingUsername(true);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const { available } = await apiClient.users.checkUsername(trimmedUsername);
        setCheckingUsername(false);
        
        if (available) {
          setUsernameStatus({ available: true, message: '✓ Available' });
        } else {
          setUsernameStatus({ available: false, message: '✗ Already taken' });
        }
      } catch {
        setCheckingUsername(false);
        setUsernameStatus({ available: null, message: 'Error checking availability' });
      }
    };

    // Debounce the check
    const timeoutId = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedUsername = username.trim();

    // Validate username format
    const formatValidation = validateUsernameFormat(trimmedUsername);
    if (!formatValidation.valid) {
      setError(formatValidation.error || 'Invalid username format');
      return;
    }

    // Check if username is available (use existing status if available)
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const currentUsername = (currentUser?.user_metadata?.username as string) || '';
    
    if (trimmedUsername.toLowerCase() !== currentUsername.toLowerCase()) {
      // If status shows it's not available, don't proceed
      if (usernameStatus.available === false) {
        setError('This username is already taken. Please choose another one.');
        return;
      }
      
      // If we're still checking, wait
      if (checkingUsername) {
        setError('Please wait for username availability check to complete');
        return;
      }
      
      // If we don't have a status yet, check now
      if (usernameStatus.available === null) {
        setLoading(true);
        setCheckingUsername(true);
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          const { available } = await apiClient.users.checkUsername(trimmedUsername);
          setCheckingUsername(false);
          
          if (!available) {
            setError('This username is already taken. Please choose another one.');
            setLoading(false);
            return;
          }
        } catch {
          setCheckingUsername(false);
          setError('Failed to verify username availability');
          setLoading(false);
          return;
        }
      }
    }

    setLoading(true);

    try {
      // Update username in user metadata
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: { username: trimmedUsername }
      });

      if (updateError) throw updateError;

      // Update the auth store
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || undefined,
        });
      }

      setSuccess('Username updated successfully!');
      setUsername(trimmedUsername);
      setUsernameStatus({ available: null, message: '' }); // Clear status after successful update
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update username';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setCheckingUsername(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    setLoading(true);

    try {
      // First verify current password by attempting to sign in
      if (!user?.email) {
        throw new Error('User email not found');
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setPasswordSuccess('Password changed successfully!');
      setPasswordError(null);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change password';
      setPasswordError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="settings-container">
        <div className="settings-loading">
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-card">
        <div className="settings-header">
          <button
            onClick={() => {
              void navigate(-1);
            }}
            className="back-button"
            title="Go back"
          >
            <ChevronLeft size={20} />
          </button>
          <h1>Settings</h1>
        </div>

        {error && (
          <div className="settings-error">
            <span>⚠️ {error}</span>
            <button
              onClick={() => setError(null)}
              className="error-close-button"
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="settings-success">
            <span>✓ {success}</span>
            <button
              onClick={() => setSuccess(null)}
              className="success-close-button"
              aria-label="Close success message"
            >
              ×
            </button>
          </div>
        )}

        <div className="settings-content">
          {/* Update Name Section */}
          <div className="settings-section">
            <div className="settings-section-header">
              <User size={20} />
              <h2>Profile Information</h2>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              void handleUpdateUsername(e);
            }} className="settings-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="form-input"
                />
                <p className="form-help-text">Your email address cannot be changed</p>
              </div>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError(null); // Clear error when user starts typing
                  }}
                  placeholder="Enter your username"
                  maxLength={20}
                  minLength={3}
                  pattern="[a-zA-Z][a-zA-Z0-9_]*"
                  className="form-input"
                  disabled={checkingUsername}
                />
                <p className="form-help-text">
                  3-20 characters, letters, numbers, and underscores only. Must start with a letter.
                </p>
                {username.trim() && (checkingUsername || usernameStatus.message) && (
                  <div className={`username-status ${usernameStatus.available === true ? 'available' : usernameStatus.available === false ? 'taken' : 'checking'}`}>
                    {checkingUsername ? (
                      <span>Checking availability...</span>
                    ) : usernameStatus.message ? (
                      <span>{usernameStatus.message}</span>
                    ) : null}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="save-button"
                disabled={loading || checkingUsername || !username.trim()}
              >
                <Save size={16} />
                <span>{loading ? 'Saving...' : 'Save Username'}</span>
              </button>
            </form>
          </div>

          {/* Change Password Section */}
          <div className="settings-section">
            <div className="settings-section-header">
              <Lock size={20} />
              <h2>Change Password</h2>
            </div>
            {passwordError && (
              <div className="settings-error section-error">
                <span>⚠️ {passwordError}</span>
                <button
                  onClick={() => setPasswordError(null)}
                  className="error-close-button"
                  aria-label="Close error"
                >
                  ×
                </button>
              </div>
            )}
            {passwordSuccess && (
              <div className="settings-success section-success">
                <span>✓ {passwordSuccess}</span>
                <button
                  onClick={() => setPasswordSuccess(null)}
                  className="success-close-button"
                  aria-label="Close success message"
                >
                  ×
                </button>
              </div>
            )}
            <form onSubmit={(e) => {
              e.preventDefault();
              void handleChangePassword(e);
            }} className="settings-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setPasswordError(null); // Clear error when user starts typing
                    setPasswordSuccess(null); // Clear success when user starts typing
                  }}
                  placeholder="Enter current password"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError(null); // Clear error when user starts typing
                    setPasswordSuccess(null); // Clear success when user starts typing
                  }}
                  placeholder="Enter new password (min 6 characters)"
                  minLength={6}
                  className="form-input"
                />
                {newPassword && newPassword.length < 6 && (
                  <p className="form-help-text" style={{ color: '#c53030' }}>
                    Password must be at least 6 characters long
                  </p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError(null); // Clear error when user starts typing
                    setPasswordSuccess(null); // Clear success when user starts typing
                  }}
                  placeholder="Confirm new password"
                  className="form-input"
                />
                {newPassword && confirmPassword && (
                  <div className={`password-match-status ${newPassword === confirmPassword ? 'match' : 'no-match'}`}>
                    {newPassword === confirmPassword ? (
                      <span>✓ Passwords match</span>
                    ) : (
                      <span>✗ Passwords do not match</span>
                    )}
                  </div>
                )}
                {confirmPassword && !newPassword && (
                  <p className="form-help-text" style={{ color: '#718096' }}>
                    Enter new password first
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="save-button"
                disabled={loading || !currentPassword || !newPassword || !confirmPassword}
              >
                <Lock size={16} />
                <span>Change Password</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
