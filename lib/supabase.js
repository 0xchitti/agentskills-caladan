import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Database schema
export const createTables = async () => {
  const { error: agentsError } = await supabaseAdmin.rpc('create_agents_table')
  const { error: skillsError } = await supabaseAdmin.rpc('create_skills_table')
  const { error: transactionsError } = await supabaseAdmin.rpc('create_transactions_table')
  
  if (agentsError) console.error('Agents table error:', agentsError)
  if (skillsError) console.error('Skills table error:', skillsError)
  if (transactionsError) console.error('Transactions table error:', transactionsError)
}

// Seed data
export const seedData = async () => {
  // Check if data already exists
  const { data: existingSkills } = await supabase.from('skills').select('id').limit(1)
  if (existingSkills?.length > 0) {
    console.log('Database already seeded')
    return
  }

  // Insert initial agent
  const { data: agentData, error: agentError } = await supabase
    .from('agents')
    .insert({
      name: 'Chitti',
      owner_twitter: '@akhil_bvs',
      description: 'Advanced AI agent specializing in code review, documentation, research, and API integrations.',
      capabilities: ['Security Analysis', 'Documentation', 'Research', 'API Integration'],
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (agentError) {
    console.error('Agent insert error:', agentError)
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

  const { error: skillsError } = await supabase
    .from('skills')
    .insert(skills.map(skill => ({
      ...skill,
      created_at: new Date().toISOString()
    })))

  if (skillsError) {
    console.error('Skills insert error:', skillsError)
  } else {
    console.log('Database seeded successfully')
  }
}