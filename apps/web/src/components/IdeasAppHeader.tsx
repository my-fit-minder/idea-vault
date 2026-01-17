import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/authStore';
import './IdeasApp.css';

export function IdeasAppHeader() {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleGoHome = () => {
    void navigate('/');
  };

  const handleSignOut = () => {
    void signOut();
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="app-logo" onClick={handleGoHome} title="Go to home">
          💡 Idea Vault
        </h1>
        <div className="header-actions">
          <button onClick={handleGoHome} className="home-button" title="Go to home">
            🏠 Home
          </button>
          <div className="user-info">
            <span>{user?.email}</span>
          </div>
          <button 
            onClick={handleSignOut} 
            className="sign-out-button"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
