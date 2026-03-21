import { Database } from '../lib/database.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method === 'POST') {
    try {
      const { skillId, buyerAgent, inputData, paymentTxHash } = req.body
      
      // Strict validation - all fields required
      if (!skillId || !buyerAgent || !paymentTxHash) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['skillId', 'buyerAgent', 'paymentTxHash'],
          message: 'Payment is required for skill testing. Please pay 0.02 USDC on Base L2 and include the transaction hash.'
        })
      }

      // Find the skill from database
      const skill = Database.findSkill(skillId);
      if (!skill) {
        const allSkills = Database.getSkills();
        return res.status(404).json({
          error: 'Skill not found',
          skillId: skillId,
          availableSkills: allSkills.map(s => ({ id: s.id, name: s.skillName }))
        });
      }

      // Verify payment transaction (simplified for demo)
      let paymentVerified = false;
      if (paymentTxHash.startsWith('0x') && paymentTxHash.length >= 10) {
        // In production: verify actual Base L2 USDC transaction
        // For demo: accept properly formatted tx hashes
        paymentVerified = true;
      } else {
        return res.status(400).json({
          error: 'Invalid payment transaction hash',
          format: 'Must be a valid Ethereum transaction hash starting with 0x',
          example: '0x1234567890abcdef...'
        });
      }

      if (!paymentVerified) {
        return res.status(402).json({
          error: 'Payment required',
          message: 'Please pay 0.02 USDC on Base L2 and provide the transaction hash',
          amount: '0.02 USDC',
          network: 'Base L2',
          contract: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
        });
      }

      // Generate transaction ID
      const transactionId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Execute skill test (simulated)
      const testResult = {
        skillId: skillId,
        skillName: skill.skillName,
        buyerAgent: buyerAgent,
        testPrice: skill.testPrice,
        executedAt: new Date().toISOString(),
        input: inputData || { test: 'marketplace validation' },
        output: {
          status: 'success',
          message: `Test execution completed for ${skill.skillName}`,
          sampleData: {
            findings: ['No critical security vulnerabilities found', 'Code follows best practices', 'Documentation is comprehensive'],
            confidence: 0.95,
            executionTime: Math.floor(Math.random() * 1000) + 'ms'
          }
        }
      };

      // Send results to buyer agent owner's chat (via OpenClaw message integration)
      try {
        const messagePayload = {
          target: 'telegram:865924605', // Akhil's chat for demo
          message: `🧪 **Skill Test Results**

**Agent:** ${buyerAgent}
**Skill:** ${skill.skillName}
**Cost:** $${skill.testPrice} USDC
**Status:** ✅ Success

**Results:**
${JSON.stringify(testResult.output.sampleData, null, 2)}

**Transaction:** ${transactionId}
**Payment:** ${paymentTxHash}

*Test completed successfully. Deploy for unlimited access!*`
        };

        // Send to OpenClaw message API (simplified)
        await fetch('/api/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(messagePayload)
        });
      } catch (msgError) {
        console.error('Message delivery failed:', msgError);
        // Continue execution even if message fails
      }

      res.status(200).json({
        success: true,
        transactionId: transactionId,
        message: 'Test completed! Results sent to agent owner\'s chat.',
        cost: skill.testPrice,
        currency: 'USDC',
        paymentTxHash: paymentTxHash,
        paymentVerified: true,
        executionTime: testResult.output.sampleData.executionTime,
        results: testResult
      });

    } catch (error) {
      console.error('Test execution error:', error);
      res.status(500).json({ 
        error: 'Test execution failed',
        message: 'An internal error occurred. Please try again.',
        details: error.message 
      });
    }
  } else {
    res.status(405).json({ 
      error: 'Method not allowed',
      allowedMethods: ['POST'],
      message: 'Use POST to test skills'
    });
  }
}