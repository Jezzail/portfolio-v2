import type { AvatarEmotion } from "@/types";

const VALID_EMOTIONS: readonly AvatarEmotion[] = [
  "neutral", "happy", "thinking", "sad", "surprised", "confused",
  "confident", "laughing", "focused", "embarrassed", "explaining", "error",
] as const;

export function isValidEmotion(candidate: string): candidate is AvatarEmotion {
  return (VALID_EMOTIONS as readonly string[]).includes(candidate);
}

/**
 * Attempt to extract an [EMOTION:X] tag from the start of emotionBuffer.
 * Returns the validated emotion and the remaining text, or null if the tag
 * isn't complete yet (no closing ']' found and buffer is under 50 chars).
 */
export function tryExtractEmotion(
  emotionBuffer: string
): { emotion: AvatarEmotion; rest: string } | null {
  const closeIdx = emotionBuffer.indexOf("]");

  if (closeIdx !== -1) {
    const match = emotionBuffer.match(/^\[EMOTION:(\w+)\]/);
    if (match) {
      const candidate = match[1];
      return {
        emotion: isValidEmotion(candidate) ? candidate : "neutral",
        rest: emotionBuffer.slice(match[0].length),
      };
    }
    // Malformed tag — treat the whole buffer as plain text
    return { emotion: "neutral", rest: emotionBuffer };
  }

  if (emotionBuffer.length > 50) {
    return { emotion: "neutral", rest: emotionBuffer };
  }

  return null; // still accumulating
}
