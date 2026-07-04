import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  executeRoomExit,
  handleRoomNavigationClick,
  isMultiplayerRoomPage,
  registerRoomExitHandler,
} from './roomExit';

function stubWindowLocation(pathname: string, href = '') {
  const location = { href, pathname };
  vi.stubGlobal('window', { location });
}

describe('roomExit', () => {
  beforeEach(() => {
    registerRoomExitHandler(null);
    stubWindowLocation('/multiplayer/room');
  });

  afterEach(() => {
    registerRoomExitHandler(null);
    vi.unstubAllGlobals();
  });

  it('detects multiplayer room pathname', () => {
    expect(isMultiplayerRoomPage('/multiplayer/room')).toBe(true);
    expect(isMultiplayerRoomPage('/multiplayer')).toBe(false);
  });

  it('runs handler then redirects on executeRoomExit', async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    registerRoomExitHandler(handler);

    await executeRoomExit('/stats');

    expect(handler).toHaveBeenCalledOnce();
    expect(window.location.href).toBe('/stats');
  });

  it('intercepts navigation on room page', () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    registerRoomExitHandler(handler);
    const preventDefault = vi.fn();

    handleRoomNavigationClick({ preventDefault }, '/');

    expect(preventDefault).toHaveBeenCalledOnce();
  });

  it('does not intercept navigation outside room page', () => {
    stubWindowLocation('/stats');
    const preventDefault = vi.fn();

    handleRoomNavigationClick({ preventDefault }, '/');

    expect(preventDefault).not.toHaveBeenCalled();
  });
});
