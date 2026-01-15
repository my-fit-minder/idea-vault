// Offline storage for web app
import type { Idea, CreateIdeaInput, UpdateIdeaInput } from '@idea-vault/shared';

const STORAGE_KEY = 'idea-vault-offline';
const SYNC_QUEUE_KEY = 'idea-vault-sync-queue';

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  data?: CreateIdeaInput | UpdateIdeaInput;
  ideaId?: string;
  timestamp: number;
}

class OfflineStorage {
  async saveIdeas(ideas: Idea[]): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
    } catch (error) {
      console.error('Failed to save ideas to localStorage:', error);
    }
  }

  async getIdeas(): Promise<Idea[]> {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to read ideas from localStorage:', error);
      return [];
    }
  }

  async addToSyncQueue(operation: Omit<SyncOperation, 'id' | 'timestamp'>): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const queue = await this.getSyncQueue();
      const newOp: SyncOperation = {
        ...operation,
        id: `sync-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
      };
      queue.push(newOp);
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
    }
  }

  async getSyncQueue(): Promise<SyncOperation[]> {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(SYNC_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to read sync queue:', error);
      return [];
    }
  }

  async clearSyncQueue(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(SYNC_QUEUE_KEY);
    } catch (error) {
      console.error('Failed to clear sync queue:', error);
    }
  }

  async removeFromSyncQueue(operationId: string): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const queue = await this.getSyncQueue();
      const filtered = queue.filter((op) => op.id !== operationId);
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove from sync queue:', error);
    }
  }
}

export const offlineStorage = new OfflineStorage();
