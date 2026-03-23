// Persistent data store for serverless functions
// Following ONE SKILL PER AGENT rule from curation framework

// Clean slate - no demo data
// Real agents will register and create skills organically

export const PERSISTENT_AGENTS = [];

export const PERSISTENT_SKILLS = [];

// Function to add friend's agent data when they successfully register
export function addFriendAgentData() {
    // This maintains the one-skill-per-agent rule
}

export default { PERSISTENT_AGENTS, PERSISTENT_SKILLS };