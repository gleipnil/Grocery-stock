-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 
-- Table: ingredients
--
create table ingredients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null,
  kana text, -- Reading/Fuzzy search key
  category text,
  expected_shelf_days integer default 7,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(user_id, name)
);

alter table ingredients enable row level security;

create policy "Users can view their own ingredients" on ingredients
  for select using (auth.uid() = user_id);

create policy "Users can insert their own ingredients" on ingredients
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own ingredients" on ingredients
  for update using (auth.uid() = user_id);

create policy "Users can delete their own ingredients" on ingredients
  for delete using (auth.uid() = user_id);

--
-- Table: stocks
--
create table stocks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  ingredient_id uuid references ingredients(id) not null,
  quantity numeric not null,
  purchased_at date default CURRENT_DATE,
  expire_at date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table stocks enable row level security;

create policy "Users can view their own stocks" on stocks
  for select using (auth.uid() = user_id);

create policy "Users can insert their own stocks" on stocks
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own stocks" on stocks
  for update using (auth.uid() = user_id);

create policy "Users can delete their own stocks" on stocks
  for delete using (auth.uid() = user_id);

--
-- Table: purchases
--
create table purchases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  ingredient_id uuid references ingredients(id) not null,
  quantity numeric not null,
  purchased_at date default CURRENT_DATE,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table purchases enable row level security;

create policy "Users can view their own purchases" on purchases
  for select using (auth.uid() = user_id);

create policy "Users can insert their own purchases" on purchases
  for insert with check (auth.uid() = user_id);

--
-- Table: consumption_history
--
create table consumption_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  ingredient_id uuid references ingredients(id), -- Nullable if ingredient deleted? Or just keep it.
  quantity numeric not null,
  used_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table consumption_history enable row level security;

create policy "Users can view their own consumption_history" on consumption_history
  for select using (auth.uid() = user_id);

create policy "Users can insert their own consumption_history" on consumption_history
  for insert with check (auth.uid() = user_id);

-- Indexes for performance
create index idx_stocks_user_ingredient on stocks(user_id, ingredient_id);
create index idx_stocks_expire_at on stocks(expire_at);
create index idx_ingredients_user_kana on ingredients(user_id, kana);
