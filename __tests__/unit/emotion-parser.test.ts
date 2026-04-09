/**
 * Unit test — Emotion tag parser (lib/emotion.ts)
 *
 * The chat API prepends [EMOTION:X] to each AI response. The parser
 * extracts the emotion name and separates it from the visible reply text.
 * Getting this wrong would break the avatar expression system.
 */

import { describe, it, expect } from "vitest";
import { tryExtractEmotion, isValidEmotion } from "@/lib/emotion";

describe("tryExtractEmotion", () => {
  it('extracts "happy" and the remaining text from a valid tag', () => {
    const result = tryExtractEmotion("[EMOTION:happy]Hello there!");
    expect(result).toEqual({ emotion: "happy", rest: "Hello there!" });
  });

  it('extracts "thinking" with empty remaining text', () => {
    const result = tryExtractEmotion("[EMOTION:thinking]");
    expect(result).toEqual({ emotion: "thinking", rest: "" });
  });

  it("returns null when the tag is incomplete (still accumulating)", () => {
    const result = tryExtractEmotion("[EMOTION:hap");
    expect(result).toBeNull();
  });

  it("returns neutral for malformed tags (missing EMOTION prefix)", () => {
    const result = tryExtractEmotion("[MOOD:happy]Hello");
    expect(result).toEqual({ emotion: "neutral", rest: "[MOOD:happy]Hello" });
  });

  it("returns neutral for unrecognised emotion values", () => {
    const result = tryExtractEmotion("[EMOTION:ecstatic]Wow!");
    expect(result).toEqual({ emotion: "neutral", rest: "Wow!" });
  });

  it("returns neutral and full buffer when buffer exceeds 50 chars without closing bracket", () => {
    const longBuffer = "[EMOTION:happy" + "x".repeat(40);
    const result = tryExtractEmotion(longBuffer);
    expect(result).toEqual({ emotion: "neutral", rest: longBuffer });
  });

  it("handles all 12 valid emotions", () => {
    const emotions = [
      "neutral", "happy", "thinking", "sad", "surprised", "confused",
      "confident", "laughing", "focused", "embarrassed", "explaining", "error",
    ];

    for (const emotion of emotions) {
      const result = tryExtractEmotion(`[EMOTION:${emotion}]text`);
      expect(result).toEqual({ emotion, rest: "text" });
    }
  });
});

describe("isValidEmotion", () => {
  it("returns true for valid emotions", () => {
    expect(isValidEmotion("happy")).toBe(true);
    expect(isValidEmotion("neutral")).toBe(true);
    expect(isValidEmotion("error")).toBe(true);
  });

  it("returns false for invalid emotions", () => {
    expect(isValidEmotion("ecstatic")).toBe(false);
    expect(isValidEmotion("")).toBe(false);
    expect(isValidEmotion("HAPPY")).toBe(false);
  });
});
