import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { syncService } from '../lib/syncService';
import type { Idea } from '@idea-vault/shared';
import { IdeasList } from './IdeasList';
import { IdeaEditor } from './IdeaEditor';
import { IdeaDetail } from './IdeaDetail';
import { IdeasAppHeader } from './IdeasAppHeader';
import { Settings } from './Settings';
import './IdeasApp.css';

const PAGE_SIZE = 20;

function IdeasListPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    showActive: true,
    showArchived: false,
  });
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);
  const navigate = useNavigate();
  const observerTarget = useRef<HTMLDivElement>(null);

  // Debounce search query to avoid too many API calls
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadIdeas = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        offsetRef.current = 0;
        setIdeas([]);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const offsetToUse = reset ? 0 : offsetRef.current;
      
      // If both filters are off, show nothing
      if (!filters.showActive && !filters.showArchived) {
        setIdeas([]);
        setHasMore(false);
        setLoading(false);
        setLoadingMore(false);
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
      
      // Fetch ideas with pagination
      // TypeScript has trouble resolving the return type from syncService, but the runtime type is correct
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await syncService.getIdeasPaginated({
        limit: PAGE_SIZE,
        offset: offsetToUse,
        archived,
        search: debouncedSearchQuery.trim().length > 0 ? debouncedSearchQuery.trim() : undefined,
      });
      
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const newIdeas: Idea[] = Array.isArray(response.data) ? (response.data as Idea[]) : [];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const pagination = response.pagination;

      // Deduplicate ideas by ID to prevent showing the same idea twice
      const uniqueNewIdeas: Idea[] = Array.from(
        new Map(newIdeas.map((idea: Idea) => [idea.id, idea])).values()
      );

      if (reset) {
        setIdeas(uniqueNewIdeas);
      } else {
        // Deduplicate against existing ideas
        setIdeas((prev) => {
          const existingIds = new Set(prev.map((idea) => idea.id));
          const filteredNewIdeas = uniqueNewIdeas.filter((idea: Idea) => !existingIds.has(idea.id));
          return [...prev, ...filteredNewIdeas];
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      setHasMore(pagination.hasMore as boolean);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      offsetRef.current = (pagination.offset as number) + (pagination.limit as number);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load ideas';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters.showActive, filters.showArchived, debouncedSearchQuery]);

  // Load more ideas when scrolling to bottom
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      void loadIdeas(false);
    }
  }, [loadingMore, hasMore, loading, loadIdeas]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingMore && !loading) {
          void loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loading, loadMore]);

  // Initial load and reload when filters or search change
  useEffect(() => {
    void loadIdeas(true);
  }, [loadIdeas]);

  const handleCreate = () => {
    void navigate('/ideas/new');
  };

  const handleEdit = (idea: Idea) => {
    void navigate(`/ideas/${idea.id}/edit`);
  };

  const handleView = (idea: Idea) => {
    void navigate(`/ideas/${idea.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this idea?')) {
      return;
    }

    try {
       
      await syncService.deleteIdea(id);
      await loadIdeas(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete idea';
      alert(errorMessage);
    }
  };

  // Search is now handled at the API level, no client-side filtering needed
  return (
    <>
      <IdeasList
        ideas={ideas}
        loading={loading}
        loadingMore={loadingMore}
        error={error}
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
          void loadIdeas(true);
        }}
      />
      {/* Sentinel element for infinite scroll */}
      {hasMore && !loading && (
        <div ref={observerTarget} style={{ height: '20px', width: '100%' }} />
      )}
    </>
  );
}

function CreateIdeaPage() {
  const navigate = useNavigate();

  const handleSave = () => {
    void navigate('/');
  };

  const handleCancel = () => {
    void navigate('/');
  };

  return <IdeaEditor onSave={handleSave} onCancel={handleCancel} />;
}

function EditIdeaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIdea = async () => {
      if (!id) {
        void navigate('/');
        return;
      }

      try {
        setLoading(true);
         
        const ideas = await syncService.getIdeas();
         
        const foundIdea = ideas.find((i: Idea) => i.id === id);
        if (foundIdea) {
           
          setIdea(foundIdea);
        } else {
          void navigate('/');
        }
      } catch (err) {
        console.error('Failed to load idea:', err);
        void navigate('/');
      } finally {
        setLoading(false);
      }
    };

    void loadIdea();
  }, [id, navigate]);

  const handleSave = () => {
    void navigate(`/ideas/${id}`);
  };

  const handleCancel = () => {
    void navigate(`/ideas/${id}`);
  };

  if (loading) {
    return (
      <div className="initial-loading-container">
        <Loader2 className="spinner" size={40} />
      </div>
    );
  }

  if (!idea) {
    return null;
  }

  return <IdeaEditor idea={idea} onSave={() => { void handleSave(); }} onCancel={handleCancel} />;
}

function ViewIdeaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);

  // Load idea function (memoized to avoid dependency issues)
  const loadIdea = useCallback(async () => {
    if (!id) {
      void navigate('/');
      return null;
    }

    try {
      const { apiClient } = await import('../lib/apiClient');
       
      const loadedIdea = await apiClient.ideas.getById(id);
       
      setIdea(loadedIdea);
      return loadedIdea;
    } catch (err) {
      console.error('Failed to load idea:', err);
      void navigate('/');
      return null;
    }
  }, [id, navigate]);

  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await loadIdea();
      setLoading(false);
    };

    void initialLoad();
  }, [loadIdea]);

  // Poll for report updates if idea exists but has no report
  useEffect(() => {
    if (!idea || !id || idea.ai_report) {
      return; // Don't poll if idea has a report or doesn't exist
    }

    // Check if idea was created recently (within last 2 minutes)
    const createdAt = new Date(idea.created_at).getTime();
    const now = Date.now();
    const twoMinutesAgo = now - 2 * 60 * 1000;

    // Only poll if idea was created recently (likely still generating)
    if (createdAt < twoMinutesAgo) {
      return;
    }

    // Poll every 3 seconds for up to 60 seconds
    let pollCount = 0;
    const maxPolls = 20; // 20 polls * 3 seconds = 60 seconds max
    const pollInterval = 3000; // 3 seconds

    const pollTimer = setInterval(async () => {
      pollCount++;
      
      try {
        const updatedIdea = await loadIdea();
        // Stop polling if report is now available or max polls reached
        if (updatedIdea?.ai_report || pollCount >= maxPolls) {
          clearInterval(pollTimer);
        }
      } catch (err) {
        console.error('Error polling for report:', err);
        clearInterval(pollTimer);
      }
    }, pollInterval);

    // Cleanup on unmount or when idea changes
    return () => {
      clearInterval(pollTimer);
    };
  }, [idea, id, loadIdea]);

  const handleEdit = () => {
    void navigate(`/ideas/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!id) return;
    
    if (!confirm('Are you sure you want to delete this idea?')) {
      return;
    }

    try {
       
      await syncService.deleteIdea(id);
      void navigate('/');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete idea';
      alert(errorMessage);
    }
  };

  const handleClose = () => {
    void navigate('/');
  };

  const handleArchive = async () => {
    if (!id) return;

    try {
      const { apiClient } = await import('../lib/apiClient');
       
      const updatedIdea = await apiClient.ideas.archive(id);
      setIdea(updatedIdea);
      
      // Also reload ideas list in background
       
      await syncService.getIdeas();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to archive idea';
      alert(errorMessage);
    }
  };

  const handleRegenerateAI = async (ideaToRegenerate: Idea) => {
    try {
      const { apiClient } = await import('../lib/apiClient');
      const result = await apiClient.ideas.generateReport(ideaToRegenerate.id);
      
      // Update the idea with the generated report
      if (result.idea) {
        setIdea(result.idea);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate AI report';
      alert(errorMessage);
    }
  };

  const handleIdeaUpdated = (updatedIdea: Idea) => {
    setIdea(updatedIdea);
  };

  if (loading) {
    return (
      <div className="initial-loading-container">
        <Loader2 className="spinner" size={40} />
      </div>
    );
  }

  if (!idea) {
    return null;
  }

  // Determine if report is being generated
  // Show loading if: no report exists AND idea was created recently (within 2 minutes)
  const createdAt = new Date(idea.created_at).getTime();
  const now = Date.now();
  const twoMinutesAgo = now - 2 * 60 * 1000;
  const isGeneratingReport = !idea.ai_report && createdAt >= twoMinutesAgo;

  return (
    <IdeaDetail
      idea={idea}
      onEdit={handleEdit}
      onDelete={() => {
        void handleDelete();
      }}
      onArchive={() => {
        void handleArchive();
      }}
      onClose={handleClose}
      onRegenerate={handleRegenerateAI}
      onIdeaUpdated={handleIdeaUpdated}
      isGeneratingReport={isGeneratingReport}
    />
  );
}

export function IdeasRoutes() {
  return (
    <div className="ideas-app">
      <IdeasAppHeader />
      <main className="app-main">
        <Routes>
          <Route index element={<IdeasListPage />} />
          <Route path="ideas/new" element={<CreateIdeaPage />} />
          <Route path="ideas/:id" element={<ViewIdeaPage />} />
          <Route path="ideas/:id/edit" element={<EditIdeaPage />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
