import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { ideasService } from '../services/ideasService.js';
import { aiService } from '../services/aiService.js';
import type { CreateIdeaInput, UpdateIdeaInput } from '@idea-vault/shared';

export const ideasRouter = Router();

// All routes require authentication
ideasRouter.use(authenticate);

// GET /api/ideas - Get all ideas for the authenticated user
ideasRouter.get('/', async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const ideas = await ideasService.getAllIdeas(req.user.id);
  res.json(ideas);
});

// POST /api/ideas - Create a new idea
ideasRouter.post('/', async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const input: CreateIdeaInput = req.body;

  if (!input.title || input.title.trim().length === 0) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const idea = await ideasService.createIdea(input, req.user.id);
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
    const idea = await ideasService.getIdeaById(req.params.id, req.user.id);
    
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
      req.params.id,
      { ai_report: report },
      req.user.id
    );

    res.json({ report, idea: updatedIdea });
  } catch (error: any) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: error.message || 'Failed to generate AI report' });
  }
});

// GET /api/ideas/:id - Get a specific idea
ideasRouter.get('/:id', async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const idea = await ideasService.getIdeaById(req.params.id, req.user.id);
  
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

  const idea = await ideasService.updateIdea(req.params.id, input, req.user.id);
  res.json(idea);
});

// DELETE /api/ideas/:id - Delete an idea
ideasRouter.delete('/:id', async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await ideasService.deleteIdea(req.params.id, req.user.id);
  res.status(204).send();
});
