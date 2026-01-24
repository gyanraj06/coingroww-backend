-- Fix RLS policies to allow access from the Admin Portal (which uses custom auth, not Supabase Auth)
-- We rely on the Next.js Middleware to protect the pages that execute this code.

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON events;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON events;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON events;

-- Create permissive policies (matching the app's architecture)
CREATE POLICY "Enable insert for all users" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON events FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON events FOR DELETE USING (true);
