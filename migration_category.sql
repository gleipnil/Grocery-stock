-- Add category column to ingredients
alter table ingredients 
add column category text default '冷蔵庫';

-- Update existing records to default (already handled by default but explicit is good)
update ingredients set category = '冷蔵庫' where category is null;

-- Add index for performance
create index idx_ingredients_category on ingredients(category);

-- Comment: Valid categories are '冷蔵庫', '棚', '倉庫'
