import type { IncomingMessage, ServerResponse } from 'http';

// Helper to reliably send JSON in both standard Node http and Vercel/Express runtimes
function sendJson(res: any, statusCode: number, data: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

// Helper to safely parse request body across stream and pre-parsed bodies
async function parseBody(req: any): Promise<any> {
  if (req.body) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    return req.body;
  }

  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk: any) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

// Sliding window in-memory rate limiter per IP (max 30 requests per minute)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;

function checkServerRateLimit(ip: string): boolean {
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

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'OPTIONS') {
      return sendJson(res, 200, { ok: true });
    }

    // Health check
    if (req.method === 'GET') {
      const apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();
      return sendJson(res, 200, {
        status: 'active',
        service: 'AMK Animal AI Gemini Serverless Proxy',
        isConfigured: Boolean(apiKey && apiKey.length > 20),
      });
    }

    if (req.method !== 'POST') {
      return sendJson(res, 405, { error: 'Method Not Allowed. Use POST.' });
    }

    // Rate limiter
    const forwarded = req.headers ? req.headers['x-forwarded-for'] : undefined;
    const clientIp = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : '127.0.0.1';
    if (!checkServerRateLimit(clientIp)) {
      return sendJson(res, 429, {
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please wait a minute before making another AI analysis request.',
      });
    }

    // Retrieve server-side API Key
    const apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();
    if (!apiKey || apiKey.length < 20) {
      return sendJson(res, 200, {
        success: false,
        isConfigured: false,
        error: 'GEMINI_API_KEY_NOT_CONFIGURED',
        message:
          'Google Gemini API key is not configured in Vercel Environment Variables. Add GEMINI_API_KEY in Vercel Project Settings > Environment Variables to activate live cloud AI.',
      });
    }

    const body = await parseBody(req);
    const { action, contents, model = 'gemini-1.5-flash' } = body || {};

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
          return sendJson(res, 200, {
            success: true,
            isConfigured: true,
            message: 'Google Gemini API key verified and operational on Vercel Serverless!',
          });
        }
        return sendJson(res, 200, {
          success: false,
          isConfigured: true,
          message: pingData?.error?.message || `HTTP ${pingRes.status} from Google Gemini API`,
        });
      } catch (pingErr: any) {
        return sendJson(res, 500, {
          success: false,
          error: 'CONNECTION_TEST_FAILED',
          message: pingErr?.message || 'Failed to ping Gemini API',
        });
      }
    }

    if (!contents || !Array.isArray(contents)) {
      return sendJson(res, 400, { error: 'Missing or invalid "contents" array in request body' });
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
      return sendJson(res, geminiRes.status === 429 ? 429 : 200, {
        success: false,
        error: isQuota ? 'QUOTA_EXHAUSTED' : 'GEMINI_API_ERROR',
        message: isQuota
          ? 'Google Gemini API free tier quota limit reached. Please wait or check your Google AI Studio quota.'
          : errMsg,
      });
    }

    return sendJson(res, 200, {
      success: true,
      source: 'live_gemini_serverless',
      candidates: data.candidates || [],
      promptFeedback: data.promptFeedback,
    });
  } catch (err: any) {
    return sendJson(res, 500, {
      success: false,
      error: 'SERVERLESS_PROXY_EXCEPTION',
      message: err?.message || 'Internal error in Gemini Serverless function',
    });
  }
}
