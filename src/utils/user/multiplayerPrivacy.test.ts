import { describe, expect, it } from 'vitest';
import type { User } from '@supabase/supabase-js';
import { getMultiplayerPresenceDisplay } from './multiplayerPrivacy';

const baseUser = {
  id: 'user-1',
  email: 'test@example.com',
  user_metadata: { full_name: 'Jane Doe' },
  identities: [],
} as unknown as User;

describe('getMultiplayerPresenceDisplay', () => {
  it('shows full identity in public mode', () => {
    const result = getMultiplayerPresenceDisplay(baseUser, {
      display_name: 'Jane Doe',
      multiplayer_privacy: 'public',
    });
    expect(result.name).toBe('Jane Doe');
  });

  it('shows initials only in initials mode', () => {
    const result = getMultiplayerPresenceDisplay(baseUser, {
      display_name: 'Jane Doe',
      multiplayer_privacy: 'initials',
    });
    expect(result.name).toBe('JD');
    expect(result.avatarUrl).toBeNull();
  });

  it('uses username in anonymous mode', () => {
    const result = getMultiplayerPresenceDisplay(baseUser, {
      display_name: 'Jane Doe',
      username: 'jane_d',
      multiplayer_privacy: 'anonymous',
    });
    expect(result.name).toBe('jane_d');
    expect(result.avatarUrl).toBeNull();
  });
});
