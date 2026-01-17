import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ChevronLeft, MoreVertical, Edit, Archive, ArchiveRestore, Trash2, ChevronDown, ChevronRight, Sparkles, RefreshCw } from 'lucide-react';
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
              <ChevronLeft size={20} />
            </button>
            <div className="title-container">
              <h1>{idea.title}</h1>
              <div className="detail-meta">
                <span className="detail-date">
                  Created: {new Date(idea.created_at).toLocaleDateString()}
                </span>
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
                {regenerating ? (
                  <>
                    <RefreshCw size={16} className="spinning" />
                    <span>Regenerating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Regenerate AI Report</span>
                  </>
                )}
              </button>
            )}
            <DropdownMenu trigger={<MoreVertical size={20} />}>
              <DropdownMenuItem icon={<Edit size={16} />} onClick={onEdit}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                icon={idea.archived ? <ArchiveRestore size={16} /> : <Archive size={16} />} 
                onClick={onArchive}
              >
                {idea.archived ? 'Unarchive' : 'Archive'}
              </DropdownMenuItem>
              <DropdownMenuItem icon={<Trash2 size={16} />} onClick={onDelete} danger>
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
                {isReportExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
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
