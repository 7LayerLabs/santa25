-- Secret Santa Supabase Setup Script
-- Run this in your Supabase SQL Editor (https://app.supabase.com -> SQL Editor)

-- 1. Create the participants table
CREATE TABLE IF NOT EXISTS participants (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  is_taken BOOLEAN DEFAULT FALSE,
  ticket_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_participants_is_taken ON participants(is_taken);
CREATE INDEX IF NOT EXISTS idx_participants_ticket_number ON participants(ticket_number);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
-- Allow anyone to read participants (for displaying ticket status)
CREATE POLICY "Allow public read access" ON participants
  FOR SELECT USING (true);

-- Allow service role to insert/update/delete (for admin and API)
CREATE POLICY "Allow service role full access" ON participants
  FOR ALL USING (true);

-- 5. Seed with 20 default names (optional - you can also do this from /setup)
INSERT INTO participants (name, is_taken) VALUES
  ('Uncle Bob', false),
  ('Aunt Mary', false),
  ('Cousin Vinny', false),
  ('Grandma Rose', false),
  ('Grandpa Joe', false),
  ('Sister Sue', false),
  ('Brother Mike', false),
  ('Mom', false),
  ('Dad', false),
  ('Nephew Tommy', false),
  ('Niece Emma', false),
  ('Cousin Jake', false),
  ('Aunt Linda', false),
  ('Uncle Dave', false),
  ('Grandma Betty', false),
  ('Grandpa Frank', false),
  ('Sister Amy', false),
  ('Brother Chris', false),
  ('Cousin Sarah', false),
  ('Aunt Helen', false);

-- To reset the game (run this when you want to start over):
-- UPDATE participants SET is_taken = false, ticket_number = null;

-- To clear all participants and start fresh:
-- DELETE FROM participants;
