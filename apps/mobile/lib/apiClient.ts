// API client for mobile app
import { supabase } from './supabase';
import { env } from '../config/env';
import type { Idea, CreateIdeaInput, UpdateIdeaInput, PaginationParams, PaginatedResponse } from './types';

const API_BASE_URL = env.API_URL;

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
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
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

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const apiClient = {
  ideas: {
    getAll: (archived?: boolean): Promise<Idea[]> => {
      const queryParams = new URLSearchParams();
      if (archived !== undefined) {
        queryParams.append('archived', archived.toString());
      }
      const queryString = queryParams.toString();
      const url = `/api/ideas${queryString ? `?${queryString}` : ''}`;
      return request<Idea[]>(url);
    },

    getAllPaginated: (params?: PaginationParams): Promise<PaginatedResponse<Idea>> => {
      const queryParams = new URLSearchParams();
      if (params?.limit !== undefined) {
        queryParams.append('limit', params.limit.toString());
      }
      if (params?.offset !== undefined) {
        queryParams.append('offset', params.offset.toString());
      }
      if (params?.archived !== undefined) {
        queryParams.append('archived', params.archived.toString());
      }
      if (params?.search !== undefined && params.search.trim().length > 0) {
        queryParams.append('search', params.search.trim());
      }
      const queryString = queryParams.toString();
      const url = `/api/ideas${queryString ? `?${queryString}` : ''}`;
      return request<PaginatedResponse<Idea>>(url);
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

    archive: (id: string): Promise<Idea> => {
      return request<Idea>(`/api/ideas/${id}/archive`, {
        method: 'POST',
      });
    },

    generateReport: (id: string): Promise<{ report: string; idea: Idea }> => {
      return request<{ report: string; idea: Idea }>(`/api/ideas/${id}/generate-report`, {
        method: 'POST',
      });
    },
  },
};
