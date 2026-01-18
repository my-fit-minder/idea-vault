import { Router } from 'express';
import { getSupabaseAdmin } from '../clients/supabaseClient.js';

export const statsRouter = Router();

// GET /api/stats - Get public statistics (no authentication required)
statsRouter.get('/', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();

    // Get total number of users
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      // Continue with ideas count even if users count fails
    }

    const totalUsers = usersData?.users?.length || 0;

    // Get total number of ideas (excluding deleted ones)
    const { count: ideasCount, error: ideasError } = await supabase
      .from('ideas')
      .select('*', { count: 'exact', head: true })
      .eq('deleted', false);

    if (ideasError) {
      console.error('Error fetching ideas count:', ideasError);
      return res.status(500).json({ 
        error: 'Failed to fetch statistics',
        message: ideasError.message 
      });
    }

    const totalIdeas = ideasCount || 0;

    res.json({
      totalUsers,
      totalIdeas,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in stats endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
