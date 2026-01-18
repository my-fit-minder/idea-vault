// Username generation and validation utilities

const ADJECTIVES = [
  'cool', 'awesome', 'swift', 'bright', 'clever', 'quick', 'bold', 'calm',
  'wise', 'brave', 'calm', 'epic', 'fresh', 'keen', 'neat', 'prime',
  'rapid', 'sharp', 'smart', 'super', 'vivid', 'zesty', 'cosmic', 'stellar'
];

const NOUNS = [
  'user', 'star', 'wave', 'beam', 'bolt', 'dash', 'flash', 'glow',
  'peak', 'rock', 'spark', 'storm', 'surge', 'thunder', 'titan', 'vortex',
  'ace', 'hero', 'nova', 'phoenix', 'tiger', 'eagle', 'wolf', 'dragon'
];

/**
 * Generates a random username that looks like a real username
 * Format: adjective + noun + random number (e.g., "cooluser123")
 */
export function generateRandomUsername(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const number = Math.floor(Math.random() * 9999) + 1;
  
  return `${adjective}${noun}${number}`;
}

/**
 * Validates username format
 * - 3-20 characters
 * - Only alphanumeric characters and underscores
 * - Must start with a letter
 */
export function validateUsernameFormat(username: string): { valid: boolean; error?: string } {
  if (!username || username.trim().length === 0) {
    return { valid: false, error: 'Username is required' };
  }

  const trimmed = username.trim();

  if (trimmed.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters long' };
  }

  if (trimmed.length > 20) {
    return { valid: false, error: 'Username must be 20 characters or less' };
  }

  if (!/^[a-zA-Z]/.test(trimmed)) {
    return { valid: false, error: 'Username must start with a letter' };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }

  return { valid: true };
}
