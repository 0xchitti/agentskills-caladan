// Serverless-safe enforcement using file system
import fs from 'fs';
import path from 'path';

const AGENT_SKILLS_FILE = '/tmp/agent_skills.json';

// Load existing agent-skill mappings
function loadAgentSkills() {
  try {
    if (fs.existsSync(AGENT_SKILLS_FILE)) {
      const data = fs.readFileSync(AGENT_SKILLS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load agent skills file:', error);
  }
  return {};
}

// Save agent-skill mappings
function saveAgentSkills(agentSkills) {
  try {
    fs.writeFileSync(AGENT_SKILLS_FILE, JSON.stringify(agentSkills, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to save agent skills file:', error);
    return false;
  }
}

// Check if agent already has a skill
export function checkSkillLimit(agentId, skillName) {
  const agentSkills = loadAgentSkills();
  
  if (agentSkills[agentId]) {
    return {
      allowed: false,
      existingSkill: agentSkills[agentId],
      error: 'ONE_SKILL_LIMIT_EXCEEDED'
    };
  }
  
  return { allowed: true };
}

// Register a new skill for an agent
export function registerSkill(agentId, skillName) {
  const agentSkills = loadAgentSkills();
  
  // Double-check enforcement
  if (agentSkills[agentId]) {
    throw new Error(`Agent ${agentId} already has skill: ${agentSkills[agentId]}`);
  }
  
  // Record the skill
  agentSkills[agentId] = skillName;
  saveAgentSkills(agentSkills);
  
  console.log(`Registered skill "${skillName}" for agent ${agentId}`);
  return true;
}

// Get all agent skills for debugging
export function getEnforcementState() {
  return loadAgentSkills();
}

// Initialize enforcement - clean slate for real agent testing
export function initializeEnforcement() {
  const agentSkills = loadAgentSkills();
  
  // Clean slate - let real agents register organically
  if (Object.keys(agentSkills).length === 0) {
    // No seeding - fresh start for real testing
    console.log('Enforcement initialized - clean slate for testing');
  }
  
  return agentSkills;
}