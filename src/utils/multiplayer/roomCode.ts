const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Generates a short, human-readable room code (no ambiguous 0/O, 1/I). */
export function generateRoomCode(length = 6): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)]!;
  }
  return code;
}

/** Normalizes user input into a valid room code segment. */
export function normalizeRoomCode(input: string): string {
  return input.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
}

/** Static lobby URL — avoids SSR dynamic routes on Vercel. */
export function roomUrl(code: string): string {
  const normalized = normalizeRoomCode(code);
  return `/multiplayer/room?code=${encodeURIComponent(normalized)}`;
}

/** Reads a room code from the current page query string. */
export function readRoomCodeFromSearch(search: string): string {
  const raw = new URLSearchParams(search).get('code') ?? '';
  return normalizeRoomCode(raw);
}
