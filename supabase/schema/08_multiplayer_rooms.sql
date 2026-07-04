-- Multiplayer room registry (join validation + lifecycle)
create table if not exists public.rooms (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  host_id     uuid not null references public.profiles (id) on delete cascade,
  status      text not null default 'open' check (status in ('open', 'closed', 'inactive')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists rooms_code_idx on public.rooms (code);
create index if not exists rooms_code_status_idx on public.rooms (code, status);

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
