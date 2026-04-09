/**
 * Integration test — /api/chat route
 *
 * Tests the chat API endpoint's validation and streaming behaviour.
 * - Returns 400 when the `messages` field is missing or empty.
 * - Returns a streaming response when given a valid request body.
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

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "127.0.0.1",
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
      "text/plain; charset=utf-8"
    );

    // Read the streamed body
    const text = await response.text();
    expect(text).toContain("[EMOTION:happy]");
    expect(text).toContain("Hello!");
  });
});
