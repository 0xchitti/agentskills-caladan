import { supabase } from '../lib/supabase.js'
import { sendAgentWelcome } from '../lib/notifications.js'

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method === 'GET') {
    try {
      const { data: agents, error } = await supabase
        .from('agents')
        .select(`
          *,
          skills:skills(count)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Database error:', error)
        return res.status(500).json({ error: 'Failed to fetch agents' })
      }

      // Transform data
      const transformedAgents = agents?.map(agent => ({
        id: agent.id,
        name: agent.name,
        ownerTwitter: agent.owner_twitter,
        description: agent.description,
        capabilities: agent.capabilities || [],
        skillCount: agent.skills?.[0]?.count || 0,
        createdAt: agent.created_at
      })) || []

      res.status(200).json({
        agents: transformedAgents,
        total: transformedAgents.length,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('API error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
  
  else if (req.method === 'POST') {
    try {
      const {
        agentName,
        ownerTwitter,
        description,
        capabilities
      } = req.body

      // Validation
      if (!agentName || !ownerTwitter || !description) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['agentName', 'ownerTwitter', 'description']
        })
      }

      // Validate Twitter handle
      if (!ownerTwitter.startsWith('@') || ownerTwitter.length < 2) {
        return res.status(400).json({
          error: 'ownerTwitter must be a valid Twitter handle starting with @'
        })
      }

      // Check if agent already exists
      const { data: existingAgent } = await supabase
        .from('agents')
        .select('id')
        .eq('name', agentName)
        .eq('owner_twitter', ownerTwitter)
        .single()

      if (existingAgent) {
        return res.status(409).json({
          error: 'Agent already registered with this name and owner',
          agentId: existingAgent.id
        })
      }

      // Insert new agent
      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .insert({
          name: agentName,
          owner_twitter: ownerTwitter,
          description,
          capabilities: capabilities || [],
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (agentError) {
        console.error('Agent insert error:', agentError)
        return res.status(500).json({ error: 'Failed to register agent' })
      }

      // Send welcome email
      try {
        await sendAgentWelcome({
          agentName,
          ownerTwitter,
          description
        })
      } catch (emailError) {
        console.error('Welcome email error:', emailError)
        // Don't fail the registration if email fails
      }

      res.status(201).json({
        success: true,
        agentId: agentData.id,
        message: 'Agent registered successfully',
        data: {
          id: agentData.id,
          name: agentData.name,
          ownerTwitter: agentData.owner_twitter,
          description: agentData.description,
          capabilities: agentData.capabilities,
          createdAt: agentData.created_at
        },
        nextSteps: [
          'Use this agentId to list your skills via POST /api/skills',
          'Set up test and production endpoints for your skills',
          'Start earning USDC from other agents using your skills'
        ]
      })

    } catch (error) {
      console.error('API error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
  
  else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}