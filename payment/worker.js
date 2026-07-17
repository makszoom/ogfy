// Cloudflare Worker — USDT TRC-20 Payment Verification
// Deploy via Cloudflare Dashboard → Workers & Pages → Create Service
// Environment variable: TARGET_ADDRESS = your TRC-20 address

export default {
  async fetch(request, env) {
    // ═══════ CORS ═══════
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ verified: false, message: 'Method not allowed' }, 405, corsHeaders);
    }

    // ═══════ RATE LIMIT (in-memory, per colo) ═══════
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const now = Date.now();
    const key = `rate:${clientIP}`;
    
    // Simple rate limit: max 5 requests per minute per IP
    const rateData = await env.PAYMENT_KV?.get(key);
    if (rateData) {
      const { count, windowStart } = JSON.parse(rateData);
      if (now - windowStart < 60_000 && count >= 5) {
        return jsonResponse({ verified: false, message: 'Rate limit exceeded. Try again in a minute.' }, 429, corsHeaders);
      }
    }

    // ═══════ PARSE BODY ═══════
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ verified: false, message: 'Invalid JSON' }, 400, corsHeaders);
    }

    const { txId } = body;

    // Validate TXID: 64 hex characters
    if (!txId || !/^[a-fA-F0-9]{64}$/.test(txId)) {
      return jsonResponse({ verified: false, message: 'Invalid TXID format. Expected 64 hex characters.' }, 400, corsHeaders);
    }

    // ═══════ CHECK TRONSCAN ═══════
    const tronScanUrl = `https://apilist.tronscan.org/api/transaction-info?hash=${txId}`;
    
    let txData;
    try {
      const tronResponse = await fetch(tronScanUrl, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (!tronResponse.ok) {
        return jsonResponse({ verified: false, message: 'TronScan API error. Try again later.' }, 502, corsHeaders);
      }
      
      txData = await tronResponse.json();
    } catch (e) {
      return jsonResponse({ verified: false, message: 'Network error. Try again later.' }, 502, corsHeaders);
    }

    // Check if transaction exists
    if (!txData || txData.code !== 0 || !txData.data) {
      return jsonResponse({ verified: false, message: 'Transaction not found on blockchain.' }, 404, corsHeaders);
    }

    const tx = txData.data;

    // ═══════ VALIDATE RECIPIENT ═══════
    const TARGET_ADDRESS = (env.TARGET_ADDRESS || '').trim();
    if (!TARGET_ADDRESS) {
      return jsonResponse({ verified: false, message: 'Server config error: no target address.' }, 500, corsHeaders);
    }

    // Extract recipient from token transfer
    const tokenInfo = tx.tokenTransferInfo || {};
    const recipient = (tokenInfo.to_address || tx.toAddress || '').toLowerCase();
    const expectedAddress = TARGET_ADDRESS.toLowerCase();

    if (recipient !== expectedAddress) {
      return jsonResponse({ 
        verified: false, 
        message: 'This transaction was sent to a different address.' 
      }, 400, corsHeaders);
    }

    // ═══════ VALIDATE AMOUNT ═══════
    const decimals = tokenInfo.decimals || 6;
    const amountRaw = parseFloat(tokenInfo.amount_str || tokenInfo.amount || 0);
    const amountUSDT = amountRaw / Math.pow(10, decimals);
    const MIN_AMOUNT = 4.5; // Allow slight underpayment (network fees, rounding)

    if (amountUSDT < MIN_AMOUNT) {
      return jsonResponse({ 
        verified: false, 
        amount: amountUSDT,
        message: `Amount too small: ${amountUSDT.toFixed(2)} USDT. Minimum: 5 USDT.` 
      }, 400, corsHeaders);
    }

    // ═══════ VALIDATE TIME (< 24 hours) ═══════
    const txTimestamp = tx.timestamp || tx.tokenTransferInfo?.timestamp || 0;
    const hoursDiff = (now - txTimestamp) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      return jsonResponse({ 
        verified: false, 
        message: 'Transaction too old. Must be within 24 hours.' 
      }, 400, corsHeaders);
    }

    // ═══════ CHECK DUPLICATE (optional, requires KV) ═══════
    const usedKey = `tx:${txId.toLowerCase()}`;
    const alreadyUsed = await env.PAYMENT_KV?.get(usedKey);
    if (alreadyUsed) {
      return jsonResponse({ 
        verified: false, 
        message: 'This transaction has already been used.' 
      }, 400, corsHeaders);
    }

    // Mark as used (store for 30 days)
    await env.PAYMENT_KV?.put(usedKey, '1', { expirationTtl: 30 * 24 * 60 * 60 });

    // Update rate limit
    const rateWindow = rateData ? JSON.parse(rateData).windowStart : now;
    const rateCount = rateData ? JSON.parse(rateData).count + 1 : 1;
    await env.PAYMENT_KV?.put(key, JSON.stringify({ count: rateCount, windowStart: rateWindow }), { expirationTtl: 60 });

    // ═══════ SUCCESS ═══════
    return jsonResponse({
      verified: true,
      amount: amountUSDT,
      txId: txId,
      message: 'Payment verified! Unlimited access activated.'
    }, 200, corsHeaders);
  }
};

function jsonResponse(data, status, extraHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...extraHeaders }
  });
}
