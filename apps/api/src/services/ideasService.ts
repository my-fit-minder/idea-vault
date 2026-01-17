import { getSupabaseAdmin } from '../clients/supabaseClient.js';
import type { Idea, CreateIdeaInput, UpdateIdeaInput } from '@idea-vault/shared';

export class IdeasService {
  async getAllIdeas(userId: string): Promise<Idea[]> {
    const { data, error } = await getSupabaseAdmin()
      .from('ideas')
      .select('*')
      .eq('user_id', userId)
      .eq('deleted', false) // Filter out soft-deleted items
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch ideas: ${error.message}`);
    }

    return data || [];
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
