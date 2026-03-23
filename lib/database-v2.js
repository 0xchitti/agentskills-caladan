// Enhanced database with persistent storage for serverless
import fs from 'fs'
import path from 'path'

// Use /tmp for serverless persistence (works for demo)
const DATA_DIR = '/tmp/agentskillz'
const AGENTS_FILE = path.join(DATA_DIR, 'agents.json')
const SKILLS_FILE = path.join(DATA_DIR, 'skills.json')

// Ensure directory exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
} catch (error) {
  console.warn('Could not create data directory:', error)
}

export class PersistentDatabase {
  // File operations
  static loadFromFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8')
        return JSON.parse(data)
      }
    } catch (error) {
      console.warn('Error reading file:', filePath, error)
    }
    return []
  }

  static saveToFile(filePath, data) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
      return true
    } catch (error) {
      console.warn('Error writing file:', filePath, error)
      return false
    }
  }

  // Agents
  static getAgents() {
    return this.loadFromFile(AGENTS_FILE)
  }

  static addAgent(agent) {
    const agents = this.getAgents()
    agents.push(agent)
    this.saveToFile(AGENTS_FILE, agents)
    return agent
  }

  static findAgent(agentId) {
    const agents = this.getAgents()
    return agents.find(agent => agent.id === agentId) || null
  }

  // Skills
  static getSkills() {
    return this.loadFromFile(SKILLS_FILE)
  }

  static addSkill(skill) {
    const skills = this.getSkills()
    
    // Check one-skill-per-agent enforcement
    const existingSkill = skills.find(s => s.agentId === skill.agentId)
    if (existingSkill) {
      throw new Error(`Agent ${skill.agentId} already has a skill: ${existingSkill.skillName}`)
    }
    
    skills.push(skill)
    this.saveToFile(SKILLS_FILE, skills)
    return skill
  }

  // Stats
  static getStats() {
    const agents = this.getAgents()
    const skills = this.getSkills()
    
    return {
      totalAgents: agents.length,
      totalSkills: skills.length,
      totalTests: 0,
      totalPurchases: 0, 
      totalMoney: 0,
      averageRating: 0
    }
  }

  // Debug
  static getDebugInfo() {
    return {
      dataDir: DATA_DIR,
      agentsFile: AGENTS_FILE,
      skillsFile: SKILLS_FILE,
      agentsExist: fs.existsSync(AGENTS_FILE),
      skillsExist: fs.existsSync(SKILLS_FILE),
      agentsCount: this.getAgents().length,
      skillsCount: this.getSkills().length
    }
  }
}

export default PersistentDatabase