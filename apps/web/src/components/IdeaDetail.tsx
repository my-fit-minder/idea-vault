import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { type Idea } from '@idea-vault/shared';
import { DropdownMenu, DropdownMenuItem } from './DropdownMenu';
import './IdeaDetail.css';

interface IdeaDetailProps {
  idea: Idea;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onClose: () => void;
  onRegenerate?: (idea: Idea) => Promise<void>;
}

export function IdeaDetail({ idea, onEdit, onDelete, onArchive, onRegenerate }: IdeaDetailProps) {
  const navigate = useNavigate();
  const [regenerating, setRegenerating] = useState(false);
  const [isReportExpanded, setIsReportExpanded] = useState(true);

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
          <div className="detail-header-left">
            <button 
              onClick={() => {
                void navigate(-1);
              }}
              className="back-button"
              title="Go back"
            >
              ← Back
            </button>
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
          </div>
          <div className="detail-actions">
            {onRegenerate && (
              <button 
                onClick={() => {
                  void handleRegenerate();
                }}
                className="action-button regenerate"
                disabled={regenerating}
              >
                {regenerating ? '🔄 Regenerating...' : '🤖 Regenerate AI Report'}
              </button>
            )}
            <DropdownMenu trigger={<span>⋮</span>}>
              <DropdownMenuItem icon="✏️" onClick={onEdit}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                icon={idea.archived ? "📦" : "📦"} 
                onClick={onArchive}
              >
                {idea.archived ? 'Unarchive' : 'Archive'}
              </DropdownMenuItem>
              <DropdownMenuItem icon="🗑️" onClick={onDelete} danger>
                Delete
              </DropdownMenuItem>
            </DropdownMenu>
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
            <div className="report-header">
              <div className="report-header-content">
                <h3>Startup Idea Analysis Report</h3>
                <p className="report-subtitle">
                  Comprehensive analysis including market validation, target users, implementation considerations, and recommendations
                </p>
              </div>
              <button
                className="report-toggle"
                onClick={() => setIsReportExpanded(!isReportExpanded)}
                aria-label={isReportExpanded ? 'Collapse report' : 'Expand report'}
              >
                {isReportExpanded ? '▼' : '▶'}
              </button>
            </div>
            {isReportExpanded && (
              <div className="report-content">
                <ReactMarkdown>{idea.ai_report}</ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
