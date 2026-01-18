import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { useAuthStore } from '../lib/authStore';
import './IdeasApp.css';

export function IdeasAppHeader() {
  const { signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleGoHome = () => {
    void navigate('/');
  };

  const handleSettings = () => {
    void navigate('/settings');
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
          <button onClick={handleSettings} className="settings-button" title="Settings">
            <Settings size={18} />
            <span>Settings</span>
          </button>
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
