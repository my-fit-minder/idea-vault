import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { ideasService } from '../services/ideasService.js';
import { aiService } from '../services/aiService.js';
import type { CreateIdeaInput, UpdateIdeaInput, PaginationParams } from '@idea-vault/shared';

export const ideasRouter = Router();

// All routes require authentication
ideasRouter.use(authenticate);

// GET /api/ideas - Get ideas for the authenticated user (with optional pagination)
ideasRouter.get('/', async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check if pagination parameters are provided
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
  const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;
  
  // Extract archived filter
  const archived = req.query.archived !== undefined 
    ? req.query.archived === 'true' 
    : undefined;

  // Extract search query
  const search = req.query.search ? (req.query.search as string).trim() : undefined;

  // If pagination params are provided, use paginated endpoint
  if (limit !== undefined || offset !== undefined) {
    const paginationParams: PaginationParams = {
      limit: limit ?? 20,
      offset: offset ?? 0,
      archived,
      search: search && search.length > 0 ? search : undefined,
    };

    const result = await ideasService.getIdeasPaginated(req.user.id, paginationParams);
    return res.json(result);
  }

  // Otherwise, return all ideas (backward compatibility)
  const ideas = await ideasService.getAllIdeas(req.user.id, archived);
  res.json(ideas);
});

/**
 * Generate all AI reports in the background and update the idea when complete
 * This runs asynchronously and doesn't block the API response
 * Generates: Analysis Report, Product Roadmap, and Validation Roadmap
 */
function generateReportsInBackground(
  ideaId: string,
  userId: string,
  ideaData: { title: string; content: string | null; ai_context: string | null; tags: string[] }
): void {
  // Use setImmediate to ensure this runs after the response is sent
  setImmediate(async () => {
    const input = {
      title: ideaData.title,
      content: ideaData.content,
      ai_context: ideaData.ai_context,
      tags: ideaData.tags,
    };

    // Generate all three reports in parallel
    const reportPromises = [
      aiService.generateReport(input).then(
        async (report) => {
          await ideasService.updateIdea(ideaId, { ai_report: report }, userId);
          console.log(`✅ Successfully generated AI report for idea ${ideaId}`);
        }
      ).catch((error: any) => {
        console.error(`❌ Failed to generate AI report for idea ${ideaId}:`, error.message);
      }),
      
      aiService.generateRoadmap(input).then(
        async (roadmap) => {
          await ideasService.updateIdea(ideaId, { ai_roadmap: roadmap }, userId);
          console.log(`✅ Successfully generated product roadmap for idea ${ideaId}`);
        }
      ).catch((error: any) => {
        console.error(`❌ Failed to generate product roadmap for idea ${ideaId}:`, error.message);
      }),
      
      aiService.generateValidationRoadmap(input).then(
        async (validationRoadmap) => {
          await ideasService.updateIdea(ideaId, { ai_validation_roadmap: validationRoadmap }, userId);
          console.log(`✅ Successfully generated validation roadmap for idea ${ideaId}`);
        }
      ).catch((error: any) => {
        console.error(`❌ Failed to generate validation roadmap for idea ${ideaId}:`, error.message);
      }),
    ];

    // Wait for all reports to complete (or fail)
    await Promise.allSettled(reportPromises);
    console.log(`📊 Completed all report generation attempts for idea ${ideaId}`);
  });
}

// POST /api/ideas - Create a new idea
ideasRouter.post('/', async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const input: CreateIdeaInput = req.body;

  if (!input.title || input.title.trim().length === 0) {
    return res.status(400).json({ error: 'Title is required' });
  }

  if (input.title.length > 50) {
    return res.status(400).json({ error: 'Title must be 50 characters or less' });
  }

  if (input.content && input.content.length > 1000) {
    return res.status(400).json({ error: 'Description must be 1000 characters or less' });
  }

  // Create the idea first
  const idea = await ideasService.createIdea(input, req.user.id);

  // Start all AI reports generation in the background (non-blocking)
  // The response is sent immediately, and the reports will be added when ready
  generateReportsInBackground(idea.id, req.user.id, {
    title: idea.title,
    content: idea.content,
    ai_context: idea.ai_context,
    tags: idea.tags,
  });

  // Return immediately with the idea (without waiting for AI report)
  res.status(201).json(idea);
});

