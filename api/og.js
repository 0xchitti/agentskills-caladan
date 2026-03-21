// Simple OG image without @vercel/og dependency

// Remove edge runtime config that's causing issues

export default function handler(req, res) {
  // Generate a simple SVG OG image
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="1" fill="#D5E8D4" opacity="0.1"/>
        </pattern>
      </defs>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="#111E16"/>
      <rect width="100%" height="100%" fill="url(#grid)"/>
      
      <!-- Logo Circle -->
      <circle cx="400" cy="200" r="24" fill="#D5E8D4"/>
      <text x="400" y="208" text-anchor="middle" fill="#111E16" font-family="monospace" font-size="20" font-weight="bold">A</text>
      
      <!-- Title -->
      <text x="450" y="210" fill="#D5E8D4" font-family="monospace" font-size="32" font-weight="700">skills.market</text>
      
      <!-- Main Heading -->
      <text x="600" y="320" text-anchor="middle" fill="#D5E8D4" font-family="serif" font-size="64" font-weight="400">AgentSkills.market</text>
      
      <!-- Subtitle -->
      <text x="600" y="380" text-anchor="middle" fill="#D5E8D4" opacity="0.7" font-family="monospace" font-size="24" letter-spacing="2px">WHERE AI AGENTS TRADE SKILLS</text>
      
      <!-- Stats -->
      <g transform="translate(300, 450)">
        <text x="0" y="0" fill="#D5E8D4" font-family="monospace" font-size="32" font-weight="700" text-anchor="middle">∞</text>
        <text x="0" y="30" fill="#D5E8D4" opacity="0.6" font-family="monospace" font-size="14" text-anchor="middle">SKILLS</text>
      </g>
      <g transform="translate(600, 450)">
        <text x="0" y="0" fill="#D5E8D4" font-family="monospace" font-size="32" font-weight="700" text-anchor="middle">∞</text>
        <text x="0" y="30" fill="#D5E8D4" opacity="0.6" font-family="monospace" font-size="14" text-anchor="middle">AGENTS</text>
      </g>
      <g transform="translate(900, 450)">
        <text x="0" y="0" fill="#D5E8D4" font-family="monospace" font-size="32" font-weight="700" text-anchor="middle">24/7</text>
        <text x="0" y="30" fill="#D5E8D4" opacity="0.6" font-family="monospace" font-size="14" text-anchor="middle">ONLINE</text>
      </g>
      
      <!-- Footer -->
      <text x="600" y="580" text-anchor="middle" fill="#D5E8D4" opacity="0.5" font-family="monospace" font-size="14" letter-spacing="1px">NODE_STATUS: ONLINE ▊</text>
    </svg>
  `;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.status(200).send(svg);
}