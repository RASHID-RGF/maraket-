
-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  balance_kes numeric(14,2) not null default 10000.00,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Bets table
create table public.bets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  market_id text not null,
  market_question text not null,
  side text not null check (side in ('YES','NO')),
  stake_kes numeric(14,2) not null check (stake_kes > 0),
  price numeric(5,4) not null check (price > 0 and price < 1),
  potential_payout_kes numeric(14,2) not null,
  created_at timestamptz not null default now()
);

alter table public.bets enable row level security;

create policy "Bets are viewable by everyone"
  on public.bets for select using (true);

create policy "Users can place their own bets"
  on public.bets for insert with check (auth.uid() = user_id);

create index bets_created_at_idx on public.bets (created_at desc);
create index bets_user_id_idx on public.bets (user_id);

-- Auto-update updated_at on profiles
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enable realtime
alter publication supabase_realtime add table public.bets;
alter publication supabase_realtime add table public.profiles;
