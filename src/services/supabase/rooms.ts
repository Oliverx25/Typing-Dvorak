import { getSupabaseClient } from '@/lib/supabaseClient';
import { normalizeRoomCode } from '@/utils/multiplayer/roomCode';

export type RoomStatus = 'open' | 'closed' | 'inactive';

export interface RoomRecord {
  id: string;
  status: RoomStatus;
}

/** Default: purge closed/inactive rows and open rooms older than 7 days. */
export const STALE_ROOM_HOURS = 168;

export function isRoomJoinable(room: RoomRecord | null): boolean {
  return room !== null && room.status === 'open';
}

export async function fetchRoomByCode(code: string): Promise<RoomRecord | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const normalized = normalizeRoomCode(code);
  const { data, error } = await supabase
    .from('rooms')
    .select('id, status')
    .eq('code', normalized)
    .eq('status', 'open')
    .maybeSingle();

  if (error || !data) return null;
  return data as RoomRecord;
}

/** Deletes legacy closed/inactive rows and long-abandoned open rooms. Fire-and-forget safe. */
export async function purgeStaleRooms(staleHours = STALE_ROOM_HOURS): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  await supabase.rpc('purge_stale_rooms', { stale_hours: staleHours });
}

export async function createRoom(code: string, hostId: string): Promise<{ error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: 'notConfigured' };

  void purgeStaleRooms();

  const normalized = normalizeRoomCode(code);

  const { error } = await supabase.from('rooms').insert({
    code: normalized,
    host_id: hostId,
    status: 'open',
  });

  if (error) return { error: error.message };
  return {};
}

export async function ensureRoomExists(code: string, hostId: string): Promise<void> {
  const existing = await fetchRoomByCode(code);
  if (existing) return;

  await createRoom(code, hostId);
}

export async function transferRoomHost(code: string, newHostId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  await supabase
    .from('rooms')
    .update({ host_id: newHostId })
    .eq('code', normalizeRoomCode(code))
    .eq('status', 'open');
}

function deleteRoomKeepalive(code: string, hostId: string, accessToken: string): void {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return;

  const normalized = normalizeRoomCode(code);
  void fetch(
    `${url}/rest/v1/rooms?code=eq.${encodeURIComponent(normalized)}&host_id=eq.${encodeURIComponent(hostId)}&status=eq.open`,
    {
      method: 'DELETE',
      headers: {
        apikey: key,
        Authorization: `Bearer ${accessToken}`,
        Prefer: 'return=minimal',
      },
      keepalive: true,
    },
  ).catch(() => {});
}

export function closeRoomKeepalive(code: string, hostId: string, accessToken: string): void {
  deleteRoomKeepalive(code, hostId, accessToken);
}

export function transferRoomHostKeepalive(
  code: string,
  newHostId: string,
  accessToken: string,
): void {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return;

  const normalized = normalizeRoomCode(code);
  void fetch(
    `${url}/rest/v1/rooms?code=eq.${encodeURIComponent(normalized)}&status=eq.open`,
    {
      method: 'PATCH',
      headers: {
        apikey: key,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ host_id: newHostId }),
      keepalive: true,
    },
  ).catch(() => {});
}

/** Closes a room by deleting its row so the code can be reused immediately. */
export async function closeRoom(code: string, hostId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  await supabase
    .from('rooms')
    .delete()
    .eq('code', normalizeRoomCode(code))
    .eq('host_id', hostId)
    .eq('status', 'open');
}
