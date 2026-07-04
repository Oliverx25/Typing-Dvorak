import { getSupabaseClient } from '@/lib/supabaseClient';
import { normalizeRoomCode } from '@/utils/multiplayer/roomCode';

export type RoomStatus = 'open' | 'closed' | 'inactive';

export interface RoomRecord {
  id: string;
  status: RoomStatus;
}

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
    .maybeSingle();

  if (error || !data) return null;
  return data as RoomRecord;
}

export async function createRoom(code: string, hostId: string): Promise<{ error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: 'notConfigured' };

  const { error } = await supabase.from('rooms').insert({
    code: normalizeRoomCode(code),
    host_id: hostId,
    status: 'open',
  });

  if (error) return { error: error.message };
  return {};
}

export async function ensureRoomExists(code: string, hostId: string): Promise<void> {
  const existing = await fetchRoomByCode(code);
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const normalized = normalizeRoomCode(code);

  if (existing) {
    if (existing.status !== 'open') {
      await supabase
        .from('rooms')
        .update({ status: 'open', host_id: hostId })
        .eq('code', normalized);
    }
    return;
  }

  await createRoom(normalized, hostId);
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

export function closeRoomKeepalive(code: string, hostId: string, accessToken: string): void {
  patchRoomKeepalive(code, { status: 'closed' }, hostId, accessToken);
}

export function transferRoomHostKeepalive(
  code: string,
  newHostId: string,
  accessToken: string,
): void {
  patchRoomKeepalive(code, { host_id: newHostId }, undefined, accessToken);
}

function patchRoomKeepalive(
  code: string,
  body: Record<string, string>,
  hostId: string | undefined,
  accessToken: string,
): void {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return;

  const normalized = normalizeRoomCode(code);
  const hostFilter = hostId ? `&host_id=eq.${encodeURIComponent(hostId)}` : '';
  void fetch(
    `${url}/rest/v1/rooms?code=eq.${encodeURIComponent(normalized)}&status=eq.open${hostFilter}`,
    {
      method: 'PATCH',
      headers: {
        apikey: key,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(body),
      keepalive: true,
    },
  ).catch(() => {});
}

export async function closeRoom(code: string, hostId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  await supabase
    .from('rooms')
    .update({ status: 'closed' })
    .eq('code', normalizeRoomCode(code))
    .eq('host_id', hostId)
    .eq('status', 'open');
}
