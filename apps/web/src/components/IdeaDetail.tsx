import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ChevronLeft, MoreVertical, Edit, Archive, ArchiveRestore, Trash2, ChevronDown, ChevronRight, Sparkles, RefreshCw, Loader2, Download } from 'lucide-react';
import { type Idea } from '@idea-vault/shared';
import { DropdownMenu, DropdownMenuItem } from './DropdownMenu';
import { apiClient } from '../lib/apiClient';
import './IdeaDetail.css';

interface IdeaDetailProps {
  idea: Idea;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onClose: () => void;
  onRegenerate?: (idea: Idea) => Promise<void>;
  onIdeaUpdated?: (idea: Idea) => void;
  isGeneratingReport?: boolean;
}

export function IdeaDetail({ idea, onEdit, onDelete, onArchive, onRegenerate, onIdeaUpdated, isGeneratingReport = false }: IdeaDetailProps) {
  const navigate = useNavigate();
  const [regenerating, setRegenerating] = useState(false);
  const [isReportExpanded, setIsReportExpanded] = useState(true);
  const [isRoadmapExpanded, setIsRoadmapExpanded] = useState(true);
  const [isValidationRoadmapExpanded, setIsValidationRoadmapExpanded] = useState(true);
  const [regeneratingRoadmap, setRegeneratingRoadmap] = useState(false);
  const [regeneratingValidationRoadmap, setRegeneratingValidationRoadmap] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const roadmapRef = useRef<HTMLDivElement>(null);
  const validationRoadmapRef = useRef<HTMLDivElement>(null);

  const handleRegenerate = async () => {
    if (!onRegenerate) return;
    
    setRegenerating(true);
    setRegeneratingRoadmap(true);
    setRegeneratingValidationRoadmap(true);
    try {
      // Regenerate all three reports in parallel
      type ReportResult = { report: string; idea: Idea } | null;
      type RoadmapResult = { roadmap: string; idea: Idea } | null;
      type ValidationRoadmapResult = { validationRoadmap: string; idea: Idea } | null;
      
      const safeGenerateReport = async (): Promise<ReportResult> => {
        try {
          const result = await apiClient.ideas.generateReport(idea.id) as { report: string; idea: Idea };
          return result;
        } catch {
          return null;
        }
      };
      
      const safeGenerateRoadmap = async (): Promise<RoadmapResult> => {
        try {
          const result = await apiClient.ideas.generateRoadmap(idea.id) as { roadmap: string; idea: Idea };
          return result;
        } catch {
          return null;
        }
      };
      
      const safeGenerateValidationRoadmap = async (): Promise<ValidationRoadmapResult> => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          const result = await apiClient.ideas.generateValidationRoadmap(idea.id) as { validationRoadmap: string; idea: Idea };
          return result;
        } catch {
          return null;
        }
      };
      
      const [reportResult, roadmapResult, validationRoadmapResult] = await Promise.all([
        safeGenerateReport(),
        safeGenerateRoadmap(),
        safeGenerateValidationRoadmap(),
      ]);
      
      // Use the last successful result (validation roadmap should have all reports)
      const finalIdea: Idea | undefined = validationRoadmapResult?.idea ?? roadmapResult?.idea ?? reportResult?.idea;
      if (finalIdea && onIdeaUpdated) {
        onIdeaUpdated(finalIdea);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to regenerate reports';
      alert(errorMessage);
    } finally {
      setRegenerating(false);
      setRegeneratingRoadmap(false);
      setRegeneratingValidationRoadmap(false);
    }
  };

  const downloadPDF = async (title: string, ref: React.RefObject<HTMLDivElement | null>) => {
    try {
      // Import jsPDF - v2.x uses named export
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      
      if (!ref.current) return;

      // Get the rendered markdown content from the ref
      const contentElement = ref.current.querySelector('.report-content');
      if (!contentElement) return;

      // Clone the element to avoid affecting the original
      const clonedElement = contentElement.cloneNode(true) as HTMLElement;
      
      // Create a temporary container for the content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '800px';
      tempDiv.style.padding = '40px';
      tempDiv.style.backgroundColor = '#ffffff';
      tempDiv.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      tempDiv.style.color = '#374151';
      tempDiv.style.fontSize = '15px';
      tempDiv.style.lineHeight = '1.7';
      
      // Set styles for the temporary container
      tempDiv.style.cssText = `
        position: absolute;
        left: -9999px;
        width: 800px;
        padding: 40px;
        background-color: #ffffff;
        font-family: system-ui, -apple-system, sans-serif;
        color: #374151;
        font-size: 15px;
        line-height: 1.7;
      `;
      
      tempDiv.appendChild(clonedElement);
      document.body.appendChild(tempDiv);

      // Convert to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      // Remove temp element
      document.body.removeChild(tempDiv);

      // Create PDF with margins
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Define margins (15mm on all sides for better readability)
      const margin = 15;
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);

      // Calculate image dimensions to fit within margins (maintain aspect ratio)
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Calculate total number of pages needed
      const totalPages = Math.ceil(imgHeight / contentHeight);

      // Calculate pixels per mm for accurate conversion
      // canvas.width in pixels corresponds to imgWidth in mm
      const pixelsPerMm = canvas.width / imgWidth;
      const pixelsPerPage = contentHeight * pixelsPerMm;

      // Split the canvas into page-sized chunks and add each to the PDF
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }
        
        // Calculate the source region for this page in pixels
        const sourceY = Math.floor(page * pixelsPerPage);
        const remainingHeight = canvas.height - sourceY;
        const sourceHeight = Math.min(Math.ceil(pixelsPerPage), remainingHeight);
        
        // Create a temporary canvas for this page's content
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;
        const pageCtx = pageCanvas.getContext('2d');
        
        if (pageCtx) {
          // Fill with white background
          pageCtx.fillStyle = '#ffffff';
          pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          
          // Draw the portion of the original canvas for this page
          pageCtx.drawImage(
            canvas,
            0, sourceY, canvas.width, sourceHeight, // source region
            0, 0, canvas.width, sourceHeight // destination
          );
          
          // Convert to image data
          const pageImgData = pageCanvas.toDataURL('image/png');
          
          // Calculate the height of this page's image in mm
          const pageImgHeight = (sourceHeight / pixelsPerMm);
          
          // Add to PDF at the top margin
          pdf.addImage(pageImgData, 'PNG', margin, margin, imgWidth, pageImgHeight);
        }
      }

      // Save PDF
      pdf.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
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
                disabled={regenerating || regeneratingRoadmap}
              >
                {(regenerating || regeneratingRoadmap || regeneratingValidationRoadmap) ? (
                  <>
                    <RefreshCw size={16} className="spinning" />
                    <span>Regenerating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Regenerate Reports</span>
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

        {/* Show loading state when report is being generated */}
        {isGeneratingReport && !idea.ai_report && (
          <div className="detail-content ai-report-generating">
            <div className="report-generating-content">
              <Loader2 className="spinner" size={24} />
              <div className="report-generating-text">
                <h3>Generating AI Report</h3>
                <p>Our AI is analyzing your idea and creating a comprehensive report. This usually takes a few seconds...</p>
              </div>
            </div>
          </div>
        )}

        {/* Show report when it's available */}
        {idea.ai_report && (
          <div className="detail-content ai-report" ref={reportRef}>
            <div className="report-header">
              <div className="report-header-content">
                <h3>Startup Idea Analysis Report</h3>
                <p className="report-subtitle">
                  Comprehensive analysis including market validation, target users, implementation considerations, and recommendations
                </p>
              </div>
              <div className="report-header-actions">
                <button
                  className="report-download"
                  onClick={() => {
                    void downloadPDF(`${idea.title}_Analysis_Report`, reportRef);
                  }}
                  title="Download as PDF"
                  aria-label="Download report as PDF"
                >
                  <Download size={18} />
                </button>
                <button
                  className="report-toggle"
                  onClick={() => setIsReportExpanded(!isReportExpanded)}
                  aria-label={isReportExpanded ? 'Collapse report' : 'Expand report'}
                >
                  {isReportExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>
              </div>
            </div>
            {isReportExpanded && (
              <div className="report-content">
                <ReactMarkdown>{idea.ai_report}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {/* Show roadmap when it's available */}
        {idea.ai_roadmap && (
          <div className="detail-content ai-report ai-roadmap" ref={roadmapRef}>
            <div className="report-header">
              <div className="report-header-content">
                <h3>Product Roadmap</h3>
                <p className="report-subtitle">
                  Practical product roadmap with MVP scope, user flows, validation milestones, and iteration plans
                </p>
              </div>
              <div className="report-header-actions">
                <button
                  className="report-download"
                  onClick={() => {
                    void downloadPDF(`${idea.title}_Product_Roadmap`, roadmapRef);
                  }}
                  title="Download as PDF"
                  aria-label="Download roadmap as PDF"
                >
                  <Download size={18} />
                </button>
                <button
                  className="report-toggle"
                  onClick={() => setIsRoadmapExpanded(!isRoadmapExpanded)}
                  aria-label={isRoadmapExpanded ? 'Collapse roadmap' : 'Expand roadmap'}
                >
                  {isRoadmapExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>
              </div>
            </div>
            {isRoadmapExpanded && (
              <div className="report-content">
                <ReactMarkdown>{idea.ai_roadmap}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {/* Show validation roadmap when it's available */}
        {idea.ai_validation_roadmap && (
          <div className="detail-content ai-report ai-validation-roadmap" ref={validationRoadmapRef}>
            <div className="report-header">
              <div className="report-header-content">
                <h3>Validation Roadmap</h3>
                <p className="report-subtitle">
                  Idea-specific validation roadmap with hypotheses, experiments, and decision rules
                </p>
              </div>
              <div className="report-header-actions">
                <button
                  className="report-download"
                  onClick={() => {
                    void downloadPDF(`${idea.title}_Validation_Roadmap`, validationRoadmapRef);
                  }}
                  title="Download as PDF"
                  aria-label="Download validation roadmap as PDF"
                >
                  <Download size={18} />
                </button>
                <button
                  className="report-toggle"
                  onClick={() => setIsValidationRoadmapExpanded(!isValidationRoadmapExpanded)}
                  aria-label={isValidationRoadmapExpanded ? 'Collapse validation roadmap' : 'Expand validation roadmap'}
                >
                  {isValidationRoadmapExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>
              </div>
            </div>
            {isValidationRoadmapExpanded && (
              <div className="report-content">
                <ReactMarkdown>{idea.ai_validation_roadmap}</ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
