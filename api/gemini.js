// Sliding window in-memory rate limiter per IP (max 30 requests per minute)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;

function checkServerRateLimit(ip) {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return true;
}

export default async function handler(req, res) {
  // Common CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
    'Access-Control-Allow-Headers':
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
    'Content-Type': 'application/json',
  };

  // 1. Determine runtime: Node.js (res provided) vs Web Standard (Request -> Response)
  const isNode = Boolean(res && typeof res.setHeader === 'function');

  function sendOutput(statusCode, data) {
    if (isNode) {
      Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
      if (typeof res.status === 'function' && typeof res.json === 'function') {
        return res.status(statusCode).json(data);
      }
      res.statusCode = statusCode;
      res.end(JSON.stringify(data));
      return;
    }
    return new Response(JSON.stringify(data), {
      status: statusCode,
      headers: corsHeaders,
    });
  }

  try {
    const method = req.method ? req.method.toUpperCase() : 'GET';

    if (method === 'OPTIONS') {
      return sendOutput(200, { ok: true });
    }

    // Health check
    if (method === 'GET') {
      const apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();
      return sendOutput(200, {
        status: 'active',
        service: 'AMK Animal AI Gemini Serverless Proxy',
        isConfigured: Boolean(apiKey && apiKey.length > 20),
      });
    }

    if (method !== 'POST') {
      return sendOutput(405, { error: 'Method Not Allowed. Use POST.' });
    }

    // Rate limiter
    let clientIp = '127.0.0.1';
    if (req.headers) {
      const fwd = req.headers['x-forwarded-for'] || (typeof req.headers.get === 'function' ? req.headers.get('x-forwarded-for') : null);
      if (typeof fwd === 'string') clientIp = fwd.split(',')[0].trim();
    }
    if (!checkServerRateLimit(clientIp)) {
      return sendOutput(429, {
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please wait a minute before making another AI analysis request.',
      });
    }

    // Check Gemini API key
    const apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();
    if (!apiKey || apiKey.length < 20) {
      return sendOutput(200, {
        success: false,
        isConfigured: false,
        error: 'GEMINI_API_KEY_NOT_CONFIGURED',
        message:
          'Google Gemini API key is not configured in Vercel Environment Variables. Add GEMINI_API_KEY in Vercel Project Settings > Environment Variables to activate live cloud AI.',
      });
    }

    // Parse body
    let body = req.body;
    if (!body && typeof req.json === 'function') {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    } else if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    } else if (!body && typeof req.on === 'function') {
      body = await new Promise((resolve) => {
        let raw = '';
        req.on('data', (c) => { raw += c; });
        req.on('end', () => {
          try { resolve(JSON.parse(raw)); } catch { resolve({}); }
        });
        req.on('error', () => resolve({}));
      });
    }

    const { action, contents, model = 'gemini-1.5-flash' } = body || {};

    // Connection test
    if (action === 'test_connection') {
      try {
        const pingUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const pingRes = await fetch(pingUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Respond with OK' }] }],
          }),
        });
        const pingData = await pingRes.json();
        if (pingRes.ok && pingData?.candidates?.[0]?.content?.parts?.[0]?.text) {
          return sendOutput(200, {
            success: true,
            isConfigured: true,
            message: 'Google Gemini API key verified and operational on Vercel Serverless!',
          });
        }
        return sendOutput(200, {
          success: false,
          isConfigured: true,
          message: pingData?.error?.message || `HTTP ${pingRes.status} from Google Gemini API`,
        });
      } catch (pingErr) {
        return sendOutput(500, {
          success: false,
          error: 'CONNECTION_TEST_FAILED',
          message: pingErr?.message || 'Failed to ping Gemini API',
        });
      }
    }

    if (!contents || !Array.isArray(contents)) {
      return sendOutput(400, { error: 'Missing or invalid "contents" array in request body' });
    }

    const targetModel = model || 'gemini-1.5-flash';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      const errMsg = data?.error?.message || `HTTP ${geminiRes.status}: ${geminiRes.statusText}`;
      const isQuota = errMsg.toLowerCase().includes('quota') || geminiRes.status === 429;
      return sendOutput(geminiRes.status === 429 ? 429 : 200, {
        success: false,
        error: isQuota ? 'QUOTA_EXHAUSTED' : 'GEMINI_API_ERROR',
        message: isQuota
          ? 'Google Gemini API free tier quota limit reached. Please wait or check your Google AI Studio quota.'
          : errMsg,
      });
    }

    return sendOutput(200, {
      success: true,
      source: 'live_gemini_serverless',
      candidates: data.candidates || [],
      promptFeedback: data.promptFeedback,
    });
  } catch (err) {
    return sendOutput(500, {
      success: false,
      error: 'SERVERLESS_PROXY_EXCEPTION',
      message: err?.message || 'Internal error in Gemini Serverless function',
    });
  }
}
