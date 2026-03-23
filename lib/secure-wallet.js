// Secure wallet management for AgentSkillz
import { Wallet, JsonRpcProvider } from 'ethers';
import fs from 'fs';
import path from 'path';

class SecureMarketplaceWallet {
  constructor() {
    this.wallet = null;
    this.provider = null;
    this.maxSpendingUSD = 100; // Safety limit
  }

  // Load encrypted wallet from keystore
  async loadWallet() {
    if (this.wallet) return this.wallet;

    try {
      const keystorePath = process.env.MARKETPLACE_KEYSTORE_PATH || './keystores/marketplace.json';
      const password = process.env.MARKETPLACE_PASSWORD;
      
      if (!password) {
        throw new Error('MARKETPLACE_PASSWORD environment variable required');
      }

      const keystoreData = fs.readFileSync(keystorePath, 'utf8');
      this.wallet = await Wallet.fromEncryptedJson(keystoreData, password);
      
      console.log('🔓 Marketplace wallet loaded:', this.wallet.address);
      return this.wallet;
    } catch (error) {
      throw new Error(`Failed to load wallet: ${error.message}`);
    }
  }

  // Connect to Base L2 for USDC operations
  async connectProvider() {
    const baseRPC = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
    this.provider = new JsonRpcProvider(baseRPC);
    
    if (this.wallet) {
      this.wallet = this.wallet.connect(this.provider);
    }
  }

  // Safe transaction with human approval for large amounts
  async sendPayment({ to, amountUSDC, description, requireApproval = true }) {
    if (!this.wallet) await this.loadWallet();
    if (!this.provider) await this.connectProvider();

    // Validate address
    if (!to.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new Error(`Invalid address format: ${to}`);
    }

    // Convert USDC amount (6 decimals)
    const amount = BigInt(Math.floor(amountUSDC * 1e6));
    
    // Safety check
    if (amountUSDC > this.maxSpendingUSD && requireApproval) {
      throw new Error(`Amount $${amountUSDC} exceeds spending limit $${this.maxSpendingUSD}. Requires human approval.`);
    }

    console.log('💰 PAYMENT PREPARATION:');
    console.log(`To: ${to}`);
    console.log(`Amount: ${amountUSDC} USDC`);
    console.log(`Description: ${description}`);
    console.log(`Wallet: ${this.wallet.address}`);

    // USDC contract on Base
    const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
    
    // Create transfer transaction (ERC-20)
    const transferData = `0xa9059cbb${to.slice(2).padStart(64, '0')}${amount.toString(16).padStart(64, '0')}`;
    
    const tx = {
      to: USDC_BASE,
      data: transferData,
      gasLimit: 100000n // Conservative gas limit
    };

    return {
      transaction: tx,
      wallet: this.wallet,
      amountUSDC,
      destination: to,
      description
    };
  }

  // Log transaction for audit trail (never log keys)
  logTransaction({ hash, to, amount, description, block }) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      hash,
      to,
      amount: `${amount} USDC`,
      description,
      block,
      from: this.wallet?.address
    };
    
    console.log('📝 Transaction logged:', logEntry);
    
    // Could append to audit file
    const auditPath = './logs/transactions.jsonl';
    if (fs.existsSync(path.dirname(auditPath))) {
      fs.appendFileSync(auditPath, JSON.stringify(logEntry) + '\n');
    }
  }

  // Get current address
  getAddress() {
    return this.wallet?.address || process.env.MARKETPLACE_ADDRESS;
  }
}

export default SecureMarketplaceWallet;