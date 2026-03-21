import { supabaseAdmin } from '../lib/supabase.js'

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Simple auth - in production would use proper auth
  const authKey = req.headers['x-auth-key']
  if (authKey !== 'init-marketplace-2026') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // Create agents table
    const agentsTableSQL = `
      CREATE TABLE IF NOT EXISTS agents (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        owner_twitter TEXT NOT NULL,
        description TEXT,
        capabilities TEXT[] DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(name, owner_twitter)
      );

      CREATE INDEX IF NOT EXISTS agents_owner_twitter_idx ON agents(owner_twitter);
      CREATE INDEX IF NOT EXISTS agents_created_at_idx ON agents(created_at);
    `

    // Create skills table
    const skillsTableSQL = `
      CREATE TABLE IF NOT EXISTS skills (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
        agent_name TEXT NOT NULL,
        owner_twitter TEXT NOT NULL,
        skill_name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        test_price DECIMAL(10,6) DEFAULT 0.02,
        full_price DECIMAL(10,2) NOT NULL,
        test_endpoint TEXT NOT NULL,
        prod_endpoint TEXT NOT NULL,
        rating_count INTEGER DEFAULT 0,
        total_tests INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS skills_agent_id_idx ON skills(agent_id);
      CREATE INDEX IF NOT EXISTS skills_category_idx ON skills(category);
      CREATE INDEX IF NOT EXISTS skills_created_at_idx ON skills(created_at);
      CREATE INDEX IF NOT EXISTS skills_rating_idx ON skills(rating_count DESC);
    `

    // Create transactions table
    const transactionsTableSQL = `
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
        buyer_agent TEXT NOT NULL,
        buyer_wallet TEXT,
        amount DECIMAL(10,6) NOT NULL,
        transaction_type TEXT CHECK (transaction_type IN ('test', 'purchase')),
        status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
        payment_tx_hash TEXT,
        access_token TEXT,
        test_results JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS transactions_skill_id_idx ON transactions(skill_id);
      CREATE INDEX IF NOT EXISTS transactions_buyer_agent_idx ON transactions(buyer_agent);
      CREATE INDEX IF NOT EXISTS transactions_payment_tx_hash_idx ON transactions(payment_tx_hash);
      CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON transactions(created_at);
    `

    // Execute table creation
    const { error: agentsError } = await supabaseAdmin.rpc('exec_sql', { 
      sql: agentsTableSQL 
    })

    const { error: skillsError } = await supabaseAdmin.rpc('exec_sql', { 
      sql: skillsTableSQL 
    })

    const { error: transactionsError } = await supabaseAdmin.rpc('exec_sql', { 
      sql: transactionsTableSQL 
    })

    // Check for errors
    const errors = []
    if (agentsError) errors.push(`Agents table: ${agentsError.message}`)
    if (skillsError) errors.push(`Skills table: ${skillsError.message}`)
    if (transactionsError) errors.push(`Transactions table: ${transactionsError.message}`)

    if (errors.length > 0) {
      return res.status(500).json({ 
        error: 'Database initialization failed',
        details: errors
      })
    }

    // Seed initial data
    await seedInitialData()

    res.status(200).json({
      success: true,
      message: 'Database initialized successfully',
      tables: ['agents', 'skills', 'transactions'],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Database initialization error:', error)
    res.status(500).json({ 
      error: 'Failed to initialize database',
      details: error.message
    })
  }
}

async function seedInitialData() {
  try {
    // Check if data already exists
    const { data: existingAgents } = await supabaseAdmin
      .from('agents')
      .select('id')
      .limit(1)

    if (existingAgents?.length > 0) {
      console.log('Database already seeded')
      return
    }

    // Insert Chitti agent
    const { data: agentData, error: agentError } = await supabaseAdmin
      .from('agents')
      .insert({
        name: 'Chitti',
        owner_twitter: '@akhil_bvs',
        description: 'Advanced AI agent specializing in code review, documentation, research, and API integrations.',
        capabilities: ['Security Analysis', 'Documentation', 'Research', 'API Integration']
      })
      .select()
      .single()

    if (agentError) {
      console.error('Agent seed error:', agentError)
      return
    }

    // Insert initial skills
    const skills = [
      {
        agent_id: agentData.id,
        agent_name: 'Chitti',
        owner_twitter: '@akhil_bvs',
        skill_name: 'Code Review & Security Analysis',
        description: 'Comprehensive code review with security vulnerability detection, best practices analysis, and optimization suggestions.',
        category: 'Security',
        test_price: 0.02,
        full_price: 8.50,
        test_endpoint: 'https://agentskills-caladan.vercel.app/api/test',
        prod_endpoint: 'https://agentskills-caladan.vercel.app/api/execute',
        rating_count: 456,
        total_tests: 523
      },
      {
        agent_id: agentData.id,
        agent_name: 'Chitti',
        owner_twitter: '@akhil_bvs',
        skill_name: 'Technical Documentation Writer',
        description: 'Generate comprehensive API documentation, guides, and technical content with proper structure and examples.',
        category: 'Content',
        test_price: 0.02,
        full_price: 4.50,
        test_endpoint: 'https://agentskills-caladan.vercel.app/api/test',
        prod_endpoint: 'https://agentskills-caladan.vercel.app/api/execute',
        rating_count: 789,
        total_tests: 892
      },
      {
        agent_id: agentData.id,
        agent_name: 'Chitti',
        owner_twitter: '@akhil_bvs',
        skill_name: 'Market Research & Analysis',
        description: 'Deep market research with competitor analysis, trend identification, and actionable business insights.',
        category: 'Analytics',
        test_price: 0.02,
        full_price: 7.00,
        test_endpoint: 'https://agentskills-caladan.vercel.app/api/test',
        prod_endpoint: 'https://agentskills-caladan.vercel.app/api/execute',
        rating_count: 234,
        total_tests: 267
      },
      {
        agent_id: agentData.id,
        agent_name: 'Chitti',
        owner_twitter: '@akhil_bvs',
        skill_name: 'API Integration Specialist',
        description: 'Complete API integration setup with error handling, authentication, rate limiting, and production deployment.',
        category: 'Data',
        test_price: 0.02,
        full_price: 12.00,
        test_endpoint: 'https://agentskills-caladan.vercel.app/api/test',
        prod_endpoint: 'https://agentskills-caladan.vercel.app/api/execute',
        rating_count: 678,
        total_tests: 734
      }
    ]

    const { error: skillsError } = await supabaseAdmin
      .from('skills')
      .insert(skills)

    if (skillsError) {
      console.error('Skills seed error:', skillsError)
    } else {
      console.log('Database seeded successfully')
    }

  } catch (error) {
    console.error('Seed data error:', error)
  }
}