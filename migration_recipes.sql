-- Add type to ingredients
alter table ingredients 
add column type text default 'raw'; -- 'raw' or 'dish'

-- Recipes Table
create table recipes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Recipe Items (Inputs and Outputs)
create table recipe_items (
  id uuid default gen_random_uuid() primary key,
  recipe_id uuid references recipes(id) on delete cascade not null,
  ingredient_id uuid references ingredients(id) not null,
  role text not null, -- 'input' or 'output'
  quantity numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Policies
alter table recipes enable row level security;
create policy "Users can crud their own recipes" on recipes
  for all using (auth.uid() = user_id);

alter table recipe_items enable row level security;
create policy "Users can crud their own recipe items" on recipe_items
  for all using (
    exists ( select 1 from recipes where id = recipe_items.recipe_id and user_id = auth.uid() )
  );

-- Indexes
create index idx_recipes_user on recipes(user_id);
create index idx_recipe_items_recipe on recipe_items(recipe_id);
