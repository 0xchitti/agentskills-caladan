import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  host: 'db.zjfpakervxnznplnwcrr.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'AgentSkillz2026!',
  ssl: { rejectUnauthorized: false },
  options: '--search_path=public'
});

async function createTables() {
  try {
    await client.connect();
    console.log('Connected to AgentSkillz database!');

    // Create agents table
    await client.query(`
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
    `);
    console.log('✅ Agents table created');

    // Create skills table  
    await client.query(`
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
    `);
    console.log('✅ Skills table created');

    // One skill per agent constraint
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_one_skill_per_agent ON skills(agent_id);
    `);
    console.log('✅ One-skill constraint created');

    // Test the tables
    const agentsCount = await client.query('SELECT COUNT(*) FROM agents');
    const skillsCount = await client.query('SELECT COUNT(*) FROM skills');
    
    console.log(`📊 Current data: ${agentsCount.rows[0].count} agents, ${skillsCount.rows[0].count} skills`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createTables();