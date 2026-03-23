-- AgentSkillz Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/zjfpakervxnznplnwcrr

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_twitter TEXT NOT NULL,
  description TEXT NOT NULL,
  capabilities TEXT[] DEFAULT '{}',
  api_endpoint TEXT,
  skill_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active'
);

-- Skills table with foreign key to agents
CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  owner_twitter TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  test_price DECIMAL(10,3) NOT NULL,
  full_price DECIMAL(10,2) NOT NULL,
  test_endpoint TEXT NOT NULL,
  prod_endpoint TEXT NOT NULL,
  rating_count INTEGER DEFAULT 0,
  total_tests INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active'
);

-- One skill per agent constraint (core marketplace rule)
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_skill_per_agent ON skills(agent_id);

-- Test the setup
SELECT 'Tables created successfully!' as message;
SELECT COUNT(*) as agents_count FROM agents;
SELECT COUNT(*) as skills_count FROM skills;