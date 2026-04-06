"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import type { AvatarEmotion, ChatMessage } from "@/types";

type ChatScreenProps = {
  onClose: () => void;
};

export function ChatScreen({ onClose }: ChatScreenProps) {
  const t = useTranslations("chat");
  const tHud = useTranslations("hud");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [emotion, setEmotion] = useState<AvatarEmotion>("neutral");
  const [displayedCharCount, setDisplayedCharCount] = useState(0);

  // Two-layer crossfade for avatar emotion transitions
  const [showFirst, setShowFirst] = useState(true);
  const [img1Emotion, setImg1Emotion] = useState<AvatarEmotion>("neutral");
  const [img2Emotion, setImg2Emotion] = useState<AvatarEmotion>("neutral");

  const showFirstRef = useRef(true);
  const emotionRef = useRef<AvatarEmotion>("neutral");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fullTextRef = useRef("");
  const revealTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-scroll on new messages or revealed characters
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, displayedCharCount]);

  // Close on ESC key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Focus input on mount and after streaming ends
  useEffect(() => {
    if (!isStreaming) inputRef.current?.focus();
  }, [isStreaming]);

  // Abort in-flight request and clear reveal timer on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (revealTimerRef.current) clearInterval(revealTimerRef.current);
    };
  }, []);

  const updateEmotion = useCallback((next: AvatarEmotion) => {
    if (emotionRef.current === next) return;
    emotionRef.current = next;
    setEmotion(next);

    if (showFirstRef.current) {
      setImg2Emotion(next);
      setShowFirst(false);
      showFirstRef.current = false;
    } else {
      setImg1Emotion(next);
      setShowFirst(true);
      showFirstRef.current = true;
    }
  }, []);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    const history = [...messages, userMsg];

    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setIsStreaming(true);
    setDisplayedCharCount(0);
    fullTextRef.current = "";
    updateEmotion("thinking");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let emotionExtracted = false;
      let emotionBuffer = "";

      // Start the character reveal interval
      revealTimerRef.current = setInterval(() => {
        setDisplayedCharCount((prev) => {
          if (prev < fullTextRef.current.length) return prev + 1;
          return prev;
        });
      }, 30);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        if (!emotionExtracted) {
          emotionBuffer += chunk;
          const closeIdx = emotionBuffer.indexOf("]");

          if (closeIdx !== -1) {
            const match = emotionBuffer.match(/^\[EMOTION:(\w+)\]/);
            if (match) {
              updateEmotion(match[1] as AvatarEmotion);
              fullTextRef.current = emotionBuffer.slice(match[0].length);
            } else {
              updateEmotion("neutral");
              fullTextRef.current = emotionBuffer;
            }
            emotionExtracted = true;
          } else if (emotionBuffer.length > 50) {
            updateEmotion("neutral");
            fullTextRef.current = emotionBuffer;
            emotionExtracted = true;
          }
        } else {
          fullTextRef.current += chunk;
        }
      }

      // If no emotion tag was found at all (stream ended during buffer phase)
      if (!emotionExtracted) {
        updateEmotion("neutral");
        fullTextRef.current = emotionBuffer;
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      updateEmotion("error");
      setMessages((prev) => {
        const updated = [...prev];
        if (updated[updated.length - 1]?.role === "assistant") {
          updated[updated.length - 1] = { role: "assistant", content: t("error") };
        } else {
          updated.push({ role: "assistant", content: t("error") });
        }
        return updated;
      });
    } finally {
      // Wait for reveal to finish, then clean up
      await new Promise<void>((resolve) => {
        const check = setInterval(() => {
          setDisplayedCharCount((prev) => {
            if (prev >= fullTextRef.current.length) {
              clearInterval(check);
              resolve();
              return prev;
            }
            return prev + 1;
          });
        }, 30);
      });

      if (revealTimerRef.current) {
        clearInterval(revealTimerRef.current);
        revealTimerRef.current = null;
      }

      // Finalize the message with full text
      setMessages((prev) => {
        const updated = [...prev];
        if (updated[updated.length - 1]?.role === "assistant") {
          updated[updated.length - 1] = { role: "assistant", content: fullTextRef.current };
        }
        return updated;
      });

      // Fallback: reset to neutral if still thinking
      if (emotionRef.current === "thinking") {
        updateEmotion("neutral");
      }

      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-background">
      {/* Chat panel */}
      <div className="flex flex-1 flex-col p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-border pb-3 mb-4">
          <h2 className="text-[10px] md:text-xs text-accent-gold">
            {t("title")}
          </h2>
          <button
            onClick={onClose}
            className="border-2 border-border px-2 py-1 text-[10px] text-text-muted hover:border-border-active hover:text-accent-gold"
            aria-label={t("close")}
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`border-2 p-3 text-[8px] md:text-[10px] leading-relaxed ${
                msg.role === "assistant"
                  ? "border-border-active"
                  : "border-border"
              }`}
            >
              <span
                className={`block mb-1 text-[7px] md:text-[8px] ${
                  msg.role === "assistant"
                    ? "text-accent-gold"
                    : "text-text-muted"
                }`}
              >
                ▶ {msg.role === "assistant" ? t("pablo") : t("you")}
              </span>
              {isStreaming &&
                i === messages.length - 1 &&
                msg.role === "assistant"
                ? fullTextRef.current.slice(0, displayedCharCount)
                : msg.content}
              {isStreaming &&
                i === messages.length - 1 &&
                msg.role === "assistant" && (
                  <span className="animate-blink">▌</span>
                )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input row */}
        <div className="flex gap-2 mt-3 pt-3 border-t-2 border-border">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder={t("placeholder")}
            disabled={isStreaming}
            className="flex-1 bg-surface border-2 border-border px-3 py-2 text-[8px] md:text-[10px] text-text-primary placeholder:text-text-dim focus:border-border-active focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="border-2 border-border-active bg-surface px-3 py-2 text-[8px] md:text-[10px] text-accent-gold hover:bg-background disabled:opacity-50 disabled:border-border disabled:text-text-dim"
          >
            {isStreaming ? t("thinking") : t("send")}
          </button>
        </div>
      </div>

      {/* Avatar panel — hidden on mobile */}
      <div className="hidden md:flex flex-col items-center justify-center w-64 lg:w-80 border-l-2 border-border p-6">
        <div className="relative w-32 h-32 lg:w-48 lg:h-48 mb-4">
          <img
            src={`/avatar/pat_${img1Emotion}.png`}
            alt=""
            data-pixel
            className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300"
            style={{ opacity: showFirst ? 1 : 0 }}
          />
          <img
            src={`/avatar/pat_${img2Emotion}.png`}
            alt={emotion}
            data-pixel
            className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300"
            style={{ opacity: showFirst ? 0 : 1 }}
          />
        </div>
        <p className="text-[10px] text-accent-gold mb-1">▶ {tHud("name")}</p>
        <p className="text-[8px] text-text-muted">{tHud("level")}</p>
      </div>
    </div>
  );
}
