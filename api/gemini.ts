import type { IncomingMessage, ServerResponse } from 'http';

interface ExtendedRequest extends IncomingMessage {
  body?: any;
  query?: Record<string, string>;
  method?: string;
  headers: Record<string, string | string[] | undefined>;
}

interface ExtendedResponse extends ServerResponse {
  status: (statusCode: number) => ExtendedResponse;
  json: (data: any) => void;
  setHeader: (name: string, value: string) => this;
}

// Simple sliding window in-memory rate limiter per IP (max 30 requests per minute)
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

export default async function handler(req: ExtendedRequest, res: ExtendedResponse) {
  // 1. CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).json({ ok: true });
    return;
  }

  // 2. Health check
  if (req.method === 'GET') {
    const apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();
    res.status(200).json({
      status: 'active',
      service: 'AMK Animal AI Gemini Serverless Proxy',
      isConfigured: Boolean(apiKey && apiKey.length > 20),
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    return;
  }

  // 3. Rate Limiter
  const forwarded = req.headers['x-forwarded-for'];
  const clientIp = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : '127.0.0.1';
  if (!checkServerRateLimit(clientIp)) {
    res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please wait a minute before making another AI analysis request.',
    });
    return;
  }

  // 4. Retrieve Server-side Gemini Key
  const apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();
  if (!apiKey || apiKey.length < 20) {
    res.status(200).json({
      success: false,
      isConfigured: false,
      error: 'GEMINI_API_KEY_NOT_CONFIGURED',
      message:
        'Google Gemini API key is not configured in Vercel Environment Variables. Add GEMINI_API_KEY in Vercel Project Settings > Environment Variables to activate live cloud AI.',
    });
    return;
  }

  // 5. Parse Request Body
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      res.status(400).json({ error: 'Invalid JSON payload' });
      return;
    }
  }

  const { action, contents, model = 'gemini-1.5-flash' } = body || {};

  // Connection test action
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
        res.status(200).json({
          success: true,
          isConfigured: true,
          message: 'Google Gemini API key verified and operational on Vercel Serverless!',
        });
        return;
      }
      res.status(200).json({
        success: false,
        isConfigured: true,
        message: pingData?.error?.message || `HTTP ${pingRes.status} from Google Gemini API`,
      });
      return;
    } catch (pingErr: any) {
      res.status(500).json({
        success: false,
        error: 'CONNECTION_TEST_FAILED',
        message: pingErr?.message || 'Failed to ping Gemini API',
      });
      return;
    }
  }

  if (!contents || !Array.isArray(contents)) {
    res.status(400).json({ error: 'Missing or invalid "contents" array in request body' });
    return;
  }

  // 6. Execute Gemini Generation Call
  try {
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
      res.status(geminiRes.status === 429 ? 429 : 200).json({
        success: false,
        error: isQuota ? 'QUOTA_EXHAUSTED' : 'GEMINI_API_ERROR',
        message: isQuota
          ? 'Google Gemini API free tier quota limit reached. Please wait or check your Google AI Studio quota.'
          : errMsg,
      });
      return;
    }

    // Return successful generation result
    res.status(200).json({
      success: true,
      source: 'live_gemini_serverless',
      candidates: data.candidates || [],
      promptFeedback: data.promptFeedback,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'SERVERLESS_PROXY_EXCEPTION',
      message: err?.message || 'Internal error in Gemini Serverless function',
    });
  }
}
