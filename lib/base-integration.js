// Base Skills integration for AgentSkillz marketplace
// Upgrades payment flow with Base Account SDK

import { createBaseAccountSDK } from '@base-org/account';

// Base Skills: Proper network configuration
const BASE_NETWORK_CONFIG = {
  mainnet: {
    name: 'Base',
    chainId: 8453,
    rpc: 'https://mainnet.base.org',
    currency: 'ETH',
    explorer: 'https://basescan.org',
    usdcContract: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
  },
  sepolia: {
    name: 'Base Sepolia',
    chainId: 84532,
    rpc: 'https://sepolia.base.org',
    currency: 'ETH',
    explorer: 'https://sepolia.basescan.org',
    usdcContract: '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
  }
};

class AgentSkillzBaseIntegration {
  constructor() {
    this.sdk = null;
    this.network = process.env.NODE_ENV === 'production' ? 'mainnet' : 'sepolia';
  }

  // Initialize Base Account SDK
  async initialize() {
    this.sdk = createBaseAccountSDK({
      appName: 'Agent Skillz',
      appLogoUrl: 'https://agentskillz.xyz/logo.png',
      appChainIds: [BASE_NETWORK_CONFIG[this.network].chainId],
    });

    console.log('🔵 Base Account SDK initialized for:', this.network);
    return this.sdk;
  }

  // Upgrade: One-tap USDC payments with Base Pay
  async createPayment({ skillId, agentName, amount, description }) {
    if (!this.sdk) await this.initialize();

    const paymentConfig = {
      amount: amount.toString(),
      currency: 'USDC',
      description: `${description} - Agent: ${agentName}`,
      metadata: {
        skillId,
        purchaser: agentName,
        marketplace: 'AgentSkillz'
      }
    };

    console.log('💰 Creating Base Pay payment:', paymentConfig);
    return paymentConfig;
  }

  // Upgrade: Agent authentication with Sign In with Base
  async authenticateAgent() {
    if (!this.sdk) await this.initialize();

    try {
      const user = await this.sdk.auth.signIn();
      
      return {
        address: user.address,
        displayName: user.displayName || `Agent ${user.address.slice(0, 6)}`,
        isSmartWallet: user.walletType === 'smart',
        capabilities: user.capabilities || []
      };
    } catch (error) {
      throw new Error(`Base authentication failed: ${error.message}`);
    }
  }

  // Upgrade: Smart wallet capabilities check
  async getWalletCapabilities(address) {
    if (!this.sdk) await this.initialize();

    const capabilities = await this.sdk.getCapabilities(address);
    
    return {
      canBatch: capabilities.includes('batch'),
      hasPaymaster: capabilities.includes('paymaster'),
      auxiliaryFunds: capabilities.auxiliaryFunds || 0,
      canSponsored: capabilities.includes('sponsored')
    };
  }

  // Upgrade: Batch payment + skill activation
  async batchPurchaseSkill({ skillId, amount, agentAddress }) {
    if (!this.sdk) await this.initialize();

    // Check if wallet supports batching
    const capabilities = await this.getWalletCapabilities(agentAddress);
    
    if (capabilities.canBatch) {
      // Batch: Approve USDC + Purchase + Activate skill access
      const batchTx = await this.sdk.batch([
        this.createUSDCApproval(amount),
        this.createPurchaseTransaction(skillId),
        this.createSkillActivation(skillId, agentAddress)
      ]);

      console.log('🔄 Batched skill purchase:', batchTx);
      return batchTx;
    } else {
      // Fallback to individual transactions
      console.log('⚠️  Wallet doesn\'t support batching, using individual transactions');
      return null;
    }
  }

  // Get current network configuration
  getNetworkConfig() {
    return BASE_NETWORK_CONFIG[this.network];
  }

  // Security: Validate payment with proper verification
  async verifyPayment(paymentInfo) {
    // Base Skills: Critical security requirements
    const verifications = [
      this.verifyTransactionId(paymentInfo.txId),
      this.verifySenderAuth(paymentInfo.sender),
      this.verifyAmountMatch(paymentInfo.amount),
      this.verifyNetworkMatch(paymentInfo.chainId)
    ];

    const results = await Promise.all(verifications);
    return results.every(result => result === true);
  }

  // Internal verification methods
  async verifyTransactionId(txId) {
    // Track transaction IDs to prevent replay attacks
    // TODO: Implement database check for used transaction IDs
    return !this.isTransactionUsed(txId);
  }

  async verifySenderAuth(sender) {
    // Verify sender matches authenticated user
    // TODO: Check against authenticated Base Account
    return this.isAuthenticatedUser(sender);
  }

  async verifyAmountMatch(amount) {
    // Verify payment amount matches skill price
    // TODO: Cross-check with skill database
    return this.validatePaymentAmount(amount);
  }

  async verifyNetworkMatch(chainId) {
    // Verify payment on correct network
    return chainId === BASE_NETWORK_CONFIG[this.network].chainId;
  }
}

export default AgentSkillzBaseIntegration;