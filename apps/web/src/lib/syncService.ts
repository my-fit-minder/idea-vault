// Service for web app - direct API calls only (no offline storage)
import { apiClient } from './apiClient';
import type { Idea, CreateIdeaInput, UpdateIdeaInput } from '@idea-vault/shared';

class SyncService {
  async getIdeas(): Promise<Idea[]> {
    const ideas = await apiClient.ideas.getAll();
    // Ensure backward compatibility: add default values for archived and deleted if missing
    return ideas.map(idea => ({
      ...idea,
      archived: idea.archived ?? false,
      deleted: idea.deleted ?? false,
    }));
  }

  async createIdea(data: CreateIdeaInput): Promise<Idea> {
    const idea = await apiClient.ideas.create(data);
    // Ensure backward compatibility
    return {
      ...idea,
      archived: idea.archived ?? false,
      deleted: idea.deleted ?? false,
    };
  }

  async updateIdea(id: string, data: UpdateIdeaInput): Promise<Idea> {
    const idea = await apiClient.ideas.update(id, data);
    // Ensure backward compatibility
    return {
      ...idea,
      archived: idea.archived ?? false,
      deleted: idea.deleted ?? false,
    };
  }

  async deleteIdea(id: string): Promise<void> {
    await apiClient.ideas.delete(id);
  }

  async archiveIdea(id: string): Promise<Idea> {
    const idea = await apiClient.ideas.archive(id);
    // Ensure backward compatibility
    return {
      ...idea,
      archived: idea.archived ?? false,
      deleted: idea.deleted ?? false,
    };
  }
}

export const syncService = new SyncService();
