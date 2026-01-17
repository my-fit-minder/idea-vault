import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { syncService } from '../lib/syncService';
import type { Idea } from '@idea-vault/shared';
import { IdeasList } from './IdeasList';
import { IdeaEditor } from './IdeaEditor';
import { IdeaDetail } from './IdeaDetail';
import { IdeasAppHeader } from './IdeasAppHeader';
import './IdeasApp.css';

function IdeasListPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const loadIdeas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await syncService.getIdeas();
      setIdeas(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load ideas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIdeas();
  }, []);

  const handleCreate = () => {
    navigate('/ideas/new');
  };

  const handleEdit = (idea: Idea) => {
    navigate(`/ideas/${idea.id}/edit`);
  };

  const handleView = (idea: Idea) => {
    navigate(`/ideas/${idea.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this idea?')) {
      return;
    }

    try {
      await syncService.deleteIdea(id);
      await loadIdeas();
    } catch (err: any) {
      alert(err.message || 'Failed to delete idea');
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
  );
}

function CreateIdeaPage() {
  const navigate = useNavigate();

  const handleSave = async () => {
    navigate('/');
  };

  const handleCancel = () => {
    navigate('/');
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
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const ideas = await syncService.getIdeas();
        const foundIdea = ideas.find(i => i.id === id);
        if (foundIdea) {
          setIdea(foundIdea);
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error('Failed to load idea:', err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadIdea();
  }, [id, navigate]);

  const handleSave = async () => {
    navigate(`/ideas/${id}`);
  };

  const handleCancel = () => {
    navigate(`/ideas/${id}`);
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

  return <IdeaEditor idea={idea} onSave={handleSave} onCancel={handleCancel} />;
}

function ViewIdeaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIdea = async () => {
      if (!id) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const ideas = await syncService.getIdeas();
        const foundIdea = ideas.find(i => i.id === id);
        if (foundIdea) {
          setIdea(foundIdea);
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error('Failed to load idea:', err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadIdea();
  }, [id, navigate]);

  const handleEdit = () => {
    navigate(`/ideas/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!id) return;
    
    if (!confirm('Are you sure you want to delete this idea?')) {
      return;
    }

    try {
      await syncService.deleteIdea(id);
      navigate('/');
    } catch (err: any) {
      alert(err.message || 'Failed to delete idea');
    }
  };

  const handleClose = () => {
    navigate('/');
  };

  const handleArchive = async () => {
    if (!id) return;

    try {
      const { apiClient } = await import('../lib/apiClient');
      const updatedIdea = await apiClient.ideas.archive(id);
      setIdea(updatedIdea);
      
      // Also reload ideas list in background
      await syncService.getIdeas();
    } catch (err: any) {
      alert(err.message || 'Failed to archive idea');
    }
  };

  const handleRegenerateAI = async (ideaToRegenerate: Idea) => {
    try {
      const { apiClient } = await import('../lib/apiClient');
      const result = await apiClient.ideas.generateReport(ideaToRegenerate.id);
      
      // Reload the idea
      const ideas = await syncService.getIdeas();
      const updatedIdea = ideas.find(i => i.id === ideaToRegenerate.id);
      if (updatedIdea) {
        setIdea(updatedIdea);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to generate AI report');
    }
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

  return (
    <IdeaDetail
      idea={idea}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onArchive={handleArchive}
      onClose={handleClose}
      onRegenerate={handleRegenerateAI}
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
