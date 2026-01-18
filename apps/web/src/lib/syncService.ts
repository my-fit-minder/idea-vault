// Service for web app - direct API calls only (no offline storage)
import { apiClient } from './apiClient';
import type { Idea, CreateIdeaInput, UpdateIdeaInput, PaginationParams, PaginatedResponse } from '@idea-vault/shared';

class SyncService {
  async getIdeas(archived?: boolean): Promise<Idea[]> {
    return apiClient.ideas.getAll(archived);
  }

  async getIdeasPaginated(params?: PaginationParams): Promise<PaginatedResponse<Idea>> {
    return apiClient.ideas.getAllPaginated(params);
  }

  async createIdea(data: CreateIdeaInput): Promise<Idea> {
    return apiClient.ideas.create(data);
  }

  async updateIdea(id: string, data: UpdateIdeaInput): Promise<Idea> {
    return apiClient.ideas.update(id, data);
  }

  async deleteIdea(id: string): Promise<void> {
    await apiClient.ideas.delete(id);
  }

  async archiveIdea(id: string): Promise<Idea> {
    return apiClient.ideas.archive(id);
  }
}

export const syncService = new SyncService();
