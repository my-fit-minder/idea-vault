// Hook for network status with sync service integration
import { useState, useEffect, useCallback } from 'react';
import { syncService, SyncStatus } from '../lib/syncService';

export function useNetworkStatus() {
  const [status, setStatus] = useState<SyncStatus>({
    isSyncing: false,
    isOnline: true,
    pendingOperations: 0,
    lastSyncTime: null,
    error: null,
  });

  useEffect(() => {
    // Get initial status
    syncService.getStatus().then(setStatus);

    // Subscribe to status updates
    const unsubscribe = syncService.addListener(setStatus);
    return unsubscribe;
  }, []);

  const triggerSync = useCallback(async () => {
    return syncService.sync();
  }, []);

  const forceRefresh = useCallback(async () => {
    return syncService.forceRefresh();
  }, []);

  return {
    ...status,
    triggerSync,
    forceRefresh,
  };
}
