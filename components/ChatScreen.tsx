"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import type { AvatarEmotion, ChatMessage } from "@/types";
import { tryExtractEmotion } from "@/lib/emotion";

type ChatScreenProps = {
  onClose: () => void;
};

export function ChatScreen({ onClose }: ChatScreenProps) {
  const t = useTranslations("chat");
  const tHud = useTranslations("hud");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [displayedCharCount, setDisplayedCharCount] = useState(0);
  const [finalizationPending, setFinalizationPending] = useState(false);

  // Two-layer crossfade for avatar emotion transitions
  const [showFirst, setShowFirst] = useState(true);
  const [img1Emotion, setImg1Emotion] = useState<AvatarEmotion>("neutral");
  const [img2Emotion, setImg2Emotion] = useState<AvatarEmotion>("neutral");

  const showFirstRef = useRef(true);
  const emotionRef = useRef<AvatarEmotion>("neutral");
  const mountedRef = useRef(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fullTextRef = useRef("");
  const revealTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const prevMessageCountRef = useRef(0);

  // Auto-scroll smoothly only when a new message is appended
  useEffect(() => {
    const hasNewMessage = messages.length > prevMessageCountRef.current;
    if (hasNewMessage) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages]);

  // Keep the latest streaming text visible without restarting smooth scroll animations
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [displayedCharCount]);

  // Close on ESC key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Pin container to the visual viewport so the virtual keyboard never
  // pushes content off-screen on Android Chrome / Samsung Browser.
  useEffect(() => {
    const vv = window.visualViewport;
    const container = containerRef.current;
    if (!vv || !container) return;

    const update = () => {
      container.style.top = `${vv.offsetTop}px`;
      container.style.height = `${vv.height}px`;
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  // Focus input on mount and after streaming ends (desktop only)
  useEffect(() => {
    if (!isStreaming && window.matchMedia("(min-width: 768px)").matches) {
      inputRef.current?.focus();
    }
  }, [isStreaming]);

  // Abort in-flight request and clear reveal timer on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
      if (revealTimerRef.current) clearInterval(revealTimerRef.current);
    };
  }, []);

  const updateEmotion = useCallback((next: AvatarEmotion) => {
    if (emotionRef.current === next) return;
    emotionRef.current = next;

    const img = new Image();
    img.src = `/avatar/pat_${next}.png`;

    const apply = () => {
      if (!mountedRef.current) return;
      if (showFirstRef.current) {
        setImg2Emotion(next);
        setShowFirst(false);
        showFirstRef.current = false;
      } else {
        setImg1Emotion(next);
        setShowFirst(true);
        showFirstRef.current = true;
      }
    };

    if (img.complete) {
      apply();
    } else {
      img.onload = apply;
      img.onerror = apply;
    }
  }, []);

  // Finalize once the character reveal catches up to the full streamed text
  useEffect(() => {
    if (!finalizationPending) return;
    if (displayedCharCount < fullTextRef.current.length) return;

    if (revealTimerRef.current) {
      clearInterval(revealTimerRef.current);
      revealTimerRef.current = null;
    }

    setFinalizationPending(false);

    if (fullTextRef.current.length > 0) {
      setMessages((prev) => {
        const updated = [...prev];
        if (updated[updated.length - 1]?.role === "assistant") {
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: fullTextRef.current,
          };
        }
        return updated;
      });
    }

    if (emotionRef.current === "thinking") {
      updateEmotion("neutral");
    }

    setIsStreaming(false);
    abortRef.current = null;
  }, [finalizationPending, displayedCharCount, updateEmotion]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };
    const history = [...messages, userMsg];

    setMessages([
      ...history,
      { id: crypto.randomUUID(), role: "assistant", content: "" },
    ]);
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
      }, 20);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        if (!emotionExtracted) {
          emotionBuffer += chunk;
          const result = tryExtractEmotion(emotionBuffer);
          if (result) {
            updateEmotion(result.emotion);
            fullTextRef.current = result.rest;
            emotionExtracted = true;
          }
        } else {
          fullTextRef.current += chunk;
        }
      }

      // Flush any remaining bytes from the decoder (handles split multi-byte chars)
      const finalChunk = decoder.decode();
      if (finalChunk) {
        if (!emotionExtracted) {
          emotionBuffer += finalChunk;
          const result = tryExtractEmotion(emotionBuffer);
          if (result) {
            updateEmotion(result.emotion);
            fullTextRef.current = result.rest;
            emotionExtracted = true;
          }
        } else {
          fullTextRef.current += finalChunk;
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
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: t("error"),
          };
        } else {
          updated.push({
            id: crypto.randomUUID(),
            role: "assistant",
            content: t("error"),
          });
        }
        return updated;
      });
    } finally {
      // On abort: just clean up timers and refs, skip all state updates
      if (controller.signal.aborted) {
        if (revealTimerRef.current) {
          clearInterval(revealTimerRef.current);
          revealTimerRef.current = null;
        }
        return;
      }

      // Signal that streaming is done. The finalization effect will wait for
      // the character reveal animation to catch up before cleaning up.
      setFinalizationPending(true);
    }
  };

  const avatarCrossfade = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/avatar/pat_${img1Emotion}.png`}
        alt={t("avatarAlt")}
        data-pixel=""
        className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300"
        style={{ opacity: showFirst ? 1 : 0 }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/avatar/pat_${img2Emotion}.png`}
        alt=""
        aria-hidden="true"
        data-pixel=""
        className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300"
        style={{ opacity: showFirst ? 0 : 1 }}
      />
    </>
  );

  return (
    <div
      ref={containerRef}
      className="fixed inset-x-0 top-0 z-50 flex flex-col md:flex-row bg-background"
      style={{ height: "100dvh" }}
    >
      {/* Chat panel */}
      <div className="flex flex-1 flex-col p-4 md:p-6 min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-border pb-3 mb-4 gap-3">
          <h2 className="text-sm md:text-base text-accent-gold shrink-0">
            {t("title")}
          </h2>

          <button
            onClick={onClose}
            className="shrink-0 border-2 border-border px-2 py-1 text-sm text-text-muted hover:border-border-active hover:text-accent-gold"
            aria-label={t("close")}
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
          {messages.map((msg, i) => (
            <div
              key={msg.id}
              className={`border-2 p-3 text-xs md:text-sm leading-relaxed ${
                msg.role === "assistant"
                  ? "border-border-active"
                  : "border-border"
              }`}
            >
              <span
                className={`block mb-1 text-xs ${
                  msg.role === "assistant"
                    ? "text-accent-gold"
                    : "text-text-muted"
                }`}
              >
                {"\u25B6\uFE0E"}{" "}
                {msg.role === "assistant" ? t("pablo") : t("you")}
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

        {/* Mobile avatar strip — above input */}
        <div className="flex items-center justify-between border-t-2 border-border mt-2 md:hidden">
          <div className="flex flex-col">
            <p className="text-xs text-accent-gold mb-1">
              {"\u25B6\uFE0E"} {tHud("name")}
            </p>
            <p className="text-2xs text-text-muted">{tHud("level")}</p>
          </div>
          <div className="relative w-32 h-32 shrink-0">{avatarCrossfade}</div>
        </div>

        {/* Input row */}
        <div className="flex gap-2 mt-2 pt-2 border-t-2 border-border md:mt-3 md:pt-3">
          <label htmlFor="chat-input" className="sr-only">
            {t("inputLabel")}
          </label>
          <input
            ref={inputRef}
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder={t("placeholder")}
            disabled={isStreaming}
            className="flex-1 bg-surface border-2 border-border px-3 py-2 text-xs md:text-sm text-text-primary placeholder:text-text-dim focus:border-border-active focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="border-2 border-border-active bg-surface px-3 py-2 text-xs md:text-sm text-accent-gold hover:bg-background disabled:opacity-50 disabled:border-border disabled:text-text-dim"
          >
            {isStreaming ? t("thinking") : t("send")}
          </button>
        </div>
      </div>

      {/* Avatar panel — hidden on mobile */}
      <div className="hidden md:flex flex-col items-center justify-center w-64 lg:w-80 border-l-2 border-border p-6">
        <div className="relative min-w-32 min-h-32 w-48 h-48 mb-4">
          {avatarCrossfade}
        </div>
        <p className="text-sm text-accent-gold mb-1">
          {"\u25B6\uFE0E"} {tHud("name")}
        </p>
        <p className="text-xs text-text-muted">{tHud("level")}</p>
      </div>
    </div>
  );
}
