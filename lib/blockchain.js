import { createPublicClient, http, parseUnits, formatUnits } from 'viem'
import { base } from 'viem/chains'

// Base network configuration
export const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL || 'https://mainnet.base.org')
})

// USDC contract address on Base
export const USDC_ADDRESS = process.env.USDC_CONTRACT_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'

// USDC contract ABI (minimal for transfers)
export const USDC_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function'
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function'
  }
]

// Marketplace wallet addresses
export const MARKETPLACE_WALLET = '0xFC2676f1a5Ed396992782d3f0ddb8c340646022c' // Secure marketplace wallet
export const REVENUE_SPLIT = {
  TEST: 0.80,  // 80% to skill owner for tests
  FULL: 0.85   // 85% to skill owner for full purchases
}

// Price utilities
export const formatPrice = (price) => {
  return parseUnits(price.toString(), 6) // USDC has 6 decimals
}

export const parsePrice = (amount) => {
  return parseFloat(formatUnits(amount, 6))
}

// Payment verification
export const verifyPayment = async (txHash, expectedAmount, expectedRecipient) => {
  try {
    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash
    })
    
    if (receipt.status !== 'success') {
      throw new Error('Transaction failed')
    }
    
    // Verify USDC transfer in transaction logs
    const usdcTransfer = receipt.logs.find(log => 
      log.address.toLowerCase() === USDC_ADDRESS.toLowerCase()
    )
    
    if (!usdcTransfer) {
      throw new Error('No USDC transfer found')
    }
    
    // Additional verification logic would go here
    // For now, return basic verification
    return {
      verified: true,
      amount: expectedAmount,
      recipient: expectedRecipient,
      txHash: txHash,
      blockNumber: receipt.blockNumber
    }
  } catch (error) {
    console.error('Payment verification error:', error)
    return {
      verified: false,
      error: error.message
    }
  }
}

// Generate payment request
export const createPaymentRequest = (skillId, priceUSDC, type = 'test') => {
  const amount = formatPrice(priceUSDC)
  const recipient = MARKETPLACE_WALLET
  
  return {
    to: USDC_ADDRESS,
    data: {
      amount: amount.toString(),
      recipient,
      skillId,
      type
    }
  }
}

// Calculate revenue split
export const calculateRevenueSplit = (amount, type) => {
  const splitPercentage = type === 'test' ? REVENUE_SPLIT.TEST : REVENUE_SPLIT.FULL
  const ownerAmount = amount * splitPercentage
  const marketplaceAmount = amount * (1 - splitPercentage)
  
  return {
    ownerAmount: Math.round(ownerAmount * 100) / 100,
    marketplaceAmount: Math.round(marketplaceAmount * 100) / 100,
    splitPercentage
  }
}