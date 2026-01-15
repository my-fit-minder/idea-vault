import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { type Idea } from '@idea-vault/shared';
import './IdeaDetail.css';

interface IdeaDetailProps {
  idea: Idea;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  onRegenerate?: (idea: Idea) => Promise<void>;
}

export function IdeaDetail({ idea, onEdit, onDelete, onClose, onRegenerate }: IdeaDetailProps) {
  const [regenerating, setRegenerating] = useState(false);

  const handleRegenerate = async () => {
    if (!onRegenerate) return;
    
    setRegenerating(true);
    try {
      await onRegenerate(idea);
    } catch (error) {
      console.error('Failed to regenerate AI report:', error);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="idea-detail-container">
      <div className="idea-detail-card">
        <div className="detail-header">
          <div>
            <h1>{idea.title}</h1>
            <div className="detail-meta">
              <span className="detail-date">
                Created: {new Date(idea.created_at).toLocaleString()}
              </span>
              {idea.updated_at !== idea.created_at && (
                <span className="detail-date">
                  Updated: {new Date(idea.updated_at).toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <div className="detail-actions">
            {onRegenerate && (
              <button 
                onClick={handleRegenerate} 
                className="action-button regenerate"
                disabled={regenerating}
              >
                {regenerating ? '🔄 Regenerating...' : '🤖 Regenerate AI Report'}
              </button>
            )}
            <button onClick={onEdit} className="action-button edit">
              ✏️ Edit
            </button>
            <button onClick={onDelete} className="action-button delete">
              🗑️ Delete
            </button>
            <button onClick={onClose} className="action-button close">
              ✕ Close
            </button>
          </div>
        </div>

        {idea.content && (
          <div className="detail-content">
            <h3>Description</h3>
            <div className="content-text">{idea.content}</div>
          </div>
        )}

        {idea.ai_context && (
          <div className="detail-content ai-context">
            <h3>
              AI Context
              <span className="context-badge">For AI Reference</span>
            </h3>
            <div className="content-text context-text">{idea.ai_context}</div>
            <p className="context-note">
              This additional context helps AI generate better descriptions with correct understanding.
            </p>
          </div>
        )}

        {idea.tags && idea.tags.length > 0 && (
          <div className="detail-tags">
            <h3>Tags</h3>
            <div className="tags-list">
              {idea.tags.map((tag, idx) => (
                <span key={idx} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {idea.ai_report && (
          <div className="detail-content ai-report">
            <h3>AI Generated Report</h3>
            <div className="report-content">
              <ReactMarkdown>{idea.ai_report}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
