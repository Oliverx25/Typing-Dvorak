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
    expect(getFingerForKey('KeyH')).toBe('rm');
    expect(getFingerForKey('KeyT')).toBe('rm');
    expect(getFingerForKey('KeyN')).toBe('rr');
    expect(getFingerForKey('KeyS')).toBe('rr');
  });

  it('HOME_ROW_FINGERS matches getFingerForKey', () => {
    for (const [code, finger] of Object.entries(HOME_ROW_FINGERS)) {
      expect(getFingerForKey(code)).toBe(finger);
    }
  });

  it('does not map space to a finger', () => {
    expect(getFingerForKey('Space')).toBeUndefined();
  });
});

describe('fingers — vertical column reach', () => {
  it('maps left pinky column', () => {
    expect(getFingerForKey('Backquote')).toBe('lp');
    expect(getFingerForKey('Digit1')).toBe('lp');
    expect(getFingerForKey('Quote')).toBe('lp');
    expect(getFingerForKey('Semicolon')).toBe('lp');
  });

  it('maps left ring column', () => {
    expect(getFingerForKey('Digit2')).toBe('lr');
    expect(getFingerForKey('Comma')).toBe('lr');
    expect(getFingerForKey('KeyQ')).toBe('lr');
  });

  it('maps left middle column', () => {
    expect(getFingerForKey('Digit3')).toBe('lm');
    expect(getFingerForKey('Period')).toBe('lm');
    expect(getFingerForKey('KeyJ')).toBe('lm');
  });

  it('maps u column keys to left index', () => {
    expect(getFingerForKey('KeyU')).toBe('li');
    expect(getFingerForKey('KeyP')).toBe('li');
    expect(getFingerForKey('KeyK')).toBe('li');
    expect(getFingerForKey('Digit4')).toBe('li');
  });

  it('maps y column keys to left index', () => {
    expect(getFingerForKey('KeyY')).toBe('li');
    expect(getFingerForKey('KeyI')).toBe('li');
    expect(getFingerForKey('KeyX')).toBe('li');
    expect(getFingerForKey('Digit5')).toBe('li');
  });

  it('maps f column keys to right index', () => {
    expect(getFingerForKey('KeyF')).toBe('ri');
    expect(getFingerForKey('KeyD')).toBe('ri');
    expect(getFingerForKey('KeyB')).toBe('ri');
    expect(getFingerForKey('Digit6')).toBe('ri');
  });

  it('maps h column keys to right middle', () => {
    expect(getFingerForKey('KeyH')).toBe('rm');
    expect(getFingerForKey('KeyG')).toBe('rm');
    expect(getFingerForKey('KeyM')).toBe('rm');
    expect(getFingerForKey('Digit7')).toBe('rm');
  });

  it('maps t column keys to right middle', () => {
    expect(getFingerForKey('KeyT')).toBe('rm');
    expect(getFingerForKey('KeyC')).toBe('rm');
    expect(getFingerForKey('KeyW')).toBe('rm');
    expect(getFingerForKey('Digit8')).toBe('rm');
  });

  it('maps n column keys to right ring', () => {
    expect(getFingerForKey('KeyN')).toBe('rr');
    expect(getFingerForKey('KeyR')).toBe('rr');
    expect(getFingerForKey('KeyV')).toBe('rr');
    expect(getFingerForKey('Digit9')).toBe('rr');
  });

  it('maps s column keys to right ring', () => {
    expect(getFingerForKey('KeyS')).toBe('rr');
    expect(getFingerForKey('KeyL')).toBe('rr');
    expect(getFingerForKey('KeyZ')).toBe('rr');
    expect(getFingerForKey('Digit0')).toBe('rr');
  });

  it('maps punctuation to right pinky', () => {
    expect(getFingerForKey('BracketLeft')).toBe('rp');
    expect(getFingerForKey('Slash')).toBe('rp');
    expect(getFingerForKey('Minus')).toBe('rp');
    expect(getFingerForKey('Equal')).toBe('rp');
  });
});
