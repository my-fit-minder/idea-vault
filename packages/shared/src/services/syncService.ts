import { apiClient } from './apiClient.js';
import { offlineStorage } from './offlineStorage.js';
import type { Idea } from '../types/index.js';

// Helper to check online status in a TypeScript-safe way
const isOnline = (): boolean => {
  const nav = (globalThis as any).navigator;
  return nav?.onLine ?? true;
};

class SyncService {
  private isSyncing = false;

  async sync(): Promise<{ synced: number; errors: number }> {
    if (this.isSyncing) {
      return { synced: 0, errors: 0 };
    }

    if (!isOnline()) {
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
          // Keep failed operations in queue for retry
        }
      }

      // After syncing, refresh ideas from server
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
      if (isOnline()) {
        // Try to fetch from server
        const ideas = await apiClient.ideas.getAll();
        await offlineStorage.saveIdeas(ideas);
        return ideas;
      } else {
        // Use offline storage
        return await offlineStorage.getIdeas();
      }
    } catch (error) {
      console.error('Failed to fetch ideas, using offline storage:', error);
      return await offlineStorage.getIdeas();
    }
  }

  async createIdeaWithOfflineSupport(data: any): Promise<Idea> {
    try {
      if (isOnline()) {
        const idea = await apiClient.ideas.create(data);
        const ideas = await apiClient.ideas.getAll();
        await offlineStorage.saveIdeas(ideas);
        return idea;
      } else {
        // Add to sync queue and create local idea
        await offlineStorage.addToSyncQueue({ type: 'create', data });
        const localIdeas = await offlineStorage.getIdeas();
        const localIdea: Idea = {
          id: `local-${Date.now()}`,
          user_id: 'local',
          title: data.title,
          content: data.content || null,
          tags: data.tags || [],
          ai_context: null,
          ai_report: null,
          ai_roadmap: null,
          ai_validation_roadmap: null,
          archived: false,
          deleted: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          synced_at: null,
        };
        localIdeas.push(localIdea);
        await offlineStorage.saveIdeas(localIdeas);
        return localIdea;
      }
    } catch (error) {
      // If online but request failed, queue it
      await offlineStorage.addToSyncQueue({ type: 'create', data });
      throw error;
    }
  }

  async updateIdeaWithOfflineSupport(id: string, data: any): Promise<Idea> {
    try {
      if (isOnline()) {
        const idea = await apiClient.ideas.update(id, data);
        const ideas = await apiClient.ideas.getAll();
        await offlineStorage.saveIdeas(ideas);
        return idea;
      } else {
        await offlineStorage.addToSyncQueue({ type: 'update', ideaId: id, data });
        const localIdeas = await offlineStorage.getIdeas();
        const index = localIdeas.findIndex((i) => i.id === id);
        if (index !== -1) {
          localIdeas[index] = { ...localIdeas[index], ...data, updated_at: new Date().toISOString() };
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
      if (isOnline()) {
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
