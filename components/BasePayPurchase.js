// Upgraded purchase flow using Base Pay
// Replaces manual USDC transfer with one-tap payments

import { BasePayButton, SignInWithBaseButton } from '@base-org/account-ui';
import AgentSkillzBaseIntegration from '../lib/base-integration.js';

export function BasePayPurchase({ skill, onPurchaseComplete }) {
  const baseIntegration = new AgentSkillzBaseIntegration();
  
  const handlePaymentComplete = async (paymentInfo) => {
    try {
      console.log('💰 Base Pay completed:', paymentInfo);
      
      // Verify payment using Base Skills security guidelines  
      const isValid = await baseIntegration.verifyPayment(paymentInfo);
      
      if (!isValid) {
        throw new Error('Payment verification failed');
      }

      // Grant skill access
      const purchase = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId: skill.id,
          buyerAgent: paymentInfo.user.displayName,
          paymentTxHash: paymentInfo.transactionId,
          agentPurpose: paymentInfo.metadata.purpose || 'Enhance capabilities',
          basePayVerified: true,
          paymentMethod: 'BasePay'
        })
      });

      if (!purchase.ok) throw new Error('Purchase processing failed');
      
      const result = await purchase.json();
      onPurchaseComplete(result);
      
    } catch (error) {
      console.error('Purchase failed:', error);
      alert(`❌ Purchase failed: ${error.message}`);
    }
  };

  return (
    <div className="base-pay-purchase">
      {/* Step 1: Agent Authentication */}
      <div className="auth-section">
        <h3>🤖 Agent Identity</h3>
        <SignInWithBaseButton
          onSignInComplete={(user) => {
            console.log('✅ Agent authenticated:', user.displayName);
          }}
        />
      </div>

      {/* Step 2: One-Tap Payment */}
      <div className="payment-section">
        <h3>💰 Purchase Skill</h3>
        <div className="skill-info">
          <h4>{skill.skillName}</h4>
          <p>{skill.description}</p>
          <p><strong>Agent:</strong> {skill.agentName}</p>
          <p><strong>Price:</strong> ${skill.price} USDC</p>
        </div>
        
        <BasePayButton
          amount={skill.price.toString()}
          currency="USDC"
          description={`Purchase ${skill.skillName} from ${skill.agentName}`}
          metadata={{
            skillId: skill.id,
            marketplace: 'AgentSkillz',
            version: '1.0'
          }}
          onPaymentComplete={handlePaymentComplete}
        />
      </div>

      {/* Benefits of Base Pay upgrade */}
      <div className="benefits">
        <h4>✨ Upgraded Payment Experience</h4>
        <ul>
          <li>🚀 One-tap USDC payments (no manual transfers)</li>
          <li>🔐 Secure Base Account authentication</li>
          <li>⚡ Smart wallet features (batching, gas sponsorship)</li>
          <li>✅ Automatic payment verification</li>
          <li>🔄 Multi-chain support (Base, Arbitrum, Optimism)</li>
        </ul>
      </div>
    </div>
  );
}

// Enhanced agent registration with Base Account
export function BaseAccountRegistration({ onRegistrationComplete }) {
  const baseIntegration = new AgentSkillzBaseIntegration();
  
  const handleSignIn = async (user) => {
    try {
      // Get wallet capabilities
      const capabilities = await baseIntegration.getWalletCapabilities(user.address);
      
      // Register agent with enhanced Base Account info
      const registration = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentName: user.displayName || `Agent_${user.address.slice(0, 6)}`,
          ownerTwitter: user.twitterHandle || '@unknown',
          description: 'AI agent with Base Account integration',
          walletAddress: user.address,
          capabilities: capabilities,
          accountType: user.walletType, // 'smart' or 'eoa'
          baseAccountId: user.baseAccountId,
          multiChainSupport: true
        })
      });

      if (!registration.ok) throw new Error('Registration failed');
      
      const result = await registration.json();
      onRegistrationComplete(result);
      
    } catch (error) {
      console.error('Registration failed:', error);
      alert(`❌ Registration failed: ${error.message}`);
    }
  };

  return (
    <div className="base-account-registration">
      <h3>🔵 Register with Base Account</h3>
      <p>Sign in with your Base Account to register your AI agent on AgentSkillz marketplace.</p>
      
      <SignInWithBaseButton
        onSignInComplete={handleSignIn}
      />
      
      <div className="base-account-benefits">
        <h4>🚀 Base Account Benefits</h4>
        <ul>
          <li>🔐 Universal sign-on across Base ecosystem</li>
          <li>💰 One-tap USDC payments</li>
          <li>🌐 Multi-chain support (10+ networks)</li>
          <li>⚡ Smart wallet features (ERC-4337)</li>
          <li>🔄 Batch transactions</li>
          <li>💸 Gas sponsorship capabilities</li>
        </ul>
      </div>
    </div>
  );
}

export default { BasePayPurchase, BaseAccountRegistration };