import { type Idea } from '@idea-vault/shared';
import './IdeasList.css';

interface IdeasListProps {
  ideas: Idea[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreate: () => void;
  onEdit: (idea: Idea) => void;
  onView: (idea: Idea) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export function IdeasList({
  ideas,
  loading,
  error,
  searchQuery,
  onSearchChange,
  onCreate,
  onEdit,
  onView,
  onDelete,
  onRefresh,
}: IdeasListProps) {
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
          <button onClick={onRefresh} className="refresh-button">
            🔄 Refresh
          </button>
          <button onClick={onCreate} className="create-button">
            + New Idea
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
          <div className="spinner"></div>
          <p>Loading ideas...</p>
        </div>
      )}

      {!loading && !error && ideas.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">💡</div>
          <h2>No ideas yet</h2>
          <p>Create your first idea to get started!</p>
          <button onClick={onCreate} className="create-button">
            + Create Idea
          </button>
        </div>
      )}

      {!loading && ideas.length > 0 && (
        <div className="ideas-grid">
          {ideas.map((idea) => (
            <div key={idea.id} className="idea-card" onClick={() => onView(idea)}>
              <div className="idea-card-header">
                <h3>{idea.title}</h3>
                <div className="idea-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(idea);
                    }}
                    className="icon-button"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(idea.id);
                    }}
                    className="icon-button delete"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {idea.content && (
                <p className="idea-content">
                  {idea.content.length > 150
                    ? `${idea.content.substring(0, 150)}...`
                    : idea.content}
                </p>
              )}

              {idea.tags && idea.tags.length > 0 && (
                <div className="idea-tags">
                  {idea.tags.map((tag, idx) => (
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
      )}
    </div>
  );
}
