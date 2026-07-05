const MULTIPLAYER_ROOM_PATH = /\/multiplayer\/room\/?$/;

export type RoomExitHandler = () => Promise<void>;

let exitHandler: RoomExitHandler | null = null;
let exitInProgress = false;

export function isMultiplayerRoomPage(pathname = window.location.pathname): boolean {
  return MULTIPLAYER_ROOM_PATH.test(pathname);
}

export function registerRoomExitHandler(handler: RoomExitHandler | null): void {
  exitHandler = handler;
}

export function isRoomExitInProgress(): boolean {
  return exitInProgress;
}

/**
 * Runs the registered disconnect handler (untrack, host transfer/close) then navigates.
 * Safe to call from any leave affordance in the room UI or header.
 */
const PRESENCE_LEAVE_DELAY_MS = 400;

export async function executeRoomExit(redirectTo = '/multiplayer'): Promise<void> {
  if (exitInProgress) return;
  exitInProgress = true;

  try {
    if (exitHandler) {
      await exitHandler();
    }
    // Give Supabase Realtime time to propagate untrack before the page unloads.
    await new Promise((resolve) => setTimeout(resolve, PRESENCE_LEAVE_DELAY_MS));
  } finally {
    exitInProgress = false;
    window.location.href = redirectTo;
  }
}

/**
 * Intercepts in-app navigation while inside an active multiplayer room.
 */
export function handleRoomNavigationClick(
  event: { preventDefault: () => void },
  href: string,
): void {
  if (!isMultiplayerRoomPage()) return;
  event.preventDefault();
  void executeRoomExit(href);
}
