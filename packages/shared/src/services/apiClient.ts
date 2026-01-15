import type { Idea, CreateIdeaInput, UpdateIdeaInput } from '../types/index.js';

// Get API URL from environment (works in Vite/Expo)
const getApiUrl = (): string => {
  // Browser environment - check for Vite env var
  if (typeof window !== 'undefined') {
    const meta = import.meta as any;
    if (meta?.env?.VITE_API_URL) {
      return meta.env.VITE_API_URL;
    }
    return 'http://localhost:3001';
  }
  
  // Node environment - only access process if we're definitely in Node
  if (typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.VITE_API_URL) {
    return (globalThis as any).process.env.VITE_API_URL;
  }
  
  return 'http://localhost:3001';
};

const API_BASE_URL = getApiUrl();

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get auth token from Supabase
  let token: string | null = null;
  
  // Import supabase dynamically to avoid circular dependencies
  const { supabase } = await import('./supabase.js');
  const { data: { session } } = await supabase.auth.getSession();
  token = session?.access_token || null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: response.statusText };
    }
    throw new ApiError(
      errorData.error || 'Request failed',
      response.status,
      errorData
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const apiClient = {
  // Ideas API
  ideas: {
    getAll: (): Promise<Idea[]> => {
      return request<Idea[]>('/api/ideas');
    },

    getById: (id: string): Promise<Idea> => {
      return request<Idea>(`/api/ideas/${id}`);
    },

    create: (input: CreateIdeaInput): Promise<Idea> => {
      return request<Idea>('/api/ideas', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },

    update: (id: string, input: UpdateIdeaInput): Promise<Idea> => {
      return request<Idea>(`/api/ideas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      });
    },

    delete: (id: string): Promise<void> => {
      return request<void>(`/api/ideas/${id}`, {
        method: 'DELETE',
      });
    },
  },
};
