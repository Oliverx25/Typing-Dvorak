import { describe, expect, it } from 'vitest';
import { getFingerForKey, HOME_ROW_FINGERS } from './fingers';

describe('fingers — Dvorak home row', () => {
  it('assigns correct fingers on the home row', () => {
    expect(getFingerForKey('KeyA')).toBe('lp');
    expect(getFingerForKey('KeyO')).toBe('lr');
    expect(getFingerForKey('KeyE')).toBe('lm');
    expect(getFingerForKey('KeyU')).toBe('li');
    expect(getFingerForKey('KeyI')).toBe('li');
    expect(getFingerForKey('KeyD')).toBe('ri');
    expect(getFingerForKey('KeyH')).toBe('ri');
    expect(getFingerForKey('KeyT')).toBe('rm');
    expect(getFingerForKey('KeyN')).toBe('rr');
    expect(getFingerForKey('KeyS')).toBe('rp');
  });

  it('HOME_ROW_FINGERS matches getFingerForKey', () => {
    for (const [code, finger] of Object.entries(HOME_ROW_FINGERS)) {
      expect(getFingerForKey(code)).toBe(finger);
    }
  });
});

describe('fingers — vertical column reach', () => {
  it('maps t column keys to right middle', () => {
    expect(getFingerForKey('KeyT')).toBe('rm');
    expect(getFingerForKey('KeyC')).toBe('rm');
    expect(getFingerForKey('KeyW')).toBe('rm');
  });

  it('maps n column keys to right ring', () => {
    expect(getFingerForKey('KeyN')).toBe('rr');
    expect(getFingerForKey('KeyR')).toBe('rr');
    expect(getFingerForKey('KeyV')).toBe('rr');
  });

  it('maps u column keys to left index', () => {
    expect(getFingerForKey('KeyU')).toBe('li');
    expect(getFingerForKey('KeyI')).toBe('li');
    expect(getFingerForKey('KeyP')).toBe('li');
    expect(getFingerForKey('KeyK')).toBe('li');
  });

  it('maps h column keys to right index', () => {
    expect(getFingerForKey('KeyH')).toBe('ri');
    expect(getFingerForKey('KeyD')).toBe('ri');
    expect(getFingerForKey('KeyG')).toBe('ri');
    expect(getFingerForKey('KeyB')).toBe('ri');
    expect(getFingerForKey('KeyM')).toBe('ri');
  });
});
