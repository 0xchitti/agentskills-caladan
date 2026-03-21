// Comprehensive validation endpoint to test all marketplace functionality
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method === 'GET') {
    try {
      const validationResults = {
        timestamp: new Date().toISOString(),
        endpoints: {},
        status: 'healthy'
      };

      // Test GET /api/skills
      try {
        const skillsResponse = await fetch(`${req.headers.host ? 'https://' + req.headers.host : ''}/api/skills`);
        validationResults.endpoints['/api/skills'] = {
          method: 'GET',
          status: skillsResponse.status,
          healthy: skillsResponse.ok
        };
      } catch (e) {
        validationResults.endpoints['/api/skills'] = {
          method: 'GET', 
          status: 'ERROR',
          error: e.message,
          healthy: false
        };
        validationResults.status = 'degraded';
      }

      // Test GET /api/agents
      try {
        const agentsResponse = await fetch(`${req.headers.host ? 'https://' + req.headers.host : ''}/api/agents`);
        validationResults.endpoints['/api/agents'] = {
          method: 'GET',
          status: agentsResponse.status,
          healthy: agentsResponse.ok
        };
      } catch (e) {
        validationResults.endpoints['/api/agents'] = {
          method: 'GET',
          status: 'ERROR', 
          error: e.message,
          healthy: false
        };
        validationResults.status = 'degraded';
      }

      // Validation rules
      validationResults.validation_rules = {
        'POST /api/agents': {
          required_fields: ['agentName', 'ownerTwitter', 'description'],
          optional_fields: ['capabilities', 'skills', 'apiEndpoint'],
          twitter_handle_format: 'Must start with @ and be at least 2 characters'
        },
        'POST /api/skills': {
          required_fields: ['agentId', 'agentName', 'skillName', 'description', 'category', 'testEndpoint', 'prodEndpoint'],
          pricing_rules: {
            testPrice: 'Between $0.01 and $0.05 (defaults to $0.02)',
            fullPrice: 'Between $1 and $50 (required)'
          },
          endpoint_format: 'Must be valid HTTP/HTTPS URLs'
        },
        'POST /api/test': {
          required_fields: ['skillId', 'buyerAgent', 'paymentTxHash'],
          payment_required: true,
          amount: '0.02 USDC',
          network: 'Base L2',
          tx_hash_format: 'Valid Ethereum transaction hash starting with 0x'
        },
        'POST /api/purchase': {
          required_fields: ['skillId', 'buyerAgent', 'paymentTxHash', 'buyerWallet'],
          payment_required: true,
          amount: 'Varies by skill ($1-50)',
          network: 'Base L2'
        },
        'POST /api/execute': {
          required_fields: ['skillId', 'inputData'],
          auth_required: 'Bearer token or accessToken in body',
          access_token_format: 'Must start with ak_ (obtained via purchase)'
        }
      };

      // Error scenarios and responses
      validationResults.common_errors = {
        400: {
          description: 'Bad Request - Missing or invalid fields',
          example: { error: 'Missing required fields', required: ['field1', 'field2'] }
        },
        401: {
          description: 'Unauthorized - Missing or invalid access token',
          example: { error: 'Access token required', instructions: 'Purchase a skill first to get an access token' }
        },
        402: {
          description: 'Payment Required - Valid payment transaction needed',
          example: { error: 'Payment required', amount: '0.02 USDC', network: 'Base L2' }
        },
        404: {
          description: 'Not Found - Skill or resource not found',
          example: { error: 'Skill not found', skillId: 'invalid_id' }
        },
        405: {
          description: 'Method Not Allowed - Wrong HTTP method',
          example: { error: 'Method not allowed', allowedMethods: ['POST'] }
        },
        500: {
          description: 'Internal Server Error - Something went wrong',
          example: { error: 'Internal error', message: 'Please try again' }
        }
      };

      res.status(200).json(validationResults);

    } catch (error) {
      res.status(500).json({
        error: 'Validation endpoint failed',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
  } else {
    res.status(405).json({ 
      error: 'Method not allowed',
      allowedMethods: ['GET']
    });
  }
}