import { useState, useRef, useEffect } from 'react';
import { Loader2, RefreshCw, Plus, Edit, Trash2, Filter, Check, Archive } from 'lucide-react';
import { type Idea } from '@idea-vault/shared';
import './IdeasList.css';

export interface FilterState {
  showActive: boolean;
  showArchived: boolean;
}

interface IdeasListProps {
  ideas: Idea[];
  loading: boolean;
  loadingMore?: boolean;
  error: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onCreate: () => void;
  onEdit: (idea: Idea) => void;
  onView: (idea: Idea) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export function IdeasList({
  ideas,
  loading,
  loadingMore = false,
  error,
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  onCreate,
  onEdit,
  onView,
  onDelete,
  onRefresh,
}: IdeasListProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterToggle = (filterKey: 'showActive' | 'showArchived') => {
    onFiltersChange({
      ...filters,
      [filterKey]: !filters[filterKey],
    });
  };

  const activeFilterCount = [filters.showActive, filters.showArchived].filter(Boolean).length;
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="ideas-list-container">
      <div className="ideas-header">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search ideas..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="actions">
          <div className="filter-container" ref={filterRef}>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)} 
              className={`filter-button ${isFilterOpen ? 'active' : ''}`}
              title="Filter ideas"
            >
              <Filter size={16} />
              <span>Filters</span>
              {activeFilterCount < 2 && (
                <span className="filter-badge">{activeFilterCount}</span>
              )}
            </button>
            {isFilterOpen && (
              <div className="filter-dropdown">
                <div className="filter-dropdown-header">Filter Ideas</div>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.showActive}
                    onChange={() => handleFilterToggle('showActive')}
                  />
                  <span className="filter-checkbox">
                    {filters.showActive && <Check size={14} />}
                  </span>
                  <span>Active Ideas</span>
                </label>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.showArchived}
                    onChange={() => handleFilterToggle('showArchived')}
                  />
                  <span className="filter-checkbox">
                    {filters.showArchived && <Check size={14} />}
                  </span>
                  <span>Archived Ideas</span>
                </label>
              </div>
            )}
          </div>
          <button onClick={onRefresh} className="refresh-button">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button onClick={onCreate} className="create-button">
            <Plus size={16} />
            <span>New Idea</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={onRefresh}>Retry</button>
        </div>
      )}

      {loading && (
        <div className="loading-state">
          <Loader2 className="spinner" size={40} />
          <p>Loading ideas...</p>
        </div>
      )}

      {!loading && !error && ideas.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">💡</div>
          <h2>No ideas yet</h2>
          <p>Create your first idea to get started!</p>
          <button onClick={onCreate} className="create-button">
            <Plus size={18} />
            <span>Create Idea</span>
          </button>
        </div>
      )}

      {!loading && ideas.length > 0 && (
        <>
          <div className="ideas-grid">
            {ideas.map((idea) => (
              <div 
                key={idea.id} 
                className={`idea-card ${idea.archived ? 'archived' : ''}`} 
                onClick={() => onView(idea)}
              >
                <div className="idea-card-header">
                  <div className="idea-title-row">
                    <h3>{idea.title}</h3>
                    {idea.archived && (isSearching || filters.showArchived) && (
                      <span className="archived-badge">
                        <Archive size={12} />
                        Archived
                      </span>
                    )}
                  </div>
                  <div className="idea-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(idea);
                      }}
                      className="icon-button"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(idea.id);
                      }}
                      className="icon-button delete"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {idea.content && (
                  <p className={`idea-content ${idea.archived ? 'archived-content' : ''}`}>
                    {idea.content}
                  </p>
                )}

                {idea.tags && idea.tags.length > 0 && (
                  <div className="idea-tags">
                    {idea.tags.slice(0, 4).map((tag, idx) => (
                      <span key={idx} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="idea-footer">
                  <span className="idea-date">
                    {new Date(idea.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {loadingMore && (
            <div className="loading-more-state">
              <Loader2 className="spinner" size={24} />
              <p>Loading more ideas...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
