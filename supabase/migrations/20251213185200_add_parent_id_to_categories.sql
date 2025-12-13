-- Add parent_id to categories table for subcategory support
ALTER TABLE categories
ADD COLUMN parent_id text REFERENCES categories(id) ON DELETE CASCADE;

-- Add index for better performance when querying subcategories
CREATE INDEX categories_parent_id_idx ON categories(parent_id);

-- Add comment
COMMENT ON COLUMN categories.parent_id IS 'ID of the parent category. NULL means it is a main category.';
