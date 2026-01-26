// Ideas list screen for mobile app with lazy loading
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '../hooks/use-color-scheme';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Colors } from '../constants/theme';
import { syncService } from '../lib/syncService';
import type { Idea } from '../lib/types';

const PAGE_SIZE = 15;

interface FilterState {
  showActive: boolean;
  showArchived: boolean;
}

interface IdeasListProps {
  onSelectIdea: (idea: Idea) => void;
  onCreateIdea: () => void;
  onEditIdea: (idea: Idea) => void;
}

export function IdeasList({ onSelectIdea, onCreateIdea, onEditIdea }: IdeasListProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];

  const { isOnline, pendingOperations, isSyncing, triggerSync } = useNetworkStatus();

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    showActive: true,
    showArchived: false,
  });
  
  // Refs to avoid stale closures
  const ideasRef = useRef<Idea[]>([]);
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(true);
  
  // Keep refs in sync with state
  useEffect(() => {
    ideasRef.current = ideas;
  }, [ideas]);
  
  useEffect(() => {
    loadingMoreRef.current = loadingMore;
  }, [loadingMore]);
  
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);
  
  // Debounce search query
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const loadIdeas = useCallback(async (reset: boolean) => {
    // Use refs to get current values and avoid stale closures
    const currentIdeas = ideasRef.current;
    
    // Prevent duplicate calls
    if (!reset && loadingMoreRef.current) {
      return;
    }
    
    // Don't load more if there's nothing more to load
    if (!reset && !hasMoreRef.current) {
      return;
    }
    
    try {
      // If both filters are off, show nothing
      if (!filters.showActive && !filters.showArchived) {
        setIdeas([]);
        ideasRef.current = [];
        setTotal(0);
        setHasMore(false);
        hasMoreRef.current = false;
        setLoading(false);
        return;
      }

      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
        loadingMoreRef.current = true;
      }

      // Determine archived filter based on filter state
      let archived: boolean | undefined;
      if (filters.showActive && !filters.showArchived) {
        archived = false;
      } else if (!filters.showActive && filters.showArchived) {
        archived = true;
      } else {
        // Both true - fetch all
        archived = undefined;
      }

      const offset = reset ? 0 : currentIdeas.length;
      console.log(`Loading ideas: reset=${reset}, offset=${offset}, currentLength=${currentIdeas.length}`);
      
      const result = await syncService.getIdeasPaginated({
        limit: PAGE_SIZE,
        offset,
        archived,
        search: debouncedSearchQuery || undefined,
      });

      console.log(`Loaded ${result.ideas.length} ideas, total=${result.total}, hasMore=${result.hasMore}`);

      if (reset) {
        setIdeas(result.ideas);
        ideasRef.current = result.ideas;
      } else {
        const newIdeas = [...currentIdeas, ...result.ideas];
        setIdeas(newIdeas);
        ideasRef.current = newIdeas;
      }
      setTotal(result.total);
      setHasMore(result.hasMore);
      hasMoreRef.current = result.hasMore;
    } catch (error) {
      console.error('Failed to load ideas:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }
  }, [filters.showActive, filters.showArchived, debouncedSearchQuery]);

  // Initial load and filter/search changes
  useEffect(() => {
    loadIdeas(true);
  }, [filters.showActive, filters.showArchived, debouncedSearchQuery]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (isOnline) {
        await triggerSync();
      }
      await loadIdeas(true);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = useCallback(() => {
    console.log('handleLoadMore called - loadingMore:', loadingMoreRef.current, 'loading:', loading, 'hasMore:', hasMoreRef.current);
    if (loadingMoreRef.current) {
      console.log('Skipping - already loading more');
      return;
    }
    if (loading) {
      console.log('Skipping - initial loading in progress');
      return;
    }
    if (!hasMoreRef.current) {
      console.log('Skipping - no more items to load');
      return;
    }
    console.log('Starting to load more ideas...');
    loadIdeas(false);
  }, [loading, loadIdeas]);

  const handleDelete = (idea: Idea) => {
    Alert.alert(
      'Delete Idea',
      `Are you sure you want to delete "${idea.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await syncService.deleteIdea(idea.id);
              // Remove from local state immediately for better UX
              setIdeas(prev => prev.filter(i => i.id !== idea.id));
              setTotal(prev => prev - 1);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete idea');
            }
          },
        },
      ]
    );
  };

  const handleFilterToggle = (filterKey: 'showActive' | 'showArchived') => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
  };

  const activeFilterCount = [filters.showActive, filters.showArchived].filter(Boolean).length;
  const isSearching = searchQuery.trim().length > 0;

  // Ideas are now filtered server-side or in syncService, so we use them directly
  const filteredIdeas = ideas;

  const styles = createStyles(isDark, colors);

  const renderItem = ({ item }: { item: Idea }) => {
    const isLocalOnly = item.id.startsWith('local-');

    return (
      <TouchableOpacity
        style={[styles.ideaCard, item.archived && styles.ideaCardArchived]}
        onPress={() => onSelectIdea(item)}
        activeOpacity={0.7}
      >
        <View style={styles.ideaHeader}>
          <Text style={styles.ideaTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {isLocalOnly && (
            <View style={styles.localBadge}>
              <Text style={styles.localBadgeText}>Local</Text>
            </View>
          )}
          {item.archived && (isSearching || filters.showArchived) && (
            <View style={styles.archivedBadge}>
              <Text style={styles.archivedBadgeText}>Archived</Text>
            </View>
          )}
        </View>

        {item.content && (
          <Text style={styles.ideaContent} numberOfLines={2}>
            {item.content}
          </Text>
        )}

        {item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag, idx) => (
              <View key={idx} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {item.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{item.tags.length - 3}</Text>
            )}
          </View>
        )}

        <View style={styles.ideaFooter}>
          <Text style={styles.ideaDate}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                onEditIdea(item);
              }}
            >
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={(e) => {
                e.stopPropagation();
                handleDelete(item);
              }}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>💡</Text>
      <Text style={styles.emptyTitle}>
        {!filters.showActive && !filters.showArchived
          ? 'No filter selected'
          : filters.showArchived && !filters.showActive
          ? 'No archived ideas'
          : 'No ideas yet'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {!filters.showActive && !filters.showArchived
          ? 'Select at least one filter to see ideas'
          : filters.showArchived && !filters.showActive
          ? 'Archive ideas you want to keep but not actively work on'
          : 'Tap the + button to create your first idea!'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💡 Ideafy</Text>
        {/* Network Status Indicator */}
        <View style={styles.statusContainer}>
          {!isOnline && (
            <View style={styles.offlineBadge}>
              <Text style={styles.offlineBadgeText}>Offline</Text>
            </View>
          )}
          {pendingOperations > 0 && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>{pendingOperations}</Text>
            </View>
          )}
          {isSyncing && <ActivityIndicator size="small" color="#667eea" />}
        </View>
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search ideas..."
          placeholderTextColor="#a0aec0"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={[styles.filterButton, isFilterOpen && styles.filterButtonActive]}
          onPress={() => setIsFilterOpen(true)}
        >
          <Text style={styles.filterIcon}>⚙️</Text>
          <Text style={[styles.filterButtonText, isFilterOpen && styles.filterButtonTextActive]}>
            Filters
          </Text>
          {activeFilterCount < 2 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filter Dropdown Modal */}
      <Modal
        visible={isFilterOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsFilterOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsFilterOpen(false)}>
          <View style={styles.filterDropdown}>
            <Text style={styles.filterDropdownHeader}>Filter Ideas</Text>
            
            {/* Active Ideas Checkbox */}
            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => handleFilterToggle('showActive')}
            >
              <View style={[styles.checkbox, filters.showActive && styles.checkboxChecked]}>
                {filters.showActive && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.filterOptionText}>Active Ideas</Text>
            </TouchableOpacity>

            {/* Archived Ideas Checkbox */}
            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => handleFilterToggle('showArchived')}
            >
              <View style={[styles.checkbox, filters.showArchived && styles.checkboxChecked]}>
                {filters.showArchived && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.filterOptionText}>Archived Ideas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterDoneButton}
              onPress={() => setIsFilterOpen(false)}
            >
              <Text style={styles.filterDoneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Ideas List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
        </View>
      ) : (
        <FlatList
          style={styles.flatList}
          data={filteredIdeas}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            filteredIdeas.length === 0 && styles.listContentEmpty,
          ]}
          showsVerticalScrollIndicator={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#667eea"
            />
          }
          ListEmptyComponent={renderEmptyState}
          onEndReached={({ distanceFromEnd }) => {
            console.log('onEndReached fired, distanceFromEnd:', distanceFromEnd, 'hasMore:', hasMoreRef.current, 'loadingMore:', loadingMoreRef.current, 'loading:', loading);
            if (distanceFromEnd > 0) {
              handleLoadMore();
            }
          }}
          onEndReachedThreshold={0.5}
          initialNumToRender={PAGE_SIZE}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={false}
          extraData={{ hasMore, loadingMore, total }}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color="#667eea" />
                <Text style={styles.loadingMoreText}>Loading more ideas...</Text>
              </View>
            ) : hasMore && filteredIdeas.length > 0 ? (
              <View style={styles.loadingMoreContainer}>
                <Text style={styles.scrollHintText}>Scroll for more</Text>
              </View>
            ) : filteredIdeas.length > 0 ? (
              <View style={styles.loadingMoreContainer}>
                <Text style={styles.endOfListText}>
                  {total} {total === 1 ? 'idea' : 'ideas'} total
                </Text>
              </View>
            ) : null
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={onCreateIdea}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const createStyles = (isDark: boolean, colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f7fafc', // Match web background
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#e2e8f0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: '#1a202c',
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    offlineBadge: {
      backgroundColor: '#fed7d7',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    offlineBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#c53030',
    },
    pendingBadge: {
      backgroundColor: '#fef3c7',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      minWidth: 28,
      alignItems: 'center',
    },
    pendingBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#d97706',
    },
    searchContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: '#fff',
      gap: 12,
    },
    searchInput: {
      flex: 1,
      backgroundColor: '#f7fafc',
      borderWidth: 1,
      borderColor: '#e2e8f0',
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      color: '#1a202c',
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f7fafc',
      borderWidth: 1,
      borderColor: '#e2e8f0',
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 14,
      gap: 6,
    },
    filterButtonActive: {
      backgroundColor: '#667eea',
      borderColor: '#667eea',
    },
    filterIcon: {
      fontSize: 14,
    },
    filterButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#4a5568',
    },
    filterButtonTextActive: {
      color: '#fff',
    },
    filterBadge: {
      backgroundColor: '#667eea',
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#fff',
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'flex-start',
      paddingTop: 160,
      paddingHorizontal: 16,
    },
    filterDropdown: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    },
    filterDropdownHeader: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1a202c',
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#e2e8f0',
    },
    filterOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      gap: 12,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: '#e2e8f0',
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: '#667eea',
      borderColor: '#667eea',
    },
    checkmark: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '700',
    },
    filterOptionText: {
      fontSize: 15,
      color: '#4a5568',
    },
    filterDoneButton: {
      marginTop: 16,
      backgroundColor: '#667eea',
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
    },
    filterDoneButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    flatList: {
      flex: 1,
    },
    loadingMoreContainer: {
      paddingVertical: 20,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    loadingMoreText: {
      fontSize: 14,
      color: '#718096',
    },
    scrollHintText: {
      fontSize: 13,
      color: '#a0aec0',
    },
    endOfListText: {
      fontSize: 13,
      color: '#a0aec0',
      fontWeight: '500',
    },
    listContent: {
      padding: 16,
      paddingBottom: 100,
    },
    listContentEmpty: {
      flexGrow: 1,
    },
    ideaCard: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#e2e8f0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    ideaCardArchived: {
      opacity: 0.7,
    },
    ideaHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    ideaTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: '600',
      color: '#1a202c',
    },
    localBadge: {
      backgroundColor: '#ebf8ff',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    localBadgeText: {
      fontSize: 10,
      fontWeight: '600',
      color: '#3182ce',
    },
    archivedBadge: {
      backgroundColor: '#edf2f7',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    archivedBadgeText: {
      fontSize: 10,
      fontWeight: '600',
      color: '#718096',
    },
    ideaContent: {
      fontSize: 14,
      color: '#718096',
      marginBottom: 12,
      lineHeight: 20,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 12,
    },
    tag: {
      backgroundColor: '#edf2f7',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },
    tagText: {
      fontSize: 12,
      color: '#4a5568',
    },
    moreTagsText: {
      fontSize: 12,
      color: '#718096',
      alignSelf: 'center',
    },
    ideaFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    ideaDate: {
      fontSize: 12,
      color: '#a0aec0',
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: '#f7fafc',
      borderWidth: 1,
      borderColor: '#e2e8f0',
    },
    actionButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#667eea',
    },
    deleteButton: {
      backgroundColor: '#fed7d7',
      borderColor: '#fed7d7',
    },
    deleteButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#c53030',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: '#1a202c',
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: '#718096',
      textAlign: 'center',
      paddingHorizontal: 40,
    },
    fab: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#667eea',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#667eea',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 6,
    },
    fabText: {
      fontSize: 32,
      color: '#fff',
      fontWeight: '300',
      marginTop: -2,
    },
  });