// POST /api/ideas/:id/generate-report - Generate AI report for an idea
// This must come before /:id routes to avoid route conflicts
ideasRouter.post('/:id/generate-report', async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get the idea first to verify ownership
    const idea = await ideasService.getIdeaById(req.params.id as string, req.user.id);
    
    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    // Generate the AI report
    const report = await aiService.generateReport({
      title: idea.title,
      content: idea.content,
      ai_context: idea.ai_context,
      tags: idea.tags,
    });

    // Update the idea with the generated report
    const updatedIdea = await ideasService.updateIdea(
      req.params.id as string,
      { ai_report: report },
      req.user.id
    );

    res.json({ report, idea: updatedIdea });
  } catch (error: any) {
    console.error('Error generating report:', error);
    
    // Check if it's a service unavailable error
    const isServiceUnavailable = error.message?.includes('currently unavailable');
    
    if (isServiceUnavailable) {
      return res.status(503).json({ 
        error: error.message || 'Google Gemini model is currently unavailable. Please try again in a few moments.' 
      });
    }
    
    res.status(500).json({ error: error.message || 'Failed to generate AI report' });
  }
});

// POST /api/ideas/:id/generate-roadmap - Generate AI product roadmap for an idea
// This must come before /:id routes to avoid route conflicts
ideasRouter.post('/:id/generate-roadmap', async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get the idea first to verify ownership
    const idea = await ideasService.getIdeaById(req.params.id as string, req.user.id);
    
    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    // Generate the AI product roadmap
    const roadmap = await aiService.generateRoadmap({
      title: idea.title,
      content: idea.content,
      ai_context: idea.ai_context,
      tags: idea.tags,
    });

    // Update the idea with the generated roadmap
    const updatedIdea = await ideasService.updateIdea(
      req.params.id as string,
      { ai_roadmap: roadmap },
      req.user.id
    );

    res.json({ roadmap, idea: updatedIdea });
  } catch (error: any) {
    console.error('Error generating roadmap:', error);
    
    // Check if it's a service unavailable error
    const isServiceUnavailable = error.message?.includes('currently unavailable');
    
    if (isServiceUnavailable) {
      return res.status(503).json({ 
        error: error.message || 'Google Gemini model is currently unavailable. Please try again in a few moments.' 
      });
    }
    
    res.status(500).json({ error: error.message || 'Failed to generate AI roadmap' });
  }
});

// POST /api/ideas/:id/generate-validation-roadmap - Generate AI validation roadmap for an idea
// This must come before /:id routes to avoid route conflicts
ideasRouter.post('/:id/generate-validation-roadmap', async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get the idea first to verify ownership
    const idea = await ideasService.getIdeaById(req.params.id as string, req.user.id);
    
    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    // Generate the AI validation roadmap
    const validationRoadmap = await aiService.generateValidationRoadmap({
      title: idea.title,
      content: idea.content,
      ai_context: idea.ai_context,
      tags: idea.tags,
    });

    // Update the idea with the generated validation roadmap
    const updatedIdea = await ideasService.updateIdea(
      req.params.id as string,
      { ai_validation_roadmap: validationRoadmap },
      req.user.id
    );

    res.json({ validationRoadmap, idea: updatedIdea });
  } catch (error: any) {
    console.error('Error generating validation roadmap:', error);
    
    // Check if it's a service unavailable error
    const isServiceUnavailable = error.message?.includes('currently unavailable');
    
    if (isServiceUnavailable) {
      return res.status(503).json({ 
        error: error.message || 'Google Gemini model is currently unavailable. Please try again in a few moments.' 
      });
    }
    
    res.status(500).json({ error: error.message || 'Failed to generate AI validation roadmap' });
  }
});

// GET /api/ideas/:id - Get a specific idea
ideasRouter.get('/:id', async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const idea = await ideasService.getIdeaById(req.params.id as string, req.user.id);
  
  if (!idea) {
    return res.status(404).json({ error: 'Idea not found' });
  }

  res.json(idea);
});

// PUT /api/ideas/:id - Update an idea
ideasRouter.put('/:id', async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const input: UpdateIdeaInput = req.body;

  if (input.title !== undefined && input.title.trim().length === 0) {
    return res.status(400).json({ error: 'Title cannot be empty' });
  }

  if (input.title !== undefined && input.title.length > 50) {
    return res.status(400).json({ error: 'Title must be 50 characters or less' });
  }

  if (input.content !== undefined && input.content.length > 1000) {
    return res.status(400).json({ error: 'Description must be 1000 characters or less' });
  }

  const idea = await ideasService.updateIdea(req.params.id as string, input, req.user.id);
  res.json(idea);
});

// POST /api/ideas/:id/archive - Archive/unarchive an idea
ideasRouter.post('/:id/archive', async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const idea = await ideasService.archiveIdea(req.params.id as string, req.user.id);
    res.json(idea);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to archive idea' });
  }
});

// DELETE /api/ideas/:id - Soft delete an idea
ideasRouter.delete('/:id', async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await ideasService.deleteIdea(req.params.id as string, req.user.id);
  res.status(204).send();
});
