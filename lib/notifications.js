import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Send test result notification to buyer's chat interface
export const sendTestResults = async (testData, results) => {
  const { buyerAgent, chatInterface, skillName, output } = testData
  
  try {
    // Parse chat interface (e.g., "telegram:123456789")
    const [platform, chatId] = chatInterface.split(':')
    
    const message = formatTestResults(skillName, output, results)
    
    switch (platform.toLowerCase()) {
      case 'telegram':
        return await sendTelegramMessage(chatId, message)
      case 'discord':
        return await sendDiscordMessage(chatId, message)
      case 'slack':
        return await sendSlackMessage(chatId, message)
      default:
        // Fallback to email notification
        return await sendEmailNotification(testData, results)
    }
  } catch (error) {
    console.error('Notification error:', error)
    // Fallback to email
    return await sendEmailNotification(testData, results)
  }
}

// Format test results message
const formatTestResults = (skillName, output, results) => {
  return `🤖 **Skill Test Complete**

**Skill:** ${skillName}
**Status:** ${results.success ? '✅ Success' : '❌ Failed'}
**Output:** 
\`\`\`
${JSON.stringify(output, null, 2)}
\`\`\`

**Recommendation:** ${results.recommendation || 'Quality verified. Deploy full access?'}
**Cost:** $0.02 USDC (test) | Full access available for purchase

Deploy this skill to your agent for unlimited usage.`
}

// Telegram notification (placeholder - would need Bot API)
const sendTelegramMessage = async (chatId, message) => {
  // Would integrate with Telegram Bot API
  console.log(`Telegram notification to ${chatId}:`, message)
  return { success: true, platform: 'telegram' }
}

// Discord notification (placeholder - would need webhook)
const sendDiscordMessage = async (channelId, message) => {
  // Would integrate with Discord webhooks
  console.log(`Discord notification to ${channelId}:`, message)
  return { success: true, platform: 'discord' }
}

// Slack notification (placeholder - would need webhook)
const sendSlackMessage = async (channelId, message) => {
  // Would integrate with Slack API
  console.log(`Slack notification to ${channelId}:`, message)
  return { success: true, platform: 'slack' }
}

// Email notification fallback
const sendEmailNotification = async (testData, results) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'AgentSkills <noreply@agentskills.market>',
      to: ['0xchitti@gmail.com'], // Would get from agent registration
      subject: `Test Results: ${testData.skillName}`,
      html: `
        <h2>Skill Test Complete</h2>
        <p><strong>Skill:</strong> ${testData.skillName}</p>
        <p><strong>Status:</strong> ${results.success ? '✅ Success' : '❌ Failed'}</p>
        <p><strong>Buyer Agent:</strong> ${testData.buyerAgent}</p>
        
        <h3>Output:</h3>
        <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px;">
${JSON.stringify(testData.output, null, 2)}
        </pre>
        
        <p><strong>Recommendation:</strong> ${results.recommendation}</p>
        <p><strong>Cost:</strong> $0.02 USDC (test) | Full access available</p>
        
        <p>Deploy this skill to your agent for unlimited usage at <a href="https://agentskills-caladan.vercel.app">agentskills.market</a></p>
      `
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, platform: 'email', messageId: data.id }
  } catch (error) {
    console.error('Email notification error:', error)
    return { success: false, error: error.message }
  }
}

// Purchase notification
export const sendPurchaseConfirmation = async (purchaseData) => {
  try {
    const { buyerAgent, skillName, amount, txHash, ownerTwitter } = purchaseData
    
    const { data, error } = await resend.emails.send({
      from: 'AgentSkills <noreply@agentskills.market>',
      to: ['0xchitti@gmail.com'],
      subject: `Purchase Confirmed: ${skillName}`,
      html: `
        <h2>Skill Purchase Confirmed</h2>
        <p><strong>Buyer:</strong> ${buyerAgent}</p>
        <p><strong>Skill:</strong> ${skillName}</p>
        <p><strong>Amount:</strong> $${amount} USDC</p>
        <p><strong>Transaction:</strong> <a href="https://basescan.org/tx/${txHash}">View on BaseScan</a></p>
        <p><strong>Skill Owner:</strong> ${ownerTwitter}</p>
        
        <p>The buyer now has full access to this skill. Revenue has been distributed according to the 85/15 split.</p>
      `
    })

    return { success: !error, messageId: data?.id, error: error?.message }
  } catch (error) {
    console.error('Purchase notification error:', error)
    return { success: false, error: error.message }
  }
}

// Agent registration notification
export const sendAgentWelcome = async (agentData) => {
  try {
    const { agentName, ownerTwitter, description } = agentData
    
    const { data, error } = await resend.emails.send({
      from: 'AgentSkills <noreply@agentskills.market>',
      to: ['0xchitti@gmail.com'],
      subject: `Welcome to AgentSkills: ${agentName}`,
      html: `
        <h2>Welcome to the AgentSkills Marketplace!</h2>
        <p><strong>Agent:</strong> ${agentName}</p>
        <p><strong>Owner:</strong> ${ownerTwitter}</p>
        <p><strong>Description:</strong> ${description}</p>
        
        <h3>Next Steps:</h3>
        <ol>
          <li>List your skills via the API</li>
          <li>Set up test and production endpoints</li>
          <li>Start earning USDC from other agents</li>
        </ol>
        
        <p>Documentation: <a href="https://agentskills-caladan.vercel.app/platform.md">platform.md</a></p>
        <p>Marketplace: <a href="https://agentskills-caladan.vercel.app">agentskills.market</a></p>
      `
    })

    return { success: !error, messageId: data?.id, error: error?.message }
  } catch (error) {
    console.error('Welcome email error:', error)
    return { success: false, error: error.message }
  }
}