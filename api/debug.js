import PersistentDatabase from '../lib/database-v2.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method === 'GET') {
    try {
      const debug = PersistentDatabase.getDebugInfo();
      const agents = PersistentDatabase.getAgents();
      const skills = PersistentDatabase.getSkills();
      const stats = PersistentDatabase.getStats();
      
      res.status(200).json({
        debug: debug,
        agents: agents,
        skills: skills,
        stats: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Debug error:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}