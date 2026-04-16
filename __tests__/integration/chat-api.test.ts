/**
 * Integration test — /api/chat route
 *
 * Tests the chat API endpoint's validation and streaming behaviour.
 * - Returns 400 when the `messages` field is missing or empty.
 * - Returns a streaming response when given a valid request body.
 * - Validates content-type enforcement, message caps, payload size,
 *   role alternation, and origin checks.
 *
 * The Anthropic SDK is mocked so tests never call the real API.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock fs.readFileSync so the route's top-level pabloContext load succeeds
vi.mock("fs", () => ({
  default: { readFileSync: () => "Mock context for testing." },
  readFileSync: () => "Mock context for testing.",
}));

// Mock the Anthropic SDK to return a fake streaming response
const mockCreate = vi.fn();
vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: class MockAnthropic {
      messages = { create: mockCreate };
    },
  };
});

// Set the API key before importing the route
vi.stubEnv("ANTHROPIC_API_KEY", "test-key-123");

// Import the route handler after mocks are in place
const { POST } = await import("@/app/api/chat/route");

function makeRequest(
  body: unknown,
  headers: Record<string, string> = {},
): NextRequest {
  return new NextRequest("http://localhost:3000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "127.0.0.1",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe("/api/chat POST", () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it("returns 400 when messages field is missing", async () => {
    const request = makeRequest({});
    const response = await POST(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toMatch(/messages/i);
  });

  it("returns 400 when messages array is empty", async () => {
    const request = makeRequest({ messages: [] });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("returns 400 when a message has invalid role", async () => {
    const request = makeRequest({
      messages: [{ role: "system", content: "hello" }],
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("returns a streaming response for a valid request", async () => {
    // Create an async iterable that yields text delta events
    const fakeStream = (async function* () {
      yield {
        type: "content_block_delta",
        delta: { type: "text_delta", text: "[EMOTION:happy]" },
      };
      yield {
        type: "content_block_delta",
        delta: { type: "text_delta", text: "Hello!" },
      };
    })();

    mockCreate.mockResolvedValueOnce(fakeStream);

    const request = makeRequest({
      messages: [{ role: "user", content: "Hi Pablo!" }],
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8",
    );

    // Read the streamed body
    const text = await response.text();
    expect(text).toContain("[EMOTION:happy]");
    expect(text).toContain("Hello!");
  });

  // --- Content-Type enforcement ---

  it("returns 415 when Content-Type is not application/json", async () => {
    const request = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        "x-forwarded-for": "127.0.0.1",
      },
      body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }),
    });
    const response = await POST(request);

    expect(response.status).toBe(415);
  });

  // --- Whitespace-only content rejection ---

  it("returns 400 when a message content is whitespace only", async () => {
    const request = makeRequest({
      messages: [{ role: "user", content: "   " }],
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  // --- History/message cap ---

  it("returns 400 when messages array exceeds the history cap", async () => {
    // Build 51 alternating messages (user/assistant) ending with user
    const messages = Array.from({ length: 51 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: "message",
    }));
    const request = makeRequest({ messages });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  // --- Payload size ---

  it("returns 413 when total character count exceeds the limit", async () => {
    // 27 alternating messages × 2000 chars each = 54,000 chars > 50,000 limit
    // Each message is within the per-message cap (2000 chars)
    const content = "x".repeat(2000);
    const messages = Array.from({ length: 27 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content,
    }));
    const request = makeRequest({ messages });
    const response = await POST(request);

    expect(response.status).toBe(413);
  });

  // --- Role alternation ---

  it("returns 400 when roles do not alternate (adjacent duplicates)", async () => {
    const request = makeRequest({
      messages: [
        { role: "user", content: "first" },
        { role: "user", content: "second" },
      ],
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("returns 400 when the last message is from assistant", async () => {
    const request = makeRequest({
      messages: [
        { role: "user", content: "hello" },
        { role: "assistant", content: "hi there" },
      ],
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  // --- Origin check ---

  it("returns 403 in production when origin is not in the allowlist", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ALLOWED_ORIGINS", "");

    const request = makeRequest(
      { messages: [{ role: "user", content: "hi" }] },
      { origin: "https://evil.example.com" },
    );
    const response = await POST(request);

    expect(response.status).toBe(403);

    vi.unstubAllEnvs();
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key-123");
  });

  it("allows requests in production when origin matches ALLOWED_ORIGINS", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ALLOWED_ORIGINS", "https://preview.example.com");

    const fakeStream = (async function* () {
      yield {
        type: "content_block_delta",
        delta: { type: "text_delta", text: "[EMOTION:neutral]Hi!" },
      };
    })();
    mockCreate.mockResolvedValueOnce(fakeStream);

    const request = makeRequest(
      { messages: [{ role: "user", content: "hi" }] },
      { origin: "https://preview.example.com" },
    );
    const response = await POST(request);

    expect(response.status).toBe(200);

    vi.unstubAllEnvs();
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key-123");
  });
});
