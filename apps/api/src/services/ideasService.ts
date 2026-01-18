import { getSupabaseAdmin } from '../clients/supabaseClient.js';
import type { Idea, CreateIdeaInput, UpdateIdeaInput, PaginationParams, PaginatedResponse } from '@idea-vault/shared';

export class IdeasService {
  async getAllIdeas(userId: string, archived?: boolean): Promise<Idea[]> {
    let query = getSupabaseAdmin()
      .from('ideas')
      .select('*')
      .eq('user_id', userId)
      .eq('deleted', false); // Filter out soft-deleted items

    // Filter by archived status if provided
    if (archived !== undefined) {
      query = query.eq('archived', archived);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch ideas: ${error.message}`);
    }

    return data || [];
  }

  async getIdeasPaginated(
    userId: string,
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<Idea>> {
    const limit = params.limit ?? 20;
    const offset = params.offset ?? 0;
    const hasSearch = params.search && params.search.trim().length > 0;

    // When searching, ignore archived filter to search through all ideas
    const shouldApplyArchivedFilter = !hasSearch && params.archived !== undefined;

    // Build base query for counting
    // When searching, we can't accurately count without fetching all results
    // because tag search happens in memory. So we'll use an approximate count.
    let countQuery = getSupabaseAdmin()
      .from('ideas')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('deleted', false);

    // Filter by archived status only if not searching
    if (shouldApplyArchivedFilter) {
      countQuery = countQuery.eq('archived', params.archived);
    }

    // For search, we don't filter at DB level for counting since we need to include tag matches
    // The count will be approximate (may include some non-matching results)
    const { count, error: countError } = await countQuery;

    if (countError) {
      throw new Error(`Failed to count ideas: ${countError.message}`);
    }

    const total = count ?? 0;

    // Build base query for data
    // When searching, we need to fetch a larger set and filter in memory to ensure we catch
    // all matches including tag-only matches (which can't be easily filtered at DB level)
    // For pagination, we fetch from a wider range to account for filtering
    const fetchLimit = hasSearch ? Math.min(limit * 10, 200) : limit; // Cap at 200 for performance
    const fetchOffset = hasSearch ? Math.max(0, offset - limit * 2) : offset; // Fetch from earlier to catch matches
    const fetchEnd = fetchOffset + fetchLimit;
    
    let dataQuery = getSupabaseAdmin()
      .from('ideas')
      .select('*')
      .eq('user_id', userId)
      .eq('deleted', false);

    // Filter by archived status only if not searching
    if (shouldApplyArchivedFilter) {
      dataQuery = dataQuery.eq('archived', params.archived);
    }

    // When searching, don't filter at DB level - fetch more and filter in memory
    // This ensures we catch tag matches which can't be easily queried at DB level
    // We'll filter by title, content (description), and tags in memory

    const { data, error } = await dataQuery
      .order('created_at', { ascending: false })
      .range(fetchOffset, fetchEnd - 1);

    if (error) {
      throw new Error(`Failed to fetch ideas: ${error.message}`);
    }

    let filteredData = data || [];

    // Filter by title, content (description), and tags if search is provided
    // This ensures we catch all matches including tag-only matches
    if (hasSearch) {
      const searchTermLower = params.search!.trim().toLowerCase();
      filteredData = filteredData.filter((idea) => {
        // Check if matches title, content (description), or any tag
        const matchesTitle = idea.title.toLowerCase().includes(searchTermLower);
        const matchesContent = idea.content?.toLowerCase().includes(searchTermLower) ?? false;
        const matchesTag = idea.tags.some((tag: string) => tag.toLowerCase().includes(searchTermLower));
        
        return matchesTitle || matchesContent || matchesTag;
      });
      
      // Apply pagination to filtered results
      const paginationStart = offset - fetchOffset;
      filteredData = filteredData.slice(paginationStart, paginationStart + limit);
    }

    // For search, we can't know the exact total without fetching all results
    // So we estimate: if we got a full page after filtering, there might be more
    const hasMore = hasSearch 
      ? filteredData.length === limit 
      : offset + limit < total;

    return {
      data: filteredData,
      pagination: {
        limit,
        offset,
        total: hasSearch ? total : total, // Total is approximate for search
        hasMore,
      },
    };
  }

  async getIdeaById(id: string, userId: string): Promise<Idea | null> {
    const { data, error } = await getSupabaseAdmin()
      .from('ideas')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .eq('deleted', false) // Filter out soft-deleted items
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch idea: ${error.message}`);
    }

    return data;
  }

  async createIdea(input: CreateIdeaInput, userId: string): Promise<Idea> {
    const { data, error } = await getSupabaseAdmin()
      .from('ideas')
      .insert({
        user_id: userId,
        title: input.title,
        content: input.content || null,
        ai_context: input.ai_context || null,
        ai_report: null, // Reports are generated separately
        tags: input.tags || [],
        archived: false,
        deleted: false
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create idea: ${error.message}`);
    }

    return data;
  }

  async updateIdea(
    id: string,
    input: UpdateIdeaInput,
    userId: string
  ): Promise<Idea> {
    // First verify ownership
    const existing = await this.getIdeaById(id, userId);
    if (!existing) {
      throw new Error('Idea not found');
    }

    const updateData: any = {
      title: input.title,
      content: input.content,
      ai_context: input.ai_context,
      tags: input.tags,
      updated_at: new Date().toISOString()
    };

    // Only update ai_report if it's explicitly provided
    if (input.ai_report !== undefined) {
      updateData.ai_report = input.ai_report;
    }

    // Handle archived and deleted flags
    if (input.archived !== undefined) {
      updateData.archived = input.archived;
    }
    if (input.deleted !== undefined) {
      updateData.deleted = input.deleted;
    }

    const { data, error } = await getSupabaseAdmin()
      .from('ideas')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update idea: ${error.message}`);
    }

    return data;
  }

  async deleteIdea(id: string, userId: string): Promise<void> {
    // Soft delete - set deleted flag to true
    const existing = await this.getIdeaById(id, userId);
    if (!existing) {
      throw new Error('Idea not found');
    }

    const { error } = await getSupabaseAdmin()
      .from('ideas')
      .update({ deleted: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete idea: ${error.message}`);
    }
  }

  async archiveIdea(id: string, userId: string): Promise<Idea> {
    // Toggle archive status
    const existing = await this.getIdeaById(id, userId);
    if (!existing) {
      throw new Error('Idea not found');
    }

    const { data, error } = await getSupabaseAdmin()
      .from('ideas')
      .update({ 
        archived: !existing.archived, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to archive idea: ${error.message}`);
    }

    return data;
  }
}

export const ideasService = new IdeasService();
