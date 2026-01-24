// Sync service for mobile app with offline support
// Handles data synchronization between local storage and remote API
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { apiClient } from './apiClient';
import { offlineStorage } from './offlineStorage';
import type { Idea, CreateIdeaInput, UpdateIdeaInput, SyncOperation } from './types';

// Event emitter for sync status updates
type SyncListener = (status: SyncStatus) => void;

export interface SyncStatus {
  isSyncing: boolean;
  isOnline: boolean;
  pendingOperations: number;
  lastSyncTime: number | null;
  error: string | null;
}

class SyncService {
  private isSyncing = false;
  private isOnline = true;
  private listeners: Set<SyncListener> = new Set();
  private unsubscribeNetInfo: (() => void) | null = null;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initNetworkListener();
  }

  // ==================== Network Monitoring ====================

  private initNetworkListener() {
    this.unsubscribeNetInfo = NetInfo.addEventListener((state: NetInfoState) => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected === true && state.isInternetReachable !== false;
      
      // Auto-sync when coming back online
      if (wasOffline && this.isOnline) {
        console.log('📶 Network restored - triggering sync');
        this.sync().catch(err => console.error('Auto-sync failed:', err));
      }
      
      this.notifyListeners();
    });

    // Initial network check
    NetInfo.fetch().then((state: NetInfoState) => {
      this.isOnline = state.isConnected === true && state.isInternetReachable !== false;
      this.notifyListeners();
    });
  }

  // Start periodic sync (call when app becomes active)
  startPeriodicSync(intervalMs: number = 60000) {
    this.stopPeriodicSync();
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.sync().catch(err => console.error('Periodic sync failed:', err));
      }
    }, intervalMs);
  }

  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // ==================== Status & Listeners ====================

  addListener(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private async notifyListeners() {
    const status = await this.getStatus();
    this.listeners.forEach(listener => listener(status));
  }

  async getStatus(): Promise<SyncStatus> {
    const pendingOperations = await offlineStorage.getSyncQueueSize();
    const lastSyncTime = await offlineStorage.getLastSyncTime();
    return {
      isSyncing: this.isSyncing,
      isOnline: this.isOnline,
      pendingOperations,
      lastSyncTime,
      error: null,
    };
  }

  getIsOnline(): boolean {
    return this.isOnline;
  }

  // ==================== Main Sync Logic ====================

  async sync(): Promise<{ synced: number; errors: number }> {
    if (this.isSyncing) {
      return { synced: 0, errors: 0 };
    }

    if (!this.isOnline) {
      return { synced: 0, errors: 0 };
    }

    this.isSyncing = true;
    this.notifyListeners();

    let synced = 0;
    let errors = 0;

    try {
      const queue = await offlineStorage.getSyncQueue();
      
      // Process each operation in order
      for (const operation of queue) {
        try {
          await this.processSyncOperation(operation);
          await offlineStorage.removeFromSyncQueue(operation.id);
          synced++;
        } catch (error) {
          console.error('Failed to sync operation:', operation, error);
          errors++;
          // Keep failed operations in queue for retry
          // But if it's a conflict (404, 409), remove it
          if (error instanceof Error && error.message.includes('404')) {
            await offlineStorage.removeFromSyncQueue(operation.id);
          }
        }
      }

      // After syncing pending operations, refresh ideas from server
      if (synced > 0 || queue.length === 0) {
        try {
          const ideas = await apiClient.ideas.getAll();
          await offlineStorage.saveIdeas(ideas);
        } catch (error) {
          console.error('Failed to refresh ideas from server:', error);
        }
      }

      await offlineStorage.setLastSyncTime(Date.now());
    } catch (error) {
      console.error('Sync failed:', error);
      errors++;
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }

    return { synced, errors };
  }

  private async processSyncOperation(operation: SyncOperation): Promise<void> {
    switch (operation.type) {
      case 'create':
        if (operation.data) {
          await apiClient.ideas.create(operation.data as CreateIdeaInput);
        }
        break;
      case 'update':
        if (operation.ideaId && operation.data) {
          await apiClient.ideas.update(operation.ideaId, operation.data as UpdateIdeaInput);
        }
        break;
      case 'delete':
        if (operation.ideaId) {
          await apiClient.ideas.delete(operation.ideaId);
        }
        break;
    }
  }

  // ==================== Ideas CRUD with Offline Support ====================

  async getIdeas(archived?: boolean): Promise<Idea[]> {
    try {
      if (this.isOnline) {
        // Fetch from server and cache locally
        const ideas = await apiClient.ideas.getAll(archived);
        // Save all ideas to local storage (filter later for display)
        const existingIdeas = await offlineStorage.getIdeas();
        const mergedIdeas = this.mergeIdeas(existingIdeas, ideas);
        await offlineStorage.saveIdeas(mergedIdeas);
        
        // Filter based on archived status
        if (archived !== undefined) {
          return ideas.filter(idea => idea.archived === archived);
        }
        return ideas;
      } else {
        // Use offline storage
        const localIdeas = await offlineStorage.getIdeas();
        if (archived !== undefined) {
          return localIdeas.filter(idea => idea.archived === archived && !idea.deleted);
        }
        return localIdeas.filter(idea => !idea.deleted);
      }
    } catch (error) {
      console.error('Failed to fetch ideas, using offline storage:', error);
      const localIdeas = await offlineStorage.getIdeas();
      if (archived !== undefined) {
        return localIdeas.filter(idea => idea.archived === archived && !idea.deleted);
      }
      return localIdeas.filter(idea => !idea.deleted);
    }
  }

  // Paginated version for lazy loading
  async getIdeasPaginated(params: {
    limit?: number;
    offset?: number;
    archived?: boolean;
    search?: string;
  }): Promise<{ ideas: Idea[]; total: number; hasMore: boolean }> {
    const { limit = 20, offset = 0, archived, search } = params;

    try {
      if (this.isOnline) {
        // Fetch paginated from server
        const response = await apiClient.ideas.getAllPaginated({
          limit,
          offset,
          archived,
          search,
        });
        
        console.log('API Response:', JSON.stringify(response, null, 2).slice(0, 500));
        
        // Cache the fetched ideas locally
        if (response.data && response.data.length > 0) {
          const existingIdeas = await offlineStorage.getIdeas();
          const mergedIdeas = this.mergeIdeas(existingIdeas, response.data);
          await offlineStorage.saveIdeas(mergedIdeas);
        }

        // Handle the nested pagination structure from API
        // The API returns: { data: Idea[], pagination: { limit, offset, total, hasMore } }
        const ideas = response.data || [];
        const pagination = response.pagination;
        
        let total: number;
        let hasMore: boolean;
        
        if (pagination && typeof pagination.total === 'number') {
          total = pagination.total;
          hasMore = pagination.hasMore ?? (offset + ideas.length < total);
        } else {
          // Fallback if pagination object is missing
          total = ideas.length;
          hasMore = ideas.length >= limit; // Assume there's more if we got a full page
        }

        console.log(`Pagination: offset=${offset}, limit=${limit}, total=${total}, hasMore=${hasMore}, fetchedCount=${ideas.length}`);

        return {
          ideas,
          total,
          hasMore,
        };
      } else {
        // Use offline storage with pagination
        let localIdeas = await offlineStorage.getIdeas();
        
        // Filter by archived status
        if (archived !== undefined) {
          localIdeas = localIdeas.filter(idea => idea.archived === archived && !idea.deleted);
        } else {
          localIdeas = localIdeas.filter(idea => !idea.deleted);
        }

        // Filter by search if provided
        if (search && search.trim()) {
          const searchLower = search.toLowerCase();
          localIdeas = localIdeas.filter(idea =>
            idea.title.toLowerCase().includes(searchLower) ||
            idea.content?.toLowerCase().includes(searchLower) ||
            idea.tags.some(tag => tag.toLowerCase().includes(searchLower))
          );
        }

        // Sort by created_at descending
        localIdeas.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        const total = localIdeas.length;
        const paginatedIdeas = localIdeas.slice(offset, offset + limit);

        return {
          ideas: paginatedIdeas,
          total,
          hasMore: offset + paginatedIdeas.length < total,
        };
      }
    } catch (error) {
      console.error('Failed to fetch paginated ideas, using offline storage:', error);
      
      // Fallback to offline storage
      let localIdeas = await offlineStorage.getIdeas();
      
      if (archived !== undefined) {
        localIdeas = localIdeas.filter(idea => idea.archived === archived && !idea.deleted);
      } else {
        localIdeas = localIdeas.filter(idea => !idea.deleted);
      }

      if (search && search.trim()) {
        const searchLower = search.toLowerCase();
        localIdeas = localIdeas.filter(idea =>
          idea.title.toLowerCase().includes(searchLower) ||
          idea.content?.toLowerCase().includes(searchLower) ||
          idea.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      localIdeas.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const total = localIdeas.length;
      const paginatedIdeas = localIdeas.slice(offset, offset + limit);

      return {
        ideas: paginatedIdeas,
        total,
        hasMore: offset + paginatedIdeas.length < total,
      };
    }
  }

  async createIdea(data: CreateIdeaInput): Promise<Idea> {
    const localId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const userId = await offlineStorage.getUserId() || 'local';
    
    // Create local idea immediately
    const localIdea: Idea = {
      id: localId,
      user_id: userId,
      title: data.title,
      content: data.content || null,
      ai_context: data.ai_context || null,
      ai_report: null,
      tags: data.tags || [],
      archived: false,
      deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      synced_at: null,
    };

    if (this.isOnline) {
      try {
        // Try to create on server
        const serverIdea = await apiClient.ideas.create(data);
        // Save server version locally
        await offlineStorage.saveIdea(serverIdea);
        return serverIdea;
      } catch (error) {
        console.error('Failed to create idea online, saving locally:', error);
        // Fall through to offline handling
      }
    }

    // Save locally and queue for sync
    await offlineStorage.saveIdea(localIdea);
    await offlineStorage.addToSyncQueue({ type: 'create', data });
    this.notifyListeners();
    
    return localIdea;
  }

  async updateIdea(id: string, data: UpdateIdeaInput): Promise<Idea> {
    // Get current idea
    let currentIdea = await offlineStorage.getIdeaById(id);
    
    if (!currentIdea) {
      throw new Error('Idea not found');
    }

    // Update locally first
    const updatedIdea: Idea = {
      ...currentIdea,
      ...data,
      updated_at: new Date().toISOString(),
      synced_at: null,
    };

    if (this.isOnline && !id.startsWith('local-')) {
      try {
        // Try to update on server
        const serverIdea = await apiClient.ideas.update(id, data);
        await offlineStorage.saveIdea(serverIdea);
        return serverIdea;
      } catch (error) {
        console.error('Failed to update idea online, saving locally:', error);
        // Fall through to offline handling
      }
    }

    // Save locally and queue for sync
    await offlineStorage.saveIdea(updatedIdea);
    if (!id.startsWith('local-')) {
      await offlineStorage.addToSyncQueue({ type: 'update', ideaId: id, data });
    }
    this.notifyListeners();
    
    return updatedIdea;
  }

  async deleteIdea(id: string): Promise<void> {
    if (this.isOnline && !id.startsWith('local-')) {
      try {
        await apiClient.ideas.delete(id);
        await offlineStorage.removeIdea(id);
        return;
      } catch (error) {
        console.error('Failed to delete idea online, marking locally:', error);
        // Fall through to offline handling
      }
    }

    // For local ideas, just remove them
    if (id.startsWith('local-')) {
      await offlineStorage.removeIdea(id);
      // Also remove any pending create operations for this idea
      const queue = await offlineStorage.getSyncQueue();
      for (const op of queue) {
        if (op.type === 'create' && op.id.includes(id)) {
          await offlineStorage.removeFromSyncQueue(op.id);
        }
      }
    } else {
      // Mark as deleted locally and queue for sync
      const idea = await offlineStorage.getIdeaById(id);
      if (idea) {
        await offlineStorage.saveIdea({ ...idea, deleted: true });
      }
      await offlineStorage.addToSyncQueue({ type: 'delete', ideaId: id });
    }
    
    this.notifyListeners();
  }

  async archiveIdea(id: string): Promise<Idea> {
    const idea = await offlineStorage.getIdeaById(id);
    if (!idea) {
      throw new Error('Idea not found');
    }

    const newArchivedState = !idea.archived;

    if (this.isOnline && !id.startsWith('local-')) {
      try {
        const serverIdea = await apiClient.ideas.archive(id);
        await offlineStorage.saveIdea(serverIdea);
        return serverIdea;
      } catch (error) {
        console.error('Failed to archive idea online:', error);
        // Fall through to offline handling
      }
    }

    // Update locally
    const updatedIdea: Idea = {
      ...idea,
      archived: newArchivedState,
      updated_at: new Date().toISOString(),
      synced_at: null,
    };

    await offlineStorage.saveIdea(updatedIdea);
    if (!id.startsWith('local-')) {
      await offlineStorage.addToSyncQueue({ 
        type: 'update', 
        ideaId: id, 
        data: { archived: newArchivedState } 
      });
    }
    this.notifyListeners();

    return updatedIdea;
  }

  async generateReport(id: string): Promise<{ report: string; idea: Idea }> {
    if (!this.isOnline) {
      throw new Error('Cannot generate AI report while offline');
    }

    if (id.startsWith('local-')) {
      throw new Error('Please sync your idea first before generating AI report');
    }

    const result = await apiClient.ideas.generateReport(id);
    await offlineStorage.saveIdea(result.idea);
    return result;
  }

  // ==================== Utility Methods ====================

  private mergeIdeas(localIdeas: Idea[], serverIdeas: Idea[]): Idea[] {
    const merged = new Map<string, Idea>();
    
    // Add all server ideas
    for (const idea of serverIdeas) {
      merged.set(idea.id, idea);
    }
    
    // Add local-only ideas (not yet synced)
    for (const idea of localIdeas) {
      if (idea.id.startsWith('local-') && !idea.deleted) {
        merged.set(idea.id, idea);
      }
    }
    
    return Array.from(merged.values());
  }

  // Force refresh from server
  async forceRefresh(): Promise<Idea[]> {
    if (!this.isOnline) {
      throw new Error('Cannot refresh while offline');
    }

    const ideas = await apiClient.ideas.getAll();
    const localIdeas = await offlineStorage.getIdeas();
    const mergedIdeas = this.mergeIdeas(localIdeas, ideas);
    await offlineStorage.saveIdeas(mergedIdeas);
    await offlineStorage.setLastSyncTime(Date.now());
    this.notifyListeners();
    
    return mergedIdeas.filter(idea => !idea.deleted);
  }

  // Clear local data (for logout)
  async clearLocalData(): Promise<void> {
    await offlineStorage.clearUserData();
    this.notifyListeners();
  }

  // Set user ID (call after login)
  async setUserId(userId: string): Promise<void> {
    await offlineStorage.setUserId(userId);
  }

  // Cleanup
  destroy() {
    this.stopPeriodicSync();
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
    }
    this.listeners.clear();
  }
}

export const syncService = new SyncService();
