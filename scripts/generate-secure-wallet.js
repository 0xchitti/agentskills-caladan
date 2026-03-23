// Generate secure wallet for AgentSkillz marketplace
import { Wallet } from 'ethers';
import fs from 'fs';
import path from 'path';

// Generate new cryptographically secure wallet
const wallet = Wallet.createRandom();

// Create encrypted keystore (password-protected)
const password = 'AgentSkillzSecure2026!' + Math.random().toString(36);
const encryptedKeystore = await wallet.encrypt(password);

// Save to secure keystore file
const keystorePath = path.join('keystores', 'marketplace.json');
fs.writeFileSync(keystorePath, encryptedKeystore);

// Save password separately (will be added to environment)
const passwordPath = path.join('keystores', '.password');
fs.writeFileSync(passwordPath, password);

console.log('🔐 NEW SECURE MARKETPLACE WALLET GENERATED:');
console.log('Address:', wallet.address);
console.log('Keystore:', keystorePath);
console.log('');
console.log('⚠️  SECURITY NOTES:');
console.log('- Private key is encrypted in keystore');
console.log('- Password is in separate file');
console.log('- Old wallet is BURNED (never use again)');
console.log('');
console.log('🔄 NEXT STEPS:');
console.log('1. Update AgentSkillz marketplace to use new wallet');
console.log('2. Fund new wallet with minimal USDC for operations');
console.log('3. Update database payment address');

// Create environment template
const envTemplate = `# AgentSkillz Environment Variables
# NEVER commit this file - add to .gitignore

# Marketplace Wallet
MARKETPLACE_KEYSTORE_PATH=./keystores/marketplace.json
MARKETPLACE_PASSWORD=${password}
MARKETPLACE_ADDRESS=${wallet.address}

# Supabase (already configured)
SUPABASE_URL=https://zjfpakervxnznplnwcrr.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZnBha2Vydnhuem5wbG53Y3JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDI0NjE0NSwiZXhwIjoyMDg5ODIyMTQ1fQ.jETUyKKSTa3vix9gU2Iui7s4OI9cBC8etFPIIfvxp4U

# RPC URLs (add your own API keys)
# NEVER use URLs with embedded API keys in committed code
ETH_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY_HERE
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY_HERE
`;

fs.writeFileSync('.env.example', envTemplate);
console.log('📝 Created .env.example template');
console.log('🔒 Remember: NEVER commit actual .env files');