import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

// Load pablo-context.md once at module init — single source of truth for the knowledge base.
const pabloContext = readFileSync(
  join(process.cwd(), "pablo-context.md"),
  "utf-8",
);

const SYSTEM_PROMPT = `You are Pablo Abril. You speak in first person — you ARE Pablo, not an assistant describing him. Use the knowledge base below to answer questions about yourself.

CRITICAL RULE — EMOTION TAG:
You MUST begin EVERY reply with exactly [EMOTION:X] where X is one of: neutral, happy, thinking, sad, surprised, confused, confident, laughing, focused, embarrassed, explaining, chad, error.
Choose the emotion that best fits the tone of your reply. No exceptions. No other format. The tag must be the very first characters of your response, e.g. "[EMOTION:happy]Great to meet you!"

Behaviour:
- Answer warmly and concisely. This is a portfolio chat, not a job interview.
- Keep answers under 3–4 sentences unless a longer answer is genuinely needed.
- If asked about salary: "I'm open to discussing based on the role and company."
- If asked something you don't know: be honest, direct them to pat43607@gmail.com.
- Match the language of the user — reply in Spanish if they write in Spanish, English if they write in English.
- Personality: confident but not arrogant, warm, slightly geeky (games, tech), international and multicultural in perspective.

=== KNOWLEDGE BASE ===

${pabloContext}

=== END KNOWLEDGE BASE ===`;

// Simple in-memory rate limiter: 20 requests per IP per minute.
// Note: best-effort only — serverless instances don't share memory across invocations.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;
const CLEANUP_THRESHOLD = 500;

// Per-message and history size caps
const MAX_MESSAGE_LENGTH = 2_000;
const MAX_HISTORY_MESSAGES = 50;

function checkRateLimit(ip: string, limit: number = RATE_LIMIT): boolean {
  const now = Date.now();

  // Prune expired entries when the map grows large to prevent unbounded memory growth.
  if (rateLimitMap.size > CLEANUP_THRESHOLD) {
    for (const [key, val] of rateLimitMap) {
      if (now > val.resetAt) rateLimitMap.delete(key);
    }
  }

  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

interface ChatRequestBody {
  messages: { role: "user" | "assistant"; content: string }[];
}

function isValidBody(body: unknown): body is ChatRequestBody {
  if (!body || typeof body !== "object") return false;
  const { messages } = body as Record<string, unknown>;
  if (!Array.isArray(messages) || messages.length === 0) return false;
  return messages.every(
    (m: unknown) =>
      typeof m === "object" &&
      m !== null &&
      "role" in m &&
      "content" in m &&
      typeof (m as Record<string, unknown>).content === "string" &&
      ((m as Record<string, unknown>).content as string).trim() !== "" &&
      ((m as Record<string, unknown>).content as string).length <=
        MAX_MESSAGE_LENGTH &&
      ((m as Record<string, unknown>).role === "user" ||
        (m as Record<string, unknown>).role === "assistant"),
  );
}

/**
 * Strip null bytes and ASCII control characters (keep \t, \n, \r).
 * Prevents downstream issues when forwarding content to the Anthropic API.
 */
function sanitizeContent(content: string): string {
  return content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

export async function POST(request: NextRequest) {
  // Enforce JSON content type — rejects unexpected media types early
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      { error: "Unsupported Media Type" },
      { status: 415 },
    );
  }

  // Origin check — reject cross-origin requests in production.
  // Configure ALLOWED_ORIGINS (comma-separated) for preview deployments.
  const origin = request.headers.get("origin");
  if (process.env.NODE_ENV === "production" && origin) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
      : ["patportfolio.dev"];

    let isAllowed = false;

    try {
      const { hostname } = new URL(origin);

      isAllowed = allowedOrigins.some(
        (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`),
      );
    } catch {
      isAllowed = false;
    }

    if (!isAllowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  // Apply a stricter limit to requests whose IP cannot be identified.
  const effectiveLimit = ip === "unknown" ? 5 : RATE_LIMIT;
  if (!checkRateLimit(ip, effectiveLimit)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  if (!isValidBody(body)) {
    return NextResponse.json(
      { error: "Invalid request body: messages array is required" },
      { status: 400 },
    );
  }

  // Payload size guards — prevent DoS via oversized bodies
  if (body.messages.length > MAX_HISTORY_MESSAGES) {
    return NextResponse.json(
      { error: "Too many messages in conversation" },
      { status: 400 },
    );
  }
  const totalChars = body.messages.reduce(
    (sum, m) => sum + m.content.length,
    0,
  );
  if (totalChars > 50_000) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  // Conversation structure validation:
  // — Last message must be from the user (not a fabricated assistant turn)
  // — Roles must strictly alternate to prevent context poisoning
  const lastRole = body.messages[body.messages.length - 1].role;
  if (lastRole !== "user") {
    return NextResponse.json(
      { error: "Last message must be from user" },
      { status: 400 },
    );
  }
  const hasAdjacentSameRole = body.messages.some(
    (m, i) => i > 0 && m.role === body.messages[i - 1].role,
  );
  if (hasAdjacentSameRole) {
    return NextResponse.json(
      { error: "Messages must alternate between user and assistant" },
      { status: 400 },
    );
  }

  // Sanitize content — strip null bytes and control characters before forwarding to Anthropic
  const sanitizedMessages = body.messages.map((m) => ({
    role: m.role,
    content: sanitizeContent(m.content),
  }));

  const anthropic = new Anthropic({ apiKey });

  try {
    const stream = await anthropic.messages.create(
      {
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: sanitizedMessages,
        stream: true,
      },
      { signal: request.signal },
    );

    const { readable, writable } = new TransformStream<Uint8Array>();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      try {
        for await (const event of stream) {
          if (request.signal.aborted) break;
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            await writer.write(encoder.encode(event.delta.text));
          }
        }
      } catch {
        if (!request.signal.aborted) {
          await writer.write(
            encoder.encode(
              "[EMOTION:error]Something went wrong. Please try again.",
            ),
          );
        }
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 },
    );
  }
}
