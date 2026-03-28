-- 1 Minute Lawyer Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  question_text TEXT NOT NULL,
  ai_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert questions
CREATE POLICY "Anyone can insert questions" ON questions
  FOR INSERT WITH CHECK (true);

-- Policy: Anyone can view questions
CREATE POLICY "Anyone can view questions" ON questions
  FOR SELECT USING (true);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  preferred_lawyer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert referrals
CREATE POLICY "Anyone can insert referrals" ON referrals
  FOR INSERT WITH CHECK (true);

-- Policy: Anyone can view referrals (for admin purposes)
CREATE POLICY "Anyone can view referrals" ON referrals
  FOR SELECT USING (true);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_question_id ON referrals(question_id);
