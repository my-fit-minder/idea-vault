import { useNavigate } from 'react-router-dom';
import { Settings, Home, LogOut } from 'lucide-react';
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
        <div className="app-logo" onClick={handleGoHome} title="Go to home">
          <img src="/logo.png" alt="Ideafy" className="logo-image" />
        </div>
        <div className="header-actions">
          <button onClick={handleGoHome} className="home-button" title="Go to home">
            <Home size={18} />
            <span className="button-text">Home</span>
          </button>
          <button onClick={handleSettings} className="settings-button" title="Settings">
            <Settings size={18} />
            <span className="button-text">Settings</span>
          </button>
          <button 
            onClick={handleSignOut} 
            className="sign-out-button"
            title="Sign Out"
          >
            <LogOut size={18} />
            <span className="button-text">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
