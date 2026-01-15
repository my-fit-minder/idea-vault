// Database types
export interface Idea {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  tags: string[];
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
  tags?: string[];
}

export interface UpdateIdeaInput {
  title?: string;
  content?: string;
  tags?: string[];
}
