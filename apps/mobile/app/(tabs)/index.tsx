// Main ideas tab screen
import React, { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { IdeasList } from '@/components/IdeasList';
import { IdeaEditor } from '@/components/IdeaEditor';
import { IdeaDetail } from '@/components/IdeaDetail';
import { syncService } from '@/lib/syncService';
import type { Idea } from '@/lib/types';

type View = 'list' | 'create' | 'edit' | 'detail';

export default function IdeasScreen() {
  const [view, setView] = useState<View>('list');
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh ideas when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  const handleSelectIdea = (idea: Idea) => {
    setSelectedIdea(idea);
    setView('detail');
  };

  const handleCreateIdea = () => {
    setSelectedIdea(null);
    setView('create');
  };

  const handleEditIdea = (idea: Idea) => {
    setSelectedIdea(idea);
    setView('edit');
  };

  const handleSave = () => {
    setView('list');
    setSelectedIdea(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleCancel = () => {
    setView('list');
    setSelectedIdea(null);
  };

  const handleDelete = async () => {
    if (selectedIdea) {
      try {
        await syncService.deleteIdea(selectedIdea.id);
        setView('list');
        setSelectedIdea(null);
        setRefreshKey(prev => prev + 1);
      } catch (error) {
        console.error('Failed to delete idea:', error);
      }
    }
  };

  const handleIdeaUpdated = (updatedIdea: Idea) => {
    setSelectedIdea(updatedIdea);
  };

  // Render based on current view
  if (view === 'create') {
    return <IdeaEditor onSave={handleSave} onCancel={handleCancel} />;
  }

  if (view === 'edit' && selectedIdea) {
    return <IdeaEditor idea={selectedIdea} onSave={handleSave} onCancel={handleCancel} />;
  }

  if (view === 'detail' && selectedIdea) {
    return (
      <IdeaDetail
        idea={selectedIdea}
        onEdit={() => setView('edit')}
        onDelete={handleDelete}
        onBack={() => setView('list')}
        onIdeaUpdated={handleIdeaUpdated}
      />
    );
  }

  return (
    <IdeasList
      key={refreshKey}
      onSelectIdea={handleSelectIdea}
      onCreateIdea={handleCreateIdea}
      onEditIdea={handleEditIdea}
    />
  );
}
