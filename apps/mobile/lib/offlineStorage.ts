// Offline storage service using AsyncStorage for mobile app
// Provides persistent storage for ideas and sync queue
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Idea, CreateIdeaInput, UpdateIdeaInput, SyncOperation } from './types';

const STORAGE_KEYS = {
  IDEAS: '@idea_vault_ideas',
  SYNC_QUEUE: '@idea_vault_sync_queue',
  LAST_SYNC: '@idea_vault_last_sync',
  USER_ID: '@idea_vault_user_id',
};

class OfflineStorage {
  // ==================== Ideas Storage ====================
  
  async saveIdeas(ideas: Idea[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(ideas);
      await AsyncStorage.setItem(STORAGE_KEYS.IDEAS, jsonValue);
    } catch (error) {
      console.error('Failed to save ideas to storage:', error);
      throw error;
    }
  }

  async getIdeas(): Promise<Idea[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.IDEAS);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Failed to read ideas from storage:', error);
      return [];
    }
  }

  async getIdeaById(id: string): Promise<Idea | null> {
    const ideas = await this.getIdeas();
    return ideas.find(idea => idea.id === id) || null;
  }

  async saveIdea(idea: Idea): Promise<void> {
    const ideas = await this.getIdeas();
    const index = ideas.findIndex(i => i.id === idea.id);
    if (index >= 0) {
      ideas[index] = idea;
    } else {
      ideas.push(idea);
    }
    await this.saveIdeas(ideas);
  }

  async removeIdea(id: string): Promise<void> {
    const ideas = await this.getIdeas();
    const filtered = ideas.filter(idea => idea.id !== id);
    await this.saveIdeas(filtered);
  }

  async clearIdeas(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.IDEAS);
    } catch (error) {
      console.error('Failed to clear ideas:', error);
    }
  }

  // ==================== Sync Queue ====================
  
  async addToSyncQueue(operation: Omit<SyncOperation, 'id' | 'timestamp'>): Promise<string> {
    try {
      const queue = await this.getSyncQueue();
      const operationId = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newOp: SyncOperation = {
        ...operation,
        id: operationId,
        timestamp: Date.now(),
      };
      queue.push(newOp);
      await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
      return operationId;
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
      throw error;
    }
  }

  async getSyncQueue(): Promise<SyncOperation[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Failed to read sync queue:', error);
      return [];
    }
  }

  async removeFromSyncQueue(operationId: string): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      const filtered = queue.filter(op => op.id !== operationId);
      await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove from sync queue:', error);
    }
  }

  async clearSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
    } catch (error) {
      console.error('Failed to clear sync queue:', error);
    }
  }

  async getSyncQueueSize(): Promise<number> {
    const queue = await this.getSyncQueue();
    return queue.length;
  }

  // ==================== Last Sync Timestamp ====================
  
  async setLastSyncTime(timestamp: number): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp.toString());
    } catch (error) {
      console.error('Failed to save last sync time:', error);
    }
  }

  async getLastSyncTime(): Promise<number | null> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return value ? parseInt(value, 10) : null;
    } catch (error) {
      console.error('Failed to read last sync time:', error);
      return null;
    }
  }

  // ==================== User ID ====================
  
  async setUserId(userId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
    } catch (error) {
      console.error('Failed to save user ID:', error);
    }
  }

  async getUserId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
    } catch (error) {
      console.error('Failed to read user ID:', error);
      return null;
    }
  }

  // ==================== Cleanup ====================
  
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.IDEAS,
        STORAGE_KEYS.SYNC_QUEUE,
        STORAGE_KEYS.LAST_SYNC,
        STORAGE_KEYS.USER_ID,
      ]);
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  }

  // Clear data for logout (but keep sync queue to retry on next login)
  async clearUserData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.IDEAS,
        STORAGE_KEYS.LAST_SYNC,
        STORAGE_KEYS.USER_ID,
      ]);
    } catch (error) {
      console.error('Failed to clear user data:', error);
    }
  }
}

export const offlineStorage = new OfflineStorage();
