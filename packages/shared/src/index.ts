// Services
export { supabase } from './services/supabase';
export { signIn, signUp, signOut, getCurrentUser } from './services/auth';
export type { SignInCredentials, SignUpCredentials } from './services/auth';
export { apiClient, ApiError } from './services/apiClient';
export { offlineStorage } from './services/offlineStorage';
export { syncService } from './services/syncService';

// Stores
export { useAuthStore } from './stores/authStore';

// Types
export type {
  Idea,
  User,
  AuthState,
  CreateIdeaInput,
  UpdateIdeaInput,
  PaginationParams,
  PaginatedResponse,
} from './types';
