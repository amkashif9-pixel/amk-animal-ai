// Supabase Edge Function: gemini-proxy
// Hardened Production-Grade Secure Server-Side Proxy for Google Gemini Multimodal AI
// Brand: AMK Animal AI | By amkashif | WhatsApp: +923346682654

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Strict Security Boundaries
const MAX_BODY_BYTES = 10 * 1024 * 1024; // 10MB absolute maximum request size
const MAX_IMAGES_PER_REQUEST = 4;
const MAX_DECODED_IMAGE_BYTES = 4.5 * 1024 * 1024; // 4.5MB maximum decoded binary image size
const MAX_TEXT_LENGTH = 10000; // 10,000 characters maximum per prompt block
const MAX_SYSTEM_INSTRUCTION_LENGTH = 4000;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_ACTIONS = new Set(["scan", "health", "health_triage", "chat", "test_connection"]);

interface ProxyRequestBody {
  action: "scan" | "health" | "health_triage" | "chat" | "test_connection";
  contents: any[];
  systemInstruction?: string;
}

/**
 * Calculates exact decoded binary byte size of a base64 string
 */
export function getDecodedBase64Size(base64Str: string): number {
  const clean = base64Str.trim();
  const len = clean.length;
  if (len === 0) return 0;
  let padding = 0;
  if (clean.endsWith("==")) padding = 2;
  else if (clean.endsWith("=")) padding = 1;
  return Math.floor((len * 3) / 4) - padding;
}

