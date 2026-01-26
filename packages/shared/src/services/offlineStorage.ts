import type { Idea, CreateIdeaInput, UpdateIdeaInput } from '../types/index.js';

const STORAGE_KEY = 'ideafy-offline';
const SYNC_QUEUE_KEY = 'ideafy-sync-queue';

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  data?: CreateIdeaInput | UpdateIdeaInput;
  ideaId?: string;
  timestamp: number;
}

// Use globalThis to access browser globals in a TypeScript-safe way
const getBrowserWindow = () => (globalThis as any).window;
const getLocalStorage = () => (globalThis as any).localStorage;

class OfflineStorage {
  async saveIdeas(ideas: Idea[]): Promise<void> {
    if (typeof getBrowserWindow() === 'undefined') return;
    try {
      getLocalStorage().setItem(STORAGE_KEY, JSON.stringify(ideas));
    } catch (error) {
      console.error('Failed to save ideas to localStorage:', error);
    }
  }

  async getIdeas(): Promise<Idea[]> {
    if (typeof getBrowserWindow() === 'undefined') return [];
    try {
      const data = getLocalStorage().getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to read ideas from localStorage:', error);
      return [];
    }
  }

  async addToSyncQueue(operation: Omit<SyncOperation, 'id' | 'timestamp'>): Promise<void> {
    if (typeof getBrowserWindow() === 'undefined') return;
    try {
      const queue = await this.getSyncQueue();
      const newOp: SyncOperation = {
        ...operation,
        id: `sync-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
      };
      queue.push(newOp);
      getLocalStorage().setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
    }
  }

  async getSyncQueue(): Promise<SyncOperation[]> {
    if (typeof getBrowserWindow() === 'undefined') return [];
    try {
      const data = getLocalStorage().getItem(SYNC_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to read sync queue:', error);
      return [];
    }
  }

  async clearSyncQueue(): Promise<void> {
    if (typeof getBrowserWindow() === 'undefined') return;
    try {
      getLocalStorage().removeItem(SYNC_QUEUE_KEY);
    } catch (error) {
      console.error('Failed to clear sync queue:', error);
    }
  }

  async removeFromSyncQueue(operationId: string): Promise<void> {
    if (typeof getBrowserWindow() === 'undefined') return;
    try {
      const queue = await this.getSyncQueue();
      const filtered = queue.filter((op) => op.id !== operationId);
      getLocalStorage().setItem(SYNC_QUEUE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove from sync queue:', error);
    }
  }

}

export const offlineStorage = new OfflineStorage();
