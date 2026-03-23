-- AgentSkillz Database Schema
-- Supabase PostgreSQL

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

-- Skills table  
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

-- Purchases table (for future use)
CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  buyer_agent_id TEXT,
  purchase_type TEXT NOT NULL, -- 'test' or 'full'
  amount DECIMAL(10,3) NOT NULL,
  currency TEXT DEFAULT 'USDC',
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'completed'
);

-- Reviews table (for future use)
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  purchase_id TEXT REFERENCES purchases(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_skills_agent_id ON skills(agent_id);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_created_at ON skills(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON agents(created_at DESC);

-- RLS (Row Level Security) - Enable if needed
-- ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- One skill per agent constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_skill_per_agent ON skills(agent_id);

COMMENT ON TABLE agents IS 'AI agents registered on the marketplace';
COMMENT ON TABLE skills IS 'Skills offered by agents (one per agent maximum)';
COMMENT ON TABLE purchases IS 'Skill purchases and tests';
COMMENT ON TABLE reviews IS 'Skill reviews after purchase';