-- Room code reuse: partial unique index, delete-on-close support, stale cleanup
-- Run AFTER 08_multiplayer_rooms.sql on existing projects.

-- Drop global unique so the same code can exist again after a room is deleted.
alter table public.rooms drop constraint if exists rooms_code_key;

-- At most one OPEN room per code (active sessions only).
drop index if exists public.rooms_code_open_unique_idx;
create unique index rooms_code_open_unique_idx
  on public.rooms (code)
  where status = 'open';

-- Host may delete their own open room (close = delete row, frees the code).
drop policy if exists "rooms_delete_own_open" on public.rooms;
create policy "rooms_delete_own_open"
  on public.rooms for delete
  to authenticated
  using (auth.uid() = host_id and status = 'open');

-- Removes legacy closed rows and long-abandoned open rooms.
create or replace function public.purge_stale_rooms(stale_hours int default 168)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  removed integer;
begin
  delete from public.rooms
  where status in ('closed', 'inactive')
     or (
       status = 'open'
       and created_at < now() - make_interval(hours => greatest(stale_hours, 1))
     );

  get diagnostics removed = row_count;
  return removed;
end;
$$;

revoke all on function public.purge_stale_rooms(int) from public;
grant execute on function public.purge_stale_rooms(int) to authenticated;
