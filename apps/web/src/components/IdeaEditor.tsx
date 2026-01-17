import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { syncService } from "../lib/syncService";
import type {
  Idea,
  CreateIdeaInput,
  UpdateIdeaInput,
} from "@idea-vault/shared";
import "./IdeaEditor.css";

interface IdeaEditorProps {
  idea?: Idea;
  onSave: () => void;
  onCancel: () => void;
}

export function IdeaEditor({ idea, onSave, onCancel }: IdeaEditorProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(idea?.title || "");
  const [content, setContent] = useState(idea?.content || "");
  const [aiContext, setAiContext] = useState(idea?.ai_context || "");
  const [tags, setTags] = useState<string[]>(idea?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (idea) {
        const input: UpdateIdeaInput = {
          title,
          content: content || undefined,
          ai_context: aiContext || undefined,
          tags,
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        await syncService.updateIdea(idea.id, input);
      } else {
        const input: CreateIdeaInput = {
          title,
          content: content || undefined,
          ai_context: aiContext || undefined,
          tags,
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        await syncService.createIdea(input);
      }
      onSave();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save idea";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="idea-editor-container">
      <div className="idea-editor-card">
        <div className="editor-header">
          <button 
            onClick={() => {
              void navigate(-1);
            }} 
            className="back-button"
            title="Go back"
          >
            ← Back
          </button>
          <h2>{idea ? "Edit Idea" : "Create New Idea"}</h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e).catch((err) => {
              const errorMessage =
                err instanceof Error ? err.message : "Failed to save idea";
              setError(errorMessage);
            });
          }}
          className="editor-form"
        >
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter idea title..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Description</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your idea..."
              rows={5}
            />
          </div>

          <div className="form-group">
            <label htmlFor="ai_context">
              Additional Description for AI Context
              <span className="field-hint">
                (Optional - helps AI generate better descriptions)
              </span>
            </label>
            <textarea
              id="ai_context"
              className="ai-context-textarea"
              value={aiContext}
              onChange={(e) => setAiContext(e.target.value)}
              placeholder="Optional: Add context to help AI generate accurate descriptions. Use this if AI misunderstands your idea, or edit the description directly above."
              rows={2}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <div className="tags-input-container">
              <input
                id="tags"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Add a tag and press Enter"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="add-tag-button"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="tags-list">
                {tags.map((tag, idx) => (
                  <span key={idx} className="tag">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="remove-tag"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="editor-actions">
            <button
              type="button"
              onClick={onCancel}
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-button"
              disabled={loading || !title.trim()}
            >
              {loading ? "Saving..." : idea ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
