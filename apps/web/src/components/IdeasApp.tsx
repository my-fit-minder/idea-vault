import { useState, useEffect } from 'react';
import { useAuthStore } from '../lib/authStore';
import { syncService } from '../lib/syncService';
import type { Idea } from '@idea-vault/shared';
import { IdeasList } from './IdeasList';
import { IdeaEditor } from './IdeaEditor';
import { IdeaDetail } from './IdeaDetail';
import './IdeasApp.css';

type View = 'list' | 'create' | 'edit' | 'detail';

export function IdeasApp() {
  const { user, signOut } = useAuthStore();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('list');
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const loadIdeas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await syncService.getIdeasWithOfflineSupport();
      setIdeas(data);
      
      // Try to sync in background
      if (navigator.onLine) {
        syncService.sync().then(({ synced }) => {
          if (synced > 0) {
            loadIdeas(); // Reload after sync
          }
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load ideas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIdeas();
    
    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      loadIdeas(); // Try to sync when coming back online
    };
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleCreate = () => {
    setSelectedIdea(null);
    setView('create');
  };

  const handleEdit = (idea: Idea) => {
    setSelectedIdea(idea);
    setView('edit');
  };

  const handleView = (idea: Idea) => {
    setSelectedIdea(idea);
    setView('detail');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this idea?')) {
      return;
    }

    try {
      await syncService.deleteIdeaWithOfflineSupport(id);
      await loadIdeas();
      if (selectedIdea?.id === id) {
        setView('list');
        setSelectedIdea(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete idea');
    }
  };

  const handleSave = async () => {
    await loadIdeas();
    setView('list');
    setSelectedIdea(null);
  };

  const handleRegenerateAI = async (idea: Idea) => {
    try {
      const { apiClient } = await import('../lib/apiClient');
      const result = await apiClient.ideas.generateReport(idea.id);
      
      // Update the selected idea with the new report
      if (selectedIdea?.id === idea.id) {
        setSelectedIdea(result.idea);
      }
      
      // Reload ideas to get the updated data
      await loadIdeas();
    } catch (error: any) {
      alert(error.message || 'Failed to generate AI report');
    }
  };

  const filteredIdeas = ideas.filter((idea) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      idea.title.toLowerCase().includes(query) ||
      idea.content?.toLowerCase().includes(query) ||
      idea.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div className="ideas-app">
      <header className="app-header">
        <div className="header-content">
          <h1>💡 Idea Vault</h1>
          <div className="header-actions">
            <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
              {isOnline ? '🟢 Online' : '🔴 Offline'}
            </div>
            <div className="user-info">
              <span>{user?.email}</span>
            </div>
            <button onClick={signOut} className="sign-out-button">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {view === 'list' && (
          <IdeasList
            ideas={filteredIdeas}
            loading={loading}
            error={error}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
            onRefresh={loadIdeas}
          />
        )}

        {view === 'create' && (
          <IdeaEditor onSave={handleSave} onCancel={() => setView('list')} />
        )}

        {view === 'edit' && selectedIdea && (
          <IdeaEditor
            idea={selectedIdea}
            onSave={handleSave}
            onCancel={() => setView('list')}
          />
        )}

        {view === 'detail' && selectedIdea && (
          <IdeaDetail
            idea={selectedIdea}
            onEdit={() => handleEdit(selectedIdea)}
            onDelete={() => handleDelete(selectedIdea.id)}
            onClose={() => setView('list')}
            onRegenerate={handleRegenerateAI}
          />
        )}
      </main>
    </div>
  );
}
