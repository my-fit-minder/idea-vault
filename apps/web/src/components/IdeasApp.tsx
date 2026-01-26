import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../lib/authStore';
import { syncService } from '../lib/syncService';
import type { Idea } from '@idea-vault/shared';
import { IdeasList } from './IdeasList';
import { IdeaEditor } from './IdeaEditor';
import { IdeaDetail } from './IdeaDetail';
import './IdeasApp.css';

type View = 'list' | 'create' | 'edit' | 'detail';

interface FilterState {
  showActive: boolean;
  showArchived: boolean;
}

export function IdeasApp() {
  const { user, signOut } = useAuthStore();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('list');
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    showActive: true,
    showArchived: false,
  });

  const loadIdeas = async (): Promise<void> => {
    setLoading(true);
    try {
      // If both filters are off, show nothing
      if (!filters.showActive && !filters.showArchived) {
        setIdeas([]);
        return;
      }
      
      // Determine archived filter based on filter state
      // If both are true, fetch all (archived = undefined)
      // If only showActive is true, fetch active (archived = false)
      // If only showArchived is true, fetch archived (archived = true)
      let archived: boolean | undefined;
      if (filters.showActive && !filters.showArchived) {
        archived = false;
      } else if (!filters.showActive && filters.showArchived) {
        archived = true;
      } else {
        // Both true - fetch all
        archived = undefined;
      }
      
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const data = await syncService.getIdeas(archived);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      setIdeas(data);
    } catch {
      // Silently fail - errors are logged by the service
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadIdeas();
  }, [filters.showActive, filters.showArchived]);

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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      await syncService.deleteIdea(id);
      await loadIdeas();
      if (selectedIdea?.id === id) {
        setView('list');
        setSelectedIdea(null);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete idea';
      alert(errorMessage);
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate AI report';
      alert(errorMessage);
    }
  };

  const handleArchive = async (idea: Idea) => {
    try {
      const { apiClient } = await import('../lib/apiClient');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const updatedIdea = await apiClient.ideas.archive(idea.id);
      
      // Update the selected idea if it's the archived one
      if (selectedIdea?.id === idea.id) {
        setSelectedIdea(updatedIdea as Idea);
      }
      
      // Reload ideas to get the updated data
      await loadIdeas();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to archive idea';
      alert(errorMessage);
    }
  };

  const handleGoHome = () => {
    setView('list');
    setSelectedIdea(null);
  };

  // Only filter by search query - archived/active filtering is done on the backend
  const filteredIdeas = ideas.filter((idea) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      idea.title.toLowerCase().includes(query) ||
      idea.content?.toLowerCase().includes(query) ||
      idea.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  // Show full-screen centered loader only on initial load (when loading and no ideas yet)
  const isInitialLoad = loading && ideas.length === 0;

  if (isInitialLoad) {
    return (
      <div className="ideas-app">
        <div className="initial-loading-container">
          <Loader2 className="spinner" size={40} />
        </div>
      </div>
    );
  }

  return (
    <div className="ideas-app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-logo" onClick={handleGoHome} title="Go to home">
            Ideafy
          </h1>
          <div className="header-actions">
            <button onClick={handleGoHome} className="home-button" title="Go to home">
              🏠 Home
            </button>
            <div className="user-info">
              <span>{user?.email}</span>
            </div>
            <button 
              onClick={() => {
                void signOut();
              }} 
              className="sign-out-button"
            >
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
            error={null}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filters}
            onFiltersChange={setFilters}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={(id: string) => {
              void handleDelete(id);
            }}
            onRefresh={() => {
              void loadIdeas();
            }}
          />
        )}

        {view === 'create' && (
          <IdeaEditor 
            onSave={() => {
              void handleSave();
            }} 
            onCancel={() => setView('list')} 
          />
        )}

        {view === 'edit' && selectedIdea && (
          <IdeaEditor
            idea={selectedIdea}
            onSave={() => {
              void handleSave();
            }}
            onCancel={() => setView('list')}
          />
        )}

        {view === 'detail' && selectedIdea && (
          <IdeaDetail
            idea={selectedIdea}
            onEdit={() => handleEdit(selectedIdea)}
            onDelete={() => {
              void handleDelete(selectedIdea.id);
            }}
            onArchive={() => {
              void handleArchive(selectedIdea);
            }}
            onClose={() => setView('list')}
            onRegenerate={handleRegenerateAI}
          />
        )}
      </main>
    </div>
  );
}
