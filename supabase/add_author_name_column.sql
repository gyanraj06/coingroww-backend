-- Migration: Add author_name column to posts table
-- Date: 2026-01-24
-- Description: Adds support for storing author names with each post/article

-- Add the author_name column to the posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS author_name TEXT DEFAULT NULL;

-- Optional: Create an index for faster author-based queries (if you plan to filter by author)
-- CREATE INDEX IF NOT EXISTS idx_posts_author_name ON posts(author_name);

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'posts' AND column_name = 'author_name';
