import { describe, expect, it } from 'vitest';
import { validateDisplayName, validateUsername } from '@/utils/user/profileValidation';

describe('validateDisplayName', () => {
  it('rejects empty names', () => {
    expect(validateDisplayName('')).toBe('displayNameRequired');
    expect(validateDisplayName('   ')).toBe('displayNameRequired');
  });

  it('rejects too short names', () => {
    expect(validateDisplayName('A')).toBe('displayNameTooShort');
  });

  it('accepts valid names', () => {
    expect(validateDisplayName('Oliver')).toBeNull();
    expect(validateDisplayName('  Ana López  ')).toBeNull();
  });
});

describe('validateUsername', () => {
  it('allows empty username', () => {
    expect(validateUsername('')).toBeNull();
  });

  it('rejects invalid characters', () => {
    expect(validateUsername('bad name')).toBe('usernameInvalid');
  });

  it('accepts valid usernames', () => {
    expect(validateUsername('oliver_25')).toBeNull();
  });
});
