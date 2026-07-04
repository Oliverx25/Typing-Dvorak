-- Typing Dvorak — profile preferences + self-service account deletion
-- Run AFTER 05_profile_display_name_custom.sql in Supabase SQL Editor

alter table public.profiles
  add column if not exists locale text check (locale in ('en', 'es')),
  add column if not exists multiplayer_privacy text not null default 'public'
    check (multiplayer_privacy in ('public', 'initials', 'anonymous'));

-- Lets authenticated users delete their own auth.users row (cascades to profiles, sessions, etc.).
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
