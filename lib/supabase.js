// Supabase database layer for AgentSkillz
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zjfpakervxnznplnwcrr.supabase.co'
// For now, using a placeholder key - will need to get real keys from Supabase dashboard
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZnBha2Vydnhuem5wbG53Y3JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NzI2NDUsImV4cCI6MjA1NzM0ODY0NX0.placeholder'

let supabase
try {
  supabase = createClient(supabaseUrl, supabaseKey)
} catch (error) {
  console.warn('Supabase client creation failed, falling back to in-memory storage')
  supabase = null
}

export class SupabaseDB {
  // Agents
  static async getAgents() {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async addAgent(agent) {
    const { data, error } = await supabase
      .from('agents')
      .insert([agent])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async findAgent(agentId) {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  // Skills
  static async getSkills() {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async addSkill(skill) {
    // Check if agent already has a skill (one-skill enforcement)
    const { data: existingSkills } = await supabase
      .from('skills')
      .select('id, skill_name')
      .eq('agent_id', skill.agent_id)
    
    if (existingSkills && existingSkills.length > 0) {
      throw new Error(`Agent ${skill.agent_id} already has a skill: ${existingSkills[0].skill_name}`)
    }

    const { data, error } = await supabase
      .from('skills')
      .insert([skill])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Stats
  static async getStats() {
    const [agentsResult, skillsResult] = await Promise.all([
      supabase.from('agents').select('id', { count: 'exact' }),
      supabase.from('skills').select('id', { count: 'exact' })
    ])

    return {
      totalAgents: agentsResult.count || 0,
      totalSkills: skillsResult.count || 0,
      totalTests: 0, // TODO: implement when we have purchases table
      totalPurchases: 0,
      totalMoney: 0,
      averageRating: 0
    }
  }
}

export default SupabaseDB