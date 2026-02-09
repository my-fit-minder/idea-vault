// Types for mobile app

// Database types
export interface Idea {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  ai_context: string | null;
  ai_report: string | null;
  ai_roadmap: string | null;
  ai_validation_roadmap: string | null;
  tags: string[];
  archived: boolean;
  deleted: boolean;
  created_at: string;
  updated_at: string;
  synced_at: string | null;
}

// Auth types
export interface User {
  id: string;
  email?: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  initialized: boolean;
}

// API types
export interface CreateIdeaInput {
  title: string;
  content?: string;
  ai_context?: string;
  tags?: string[];
}

export interface UpdateIdeaInput {
  title?: string;
  content?: string;
  ai_context?: string;
  ai_report?: string;
  ai_roadmap?: string;
  ai_validation_roadmap?: string;
  tags?: string[];
  archived?: boolean;
  deleted?: boolean;
}

// Pagination types
export interface PaginationParams {
  limit?: number;
  offset?: number;
  archived?: boolean;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

// Sync operation types
export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  data?: CreateIdeaInput | UpdateIdeaInput;
  ideaId?: string;
  timestamp: number;
}

// Network status
export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
}
