-- Multiplayer room registry (join validation + lifecycle)
-- Only OPEN rows are kept while a session is active; closing deletes the row.
create table if not exists public.rooms (
  id          uuid primary key default gen_random_uuid(),
  code        text not null,
  host_id     uuid not null references public.profiles (id) on delete cascade,
  status      text not null default 'open' check (status in ('open', 'closed', 'inactive')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists rooms_code_idx on public.rooms (code);
create index if not exists rooms_code_status_idx on public.rooms (code, status);

-- One active room per code; closed rows (legacy) may coexist until purged.
create unique index if not exists rooms_code_open_unique_idx
  on public.rooms (code)
  where status = 'open';

create or replace function public.set_rooms_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists rooms_updated_at on public.rooms;
create trigger rooms_updated_at
  before update on public.rooms
  for each row execute function public.set_rooms_updated_at();

alter table public.rooms enable row level security;

drop policy if exists "rooms_select_open" on public.rooms;
create policy "rooms_select_open"
  on public.rooms for select
  using (status = 'open' or auth.uid() = host_id);

drop policy if exists "rooms_insert_own" on public.rooms;
create policy "rooms_insert_own"
  on public.rooms for insert
  to authenticated
  with check (auth.uid() = host_id);

drop policy if exists "rooms_update_own" on public.rooms;
create policy "rooms_update_own"
  on public.rooms for update
  to authenticated
  using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

drop policy if exists "rooms_delete_own_open" on public.rooms;
create policy "rooms_delete_own_open"
  on public.rooms for delete
  to authenticated
  using (auth.uid() = host_id and status = 'open');

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
