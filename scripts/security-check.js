// Security validation script for AgentSkillz
import fs from 'fs';
import { execSync } from 'child_process';

console.log('🔒 AGENTSKILLZ SECURITY AUDIT');
console.log('=============================\n');

// Check 1: No private keys in code
console.log('🔍 Checking for exposed private keys...');
try {
  const privateKeyCheck = execSync('grep -r "0x[a-fA-F0-9]\\{64\\}" . --exclude-dir=node_modules --exclude-dir=.git', { encoding: 'utf8' });
  if (privateKeyCheck) {
    console.log('❌ FOUND PRIVATE KEYS IN CODE:');
    console.log(privateKeyCheck);
  }
} catch (e) {
  console.log('✅ No private keys found in codebase');
}

// Check 2: No API keys in code  
console.log('\n🔍 Checking for exposed API keys...');
try {
  const apiKeyCheck = execSync('grep -r "g\\.alchemy\\.com/v2/[A-Za-z0-9]" . --exclude-dir=node_modules --exclude-dir=.git', { encoding: 'utf8' });
  if (apiKeyCheck) {
    console.log('❌ FOUND API KEYS IN CODE:');
    console.log(apiKeyCheck);
  }
} catch (e) {
  console.log('✅ No embedded API keys found');
}

// Check 3: .gitignore exists and covers secrets
console.log('\n🔍 Checking .gitignore...');
if (fs.existsSync('.gitignore')) {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  const requiredPatterns = ['.env', '*.key', '*.pem', 'secrets/', 'keystores/'];
  let missing = [];
  
  requiredPatterns.forEach(pattern => {
    if (!gitignore.includes(pattern)) {
      missing.push(pattern);
    }
  });
  
  if (missing.length > 0) {
    console.log('⚠️  Missing .gitignore patterns:', missing);
  } else {
    console.log('✅ .gitignore properly configured');
  }
} else {
  console.log('❌ No .gitignore file found');
}

// Check 4: Secure wallet setup
console.log('\n🔍 Checking wallet security...');
if (fs.existsSync('keystores/marketplace.json')) {
  console.log('✅ Encrypted keystore found');
  
  // Verify it's actually encrypted
  const keystore = fs.readFileSync('keystores/marketplace.json', 'utf8');
  if (keystore.includes('"crypto"') && keystore.includes('"cipher"')) {
    console.log('✅ Keystore is properly encrypted');
  } else {
    console.log('❌ Keystore may not be encrypted properly');
  }
} else {
  console.log('⚠️  No encrypted keystore found');
}

// Check 5: Environment variables
console.log('\n🔍 Checking environment setup...');
if (fs.existsSync('.env')) {
  console.log('⚠️  .env file exists (ensure it\'s in .gitignore)');
} else {
  console.log('✅ No .env file in repo root');
}

if (fs.existsSync('.env.example')) {
  console.log('✅ .env.example template found');
}

console.log('\n🔒 SECURITY RECOMMENDATIONS:');
console.log('1. Never commit private keys or API keys');
console.log('2. Use encrypted keystores for production');
console.log('3. Implement spending limits and human approval');
console.log('4. Use separate wallets for different purposes');
console.log('5. Regular security audits');

console.log('\n✅ Security audit complete');