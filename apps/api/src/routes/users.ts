import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { getSupabaseAdmin } from '../clients/supabaseClient.js';

export const usersRouter = Router();

// GET /api/users/check-username/:username - Check if username is available
usersRouter.get('/check-username/:username', authenticate, async (req: AuthRequest, res) => {
  const username = req.params.username as string;

  if (!username || username.trim().length === 0) {
    return res.status(400).json({ error: 'Username is required' });
  }

  // Validate format
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: 'Username must be between 3 and 20 characters' });
  }

  if (!/^[a-zA-Z]/.test(username)) {
    return res.status(400).json({ error: 'Username must start with a letter' });
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
  }

  try {
    // Check if username exists in any user's metadata
    const { data: users, error } = await getSupabaseAdmin()
      .auth.admin.listUsers();

    if (error) {
      throw error;
    }

    // Check if username is already taken (excluding current user)
    const usernameTaken = users.users.some(
      (user) =>
        user.id !== req.user?.id &&
        (user.user_metadata?.username?.toLowerCase() === username.toLowerCase())
    );

    res.json({ available: !usernameTaken });
  } catch (error: any) {
    console.error('Error checking username:', error);
    res.status(500).json({ error: 'Failed to check username availability' });
  }
});