serve(async (req: Request) => {
  // 1. Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // 2. Enforce HTTP Method
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Only POST is accepted.", code: "METHOD_NOT_ALLOWED" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // 3. Early Request Size Inspection (Header check)
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
      return new Response(
        JSON.stringify({
          error: "Payload too large. Maximum request body is 10MB.",
          code: "PAYLOAD_TOO_LARGE",
        }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Enforce Authentication via Supabase JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized: Missing or malformed Authorization Bearer token.",
          code: "AUTH_REQUIRED",
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({
          error: "Server configuration failure: Supabase environment variables not set.",
          code: "CONFIG_ERROR",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Authorize caller and extract genuine authenticated user identity
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized: Invalid or expired session token.",
          code: "INVALID_TOKEN",
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Persistent, Atomic Database-Backed Quota Consumption
    // FAIL CLOSED: If quota check fails, RPC fails, or DB is unreachable, reject the request.
    const { data: quotaResult, error: quotaRpcError } = await supabaseClient.rpc(
      "consume_ai_scan_quota",
      {
        p_burst_limit: 10,
        p_burst_window_seconds: 60,
        p_daily_limit: 50,
        p_daily_window_seconds: 86400,
      }
    );

    if (quotaRpcError || !quotaResult) {
      console.error("Database quota check failure (failing closed):", quotaRpcError);
      return new Response(
        JSON.stringify({
          error: "Quota verification failed. AI service access denied (fail-closed).",
          code: "QUOTA_VERIFICATION_FAILED",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (quotaResult.allowed === false) {
      const retryAfter = quotaResult.retry_after || 60;
      return new Response(
        JSON.stringify({
          error: quotaResult.reason || "AI rate limit or scan quota exceeded.",
          code: quotaResult.error_code || "RATE_LIMIT_EXCEEDED",
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(retryAfter),
          },
        }
      );
    }

    // 6. Retrieve Server-Side Gemini API Key Secret
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({
          error: "Server configuration error: Gemini API secret is not configured in backend vault.",
          code: "MISSING_SERVER_KEY",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 7. Enforce Byte-Level Payload Boundaries WHILE Reading Request Stream
    const reader = req.body?.getReader();
    if (!reader) {
      return new Response(
        JSON.stringify({ error: "Empty request body.", code: "EMPTY_BODY" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let totalBytes = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        totalBytes += value.length;
        if (totalBytes > MAX_BODY_BYTES) {
          await reader.cancel();
          return new Response(
            JSON.stringify({
              error: "Payload too large. Exceeds 10MB limit.",
              code: "PAYLOAD_TOO_LARGE",
            }),
            { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        chunks.push(value);
      }
    }

    const bodyBuffer = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      bodyBuffer.set(chunk, offset);
      offset += chunk.length;
    }
    const rawBody = new TextDecoder().decode(bodyBuffer);

    let body: ProxyRequestBody;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new Response(
        JSON.stringify({ error: "Malformed request: Body is not valid JSON.", code: "INVALID_JSON" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 8. Strict Schema & Action Validation
    if (!body || typeof body !== "object") {
      return new Response(
        JSON.stringify({ error: "Invalid request: Payload must be a JSON object.", code: "INVALID_PAYLOAD" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body.action || !ALLOWED_ACTIONS.has(body.action)) {
      return new Response(
        JSON.stringify({
          error: `Invalid action '${body.action}'. Permitted actions: ${Array.from(ALLOWED_ACTIONS).join(", ")}.`,
          code: "INVALID_ACTION",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!Array.isArray(body.contents) || body.contents.length === 0 || body.contents.length > 10) {
      return new Response(
        JSON.stringify({
          error: "Malformed request: 'contents' must be a non-empty array with at most 10 items.",
          code: "INVALID_CONTENTS",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 9. Inspect Multimodal Image Attachments & Text Lengths
    let totalImages = 0;
    for (const content of body.contents) {
      if (!content || typeof content !== "object") continue;

      if (Array.isArray(content.parts)) {
        for (const part of content.parts) {
          if (!part || typeof part !== "object") continue;

          // Check text lengths
          if (typeof part.text === "string" && part.text.length > MAX_TEXT_LENGTH) {
            return new Response(
              JSON.stringify({
                error: `Text prompt part exceeds maximum allowed length of ${MAX_TEXT_LENGTH} characters.`,
                code: "PROMPT_TOO_LONG",
              }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          // Check image attachments
          if (part.inlineData) {
            totalImages++;
            if (totalImages > MAX_IMAGES_PER_REQUEST) {
              return new Response(
                JSON.stringify({
                  error: `Too many images. Maximum ${MAX_IMAGES_PER_REQUEST} images allowed per scan.`,
                  code: "IMAGE_COUNT_EXCEEDED",
                }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }

            const mimeType = String(part.inlineData.mimeType || "").toLowerCase().trim();
            if (!ALLOWED_MIME_TYPES.has(mimeType)) {
              return new Response(
                JSON.stringify({
                  error: `Unsupported image MIME type: '${mimeType}'. Allowed formats: JPEG, PNG, WEBP.`,
                  code: "INVALID_MIME_TYPE",
                }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }

            const dataStr = String(part.inlineData.data || "");
            const decodedBytes = getDecodedBase64Size(dataStr);
            if (decodedBytes > MAX_DECODED_IMAGE_BYTES) {
              return new Response(
                JSON.stringify({
                  error: "Individual image exceeds maximum permitted decoded binary size of 4.5MB.",
                  code: "IMAGE_TOO_LARGE",
                }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }

            // Verify base64 charset integrity
            const base64Regex = /^[A-Za-z0-9+/=]+$/;
            if (!base64Regex.test(dataStr.slice(0, 100))) {
              return new Response(
                JSON.stringify({
                  error: "Corrupted image payload: inlineData.data is not valid base64.",
                  code: "CORRUPTED_BASE64",
                }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
          }
        }
      }
    }

    // 10. Handle Connection Diagnostic Ping
    const geminiModel = Deno.env.get("GEMINI_MODEL") || "gemini-3.5-flash";

    if (body.action === "test_connection") {
      const pingUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;
      const pingRes = await fetch(pingUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: "ping" }] }] }),
      });

      if (!pingRes.ok) {
        return new Response(
          JSON.stringify({
            error: "Gemini connectivity test failed. Please verify API key validity in server vault.",
            code: "UPSTREAM_KEY_INVALID",
          }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: "Gemini server proxy operational." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 11. Dispatch Multimodal Generation to Google Gemini via Server Proxy
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;

    const payload: any = {
      contents: body.contents,
    };

    if (body.systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: String(body.systemInstruction).slice(0, MAX_SYSTEM_INSTRUCTION_LENGTH) }],
      };
    }

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!geminiResponse.ok) {
      const status = geminiResponse.status;
      // Do not return raw Google error bodies which may contain API endpoint URL with key
      let safeErrorMessage = "AI processing service temporarily unavailable.";
      if (status === 429) {
        safeErrorMessage = "Google AI quota exhausted on upstream server. Please try again shortly.";
      } else if (status === 400) {
        safeErrorMessage = "Invalid request format sent to vision engine.";
      }

      return new Response(
        JSON.stringify({ error: safeErrorMessage, code: `GEMINI_HTTP_${status}` }),
        { status: status >= 500 ? 502 : status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const responseData = await geminiResponse.json();

    // 12. Return clean, sanitized response
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    // Return sanitized error without internal stack traces or environment secrets
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred while processing your AI request.",
        code: "SERVER_PROXY_EXCEPTION",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
