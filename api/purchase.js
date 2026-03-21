import { supabase } from '../lib/supabase.js'
import { verifyPayment, calculateRevenueSplit } from '../lib/blockchain.js'
import { sendPurchaseConfirmation } from '../lib/notifications.js'

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      skillId,
      buyerAgent,
      paymentTxHash,
      buyerWallet
    } = req.body

    // Validation
    if (!skillId || !buyerAgent || !paymentTxHash || !buyerWallet) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['skillId', 'buyerAgent', 'paymentTxHash', 'buyerWallet']
      })
    }

    // Get skill details
    const { data: skill, error: skillError } = await supabase
      .from('skills')
      .select('*')
      .eq('id', skillId)
      .single()

    if (skillError || !skill) {
      return res.status(404).json({ error: 'Skill not found' })
    }

    // Verify payment
    const verification = await verifyPayment(
      paymentTxHash, 
      skill.full_price, 
      process.env.MARKETPLACE_WALLET
    )

    if (!verification.verified) {
      return res.status(400).json({ 
        error: 'Payment verification failed',
        details: verification.error
      })
    }

    // Check if already purchased
    const { data: existingPurchase } = await supabase
      .from('transactions')
      .select('id')
      .eq('skill_id', skillId)
      .eq('buyer_agent', buyerAgent)
      .eq('transaction_type', 'purchase')
      .eq('status', 'completed')
      .single()

    if (existingPurchase) {
      return res.status(409).json({ 
        error: 'Skill already purchased by this agent',
        accessToken: `ak_${buyerAgent}_${skillId}_${Date.now()}`
      })
    }

    // Generate access token
    const accessToken = `ak_${buyerAgent}_${skillId}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`

    // Record the purchase transaction
    const { data: transactionData, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        skill_id: skillId,
        buyer_agent: buyerAgent,
        buyer_wallet: buyerWallet,
        amount: skill.full_price,
        transaction_type: 'purchase',
        status: 'completed',
        payment_tx_hash: paymentTxHash,
        access_token: accessToken,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Transaction record error:', transactionError)
      return res.status(500).json({ error: 'Failed to record purchase' })
    }

    // Update skill statistics
    const { error: updateError } = await supabase
      .from('skills')
      .update({
        rating_count: skill.rating_count + 1,
        total_tests: skill.total_tests + 1
      })
      .eq('id', skillId)

    if (updateError) {
      console.error('Skill update error:', updateError)
    }

    // Calculate revenue split
    const revenueSplit = calculateRevenueSplit(skill.full_price, 'purchase')

    // Send purchase confirmation
    try {
      await sendPurchaseConfirmation({
        buyerAgent,
        skillName: skill.skill_name,
        amount: skill.full_price,
        txHash: paymentTxHash,
        ownerTwitter: skill.owner_twitter
      })
    } catch (notificationError) {
      console.error('Purchase notification error:', notificationError)
    }

    res.status(200).json({
      success: true,
      purchaseId: transactionData.id,
      accessToken: accessToken,
      message: 'Purchase completed successfully',
      details: {
        skillId,
        skillName: skill.skill_name,
        buyerAgent,
        amount: skill.full_price,
        currency: 'USDC',
        network: 'Base',
        txHash: paymentTxHash,
        revenueSplit,
        timestamp: new Date().toISOString()
      },
      usage: {
        endpoint: skill.prod_endpoint,
        accessToken: accessToken,
        rateLimit: 'unlimited',
        documentation: 'https://agentskills-caladan.vercel.app/platform.md'
      }
    })

  } catch (error) {
    console.error('Purchase API error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    })
  }
}