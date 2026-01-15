// Sync service for web app
import { apiClient } from './apiClient';
import { offlineStorage } from './offlineStorage';
import type { Idea, CreateIdeaInput, UpdateIdeaInput } from '@idea-vault/shared';

// Re-export types and services from shared package
export { offlineStorage } from './offlineStorage';

class SyncService {
  private isSyncing = false;

  async sync(): Promise<{ synced: number; errors: number }> {
    if (this.isSyncing || !navigator.onLine) {
      return { synced: 0, errors: 0 };
    }

    this.isSyncing = true;
    let synced = 0;
    let errors = 0;

    try {
      const queue = await offlineStorage.getSyncQueue();
      
      for (const operation of queue) {
        try {
          switch (operation.type) {
            case 'create':
              if (operation.data) {
                await apiClient.ideas.create(operation.data as any);
                synced++;
              }
              break;
            case 'update':
              if (operation.ideaId && operation.data) {
                await apiClient.ideas.update(operation.ideaId, operation.data);
                synced++;
              }
              break;
            case 'delete':
              if (operation.ideaId) {
                await apiClient.ideas.delete(operation.ideaId);
                synced++;
              }
              break;
          }
          await offlineStorage.removeFromSyncQueue(operation.id);
        } catch (error) {
          console.error('Failed to sync operation:', operation, error);
          errors++;
        }
      }

      if (synced > 0) {
        const ideas = await apiClient.ideas.getAll();
        await offlineStorage.saveIdeas(ideas);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      errors++;
    } finally {
      this.isSyncing = false;
    }

    return { synced, errors };
  }

  async getIdeasWithOfflineSupport(): Promise<Idea[]> {
    try {
      if (navigator.onLine) {
        const ideas = await apiClient.ideas.getAll();
        await offlineStorage.saveIdeas(ideas);
        return ideas;
      } else {
        return await offlineStorage.getIdeas();
      }
    } catch (error) {
      console.error('Failed to fetch ideas, using offline storage:', error);
      return await offlineStorage.getIdeas();
    }
  }

  async createIdeaWithOfflineSupport(data: any): Promise<Idea> {
    try {
      if (navigator.onLine) {
        const idea = await apiClient.ideas.create(data);
        const ideas = await apiClient.ideas.getAll();
        await offlineStorage.saveIdeas(ideas);
        return idea;
      } else {
        await offlineStorage.addToSyncQueue({ type: 'create', data });
        const localIdeas = await offlineStorage.getIdeas();
        const localIdea: Idea = {
          id: `local-${Date.now()}`,
          user_id: 'local',
          title: data.title,
          content: data.content || null,
          ai_context: data.ai_context || null,
          ai_report: data.ai_report || null,
          tags: data.tags || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          synced_at: null,
        };
        localIdeas.push(localIdea);
        await offlineStorage.saveIdeas(localIdeas);
        return localIdea;
      }
    } catch (error) {
      await offlineStorage.addToSyncQueue({ type: 'create', data });
      throw error;
    }
  }

  async updateIdeaWithOfflineSupport(id: string, data: any): Promise<Idea> {
    try {
      if (navigator.onLine) {
        const idea = await apiClient.ideas.update(id, data);
        const ideas = await apiClient.ideas.getAll();
        await offlineStorage.saveIdeas(ideas);
        return idea;
      } else {
        await offlineStorage.addToSyncQueue({ type: 'update', ideaId: id, data });
        const localIdeas = await offlineStorage.getIdeas();
        const index = localIdeas.findIndex((i) => i.id === id);
        if (index !== -1) {
          localIdeas[index] = { 
            ...localIdeas[index], 
            ...data, 
            ai_context: data.ai_context !== undefined ? data.ai_context : localIdeas[index].ai_context,
            ai_report: data.ai_report !== undefined ? data.ai_report : localIdeas[index].ai_report,
            updated_at: new Date().toISOString() 
          };
          await offlineStorage.saveIdeas(localIdeas);
          return localIdeas[index];
        }
        throw new Error('Idea not found');
      }
    } catch (error) {
      await offlineStorage.addToSyncQueue({ type: 'update', ideaId: id, data });
      throw error;
    }
  }

  async deleteIdeaWithOfflineSupport(id: string): Promise<void> {
    try {
      if (navigator.onLine) {
        await apiClient.ideas.delete(id);
        const ideas = await apiClient.ideas.getAll();
        await offlineStorage.saveIdeas(ideas);
      } else {
        await offlineStorage.addToSyncQueue({ type: 'delete', ideaId: id });
        const localIdeas = await offlineStorage.getIdeas();
        const filtered = localIdeas.filter((i) => i.id !== id);
        await offlineStorage.saveIdeas(filtered);
      }
    } catch (error) {
      await offlineStorage.addToSyncQueue({ type: 'delete', ideaId: id });
      throw error;
    }
  }
}

export const syncService = new SyncService();
