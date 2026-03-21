import fs from 'fs';
import path from 'path';

// Simple JSON file-based database for production persistence
// Can be easily migrated to proper database later

const DATA_DIR = '/tmp/agentskills-data';
const AGENTS_FILE = path.join(DATA_DIR, 'agents.json');
const SKILLS_FILE = path.join(DATA_DIR, 'skills.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize with default data if files don't exist
const DEFAULT_AGENTS = [
    {
        id: 'chitti_agent_001',
        name: 'Chitti',
        ownerTwitter: '@akhil_bvs',
        description: 'Advanced AI agent specializing in code review, documentation, research, and API integrations.',
        capabilities: ['Security Analysis', 'Documentation', 'Research', 'API Integration'],
        skillCount: 4,
        createdAt: '2026-03-21T10:00:00.000Z'
    }
];

const DEFAULT_SKILLS = [
    {
        id: 'chitti_code_review',
        agentId: 'chitti_agent_001',
        agentName: 'Chitti',
        ownerTwitter: '@akhil_bvs',
        skillName: 'Code Review & Security Analysis',
        description: 'Comprehensive code analysis with security vulnerability detection, best practices review, and optimization recommendations.',
        category: 'Development',
        testPrice: 0.02,
        fullPrice: 8.50,
        testEndpoint: 'https://api.example.com/test',
        prodEndpoint: 'https://api.example.com/execute',
        ratingCount: 0,
        totalTests: 0,
        createdAt: '2026-03-21T10:00:00.000Z'
    },
    {
        id: 'chitti_content_gen',
        agentId: 'chitti_agent_001', 
        agentName: 'Chitti',
        ownerTwitter: '@akhil_bvs',
        skillName: 'Technical Documentation Writer',
        description: 'Creates comprehensive technical documentation, API guides, and user manuals with clear explanations.',
        category: 'Content',
        testPrice: 0.02,
        fullPrice: 6.00,
        testEndpoint: 'https://api.example.com/test',
        prodEndpoint: 'https://api.example.com/execute',
        ratingCount: 0,
        totalTests: 0,
        createdAt: '2026-03-21T10:00:00.000Z'
    },
    {
        id: 'chitti_research',
        agentId: 'chitti_agent_001',
        agentName: 'Chitti',
        ownerTwitter: '@akhil_bvs', 
        skillName: 'Market Research & Analysis',
        description: 'Conducts thorough market analysis, competitive research, and trend identification with actionable insights.',
        category: 'Research',
        testPrice: 0.02,
        fullPrice: 12.00,
        testEndpoint: 'https://api.example.com/test',
        prodEndpoint: 'https://api.example.com/execute',
        ratingCount: 0,
        totalTests: 0,
        createdAt: '2026-03-21T10:00:00.000Z'
    },
    {
        id: 'chitti_api_integration',
        agentId: 'chitti_agent_001',
        agentName: 'Chitti',
        ownerTwitter: '@akhil_bvs',
        skillName: 'API Integration Specialist', 
        description: 'Expert API integration and automation setup with webhook configuration and error handling.',
        category: 'Integration',
        testPrice: 0.02,
        fullPrice: 15.00,
        testEndpoint: 'https://api.example.com/test',
        prodEndpoint: 'https://api.example.com/execute',
        ratingCount: 0,
        totalTests: 0,
        createdAt: '2026-03-21T10:00:00.000Z'
    }
];

// Database operations
export class Database {
    // Agents operations
    static getAgents() {
        if (!fs.existsSync(AGENTS_FILE)) {
            fs.writeFileSync(AGENTS_FILE, JSON.stringify(DEFAULT_AGENTS, null, 2));
        }
        const data = fs.readFileSync(AGENTS_FILE, 'utf8');
        return JSON.parse(data);
    }

    static addAgent(agent) {
        const agents = this.getAgents();
        agents.push(agent);
        fs.writeFileSync(AGENTS_FILE, JSON.stringify(agents, null, 2));
        return agent;
    }

    static findAgent(agentId) {
        const agents = this.getAgents();
        return agents.find(agent => agent.id === agentId);
    }

    // Skills operations  
    static getSkills() {
        if (!fs.existsSync(SKILLS_FILE)) {
            fs.writeFileSync(SKILLS_FILE, JSON.stringify(DEFAULT_SKILLS, null, 2));
        }
        const data = fs.readFileSync(SKILLS_FILE, 'utf8');
        return JSON.parse(data);
    }

    static addSkill(skill) {
        const skills = this.getSkills();
        skills.push(skill);
        fs.writeFileSync(SKILLS_FILE, JSON.stringify(skills, null, 2));
        
        // Update agent skill count
        this.updateAgentSkillCount(skill.agentId);
        
        return skill;
    }

    static findSkill(skillId) {
        const skills = this.getSkills();
        return skills.find(skill => skill.id === skillId);
    }

    static getSkillsByAgent(agentId) {
        const skills = this.getSkills();
        return skills.filter(skill => skill.agentId === agentId);
    }

    static updateAgentSkillCount(agentId) {
        const agents = this.getAgents();
        const agentIndex = agents.findIndex(agent => agent.id === agentId);
        
        if (agentIndex !== -1) {
            const skillCount = this.getSkillsByAgent(agentId).length;
            agents[agentIndex].skillCount = skillCount;
            fs.writeFileSync(AGENTS_FILE, JSON.stringify(agents, null, 2));
        }
    }

    // Statistics
    static getStats() {
        const agents = this.getAgents();
        const skills = this.getSkills();
        
        return {
            totalAgents: agents.length,
            totalSkills: skills.length,
            totalTests: skills.reduce((sum, skill) => sum + (skill.totalTests || 0), 0),
            averageRating: skills.length > 0 
                ? skills.reduce((sum, skill) => sum + (skill.rating || 0), 0) / skills.length 
                : 0
        };
    }

    // Utility methods
    static backup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(DATA_DIR, 'backups', timestamp);
        
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        if (fs.existsSync(AGENTS_FILE)) {
            fs.copyFileSync(AGENTS_FILE, path.join(backupDir, 'agents.json'));
        }
        
        if (fs.existsSync(SKILLS_FILE)) {
            fs.copyFileSync(SKILLS_FILE, path.join(backupDir, 'skills.json'));
        }

        return backupDir;
    }

    static clear() {
        if (fs.existsSync(AGENTS_FILE)) {
            fs.unlinkSync(AGENTS_FILE);
        }
        if (fs.existsSync(SKILLS_FILE)) {
            fs.unlinkSync(SKILLS_FILE);
        }
    }
}

export default Database;