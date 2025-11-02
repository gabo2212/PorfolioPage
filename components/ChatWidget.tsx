"use client";

import type { ChangeEvent, Dispatch, KeyboardEvent, FC, SetStateAction } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import getBestAnswer from "../lib/knowledge";

export type ChatMessage = {
  from: "user" | "bot";
  text: string;
};

export interface ChatWidgetProps {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
}

const STARTER_MESSAGE =
  "Ask me about my bio, skills, projects (CEObot, Companion AI, VibeCoder), workstyle, experience, education, or how to contact me.";

const RECOMMENDED_QUESTIONS = [
  "What projects are you most proud of?",
  "Can you summarize your AI experience?",
  "What skills are you focusing on right now?",
  "Tell me about your Cirque du Soleil role.",
  "Where did you study AI and computer science?",
  "How do you approach building products?",
  "What tools are in your daily stack?",
  "How can we best get in touch?",
];

const pickSuggestions = (exclude: string[] = [], count = 3): string[] => {
  const unique = new Set<string>();
  const exclusions = new Set(exclude.map((item) => item.toLowerCase()));
  const pool = RECOMMENDED_QUESTIONS.filter(
    (question) => !exclusions.has(question.toLowerCase()),
  );

  while (unique.size < Math.min(count, pool.length)) {
    const random = pool[Math.floor(Math.random() * pool.length)];
    unique.add(random);
  }

  return Array.from(unique);
};

const ChatWidget: FC<ChatWidgetProps> = ({ open, onClose, messages, setMessages }) => {
  const [input, setInput] = useState<string>("");
  const panelRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const hasStarterMessage = useMemo(() => messages.length > 0, [messages.length]);
  const [suggestions, setSuggestions] = useState<string[]>(() => pickSuggestions());
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const existing = document.getElementById("chat-animations");
    if (existing) {
      return;
    }
    const style = document.createElement("style");
    style.id = "chat-animations";
    style.textContent =
      "@keyframes chatWarpIn{0%{opacity:0;transform:translateY(28px) scale(.92) rotateX(12deg);filter:blur(18px);}55%{opacity:1;transform:translateY(-6px) scale(1.03);filter:blur(0);}100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0);}}" +
      "@keyframes chatWarpOut{0%{opacity:1;transform:translateY(0) scale(1);filter:blur(0);}100%{opacity:0;transform:translateY(16px) scale(.9) rotateX(8deg);filter:blur(14px);}}" +
      "@keyframes chatSuggestionFly{0%{opacity:1;transform:translateY(0) scale(1);}100%{opacity:0;transform:translateY(-14px) scale(.94);}}" +
      "@keyframes chatBubbleIn{0%{opacity:0;transform:translateY(12px) scale(.95);}100%{opacity:1;transform:translateY(0) scale(1);}}" +
      ".chat-panel-shell{transform-origin:85% 100%;will-change:transform,opacity,filter;}" +
      ".chat-warp-in{animation:chatWarpIn .42s cubic-bezier(.22,.61,.36,1) forwards;}" +
      ".chat-warp-out{animation:chatWarpOut .26s cubic-bezier(.55,.09,.68,.53) forwards;}" +
      ".no-scrollbar{-ms-overflow-style:none;scrollbar-width:none;}" +
      ".no-scrollbar::-webkit-scrollbar{display:none;}" +
      ".chat-suggestion{display:inline-flex;align-items:center;gap:.35rem;padding:.4rem .85rem;border-radius:999px;border:1px solid rgba(99,102,241,.25);background:linear-gradient(135deg,rgba(59,130,246,.95),rgba(129,140,248,.95));color:#fff;font-weight:500;letter-spacing:.01em;box-shadow:0 18px 40px -22px rgba(79,70,229,.7);transition:transform .18s ease,box-shadow .18s ease,filter .18s ease;cursor:pointer;}" +
      ".chat-suggestion:hover{transform:translateY(-2px);box-shadow:0 22px 44px -20px rgba(79,70,229,.72);filter:brightness(1.05);}" +
      ".chat-suggestion:active{transform:translateY(0);filter:brightness(.95);}" +
      ".chat-suggestion--sending{animation:chatSuggestionFly .32s cubic-bezier(.22,.61,.36,1) forwards;pointer-events:none;}.chat-suggestion--muted{opacity:.65;}.chat-suggestion:disabled{cursor:default;}" +
      ".animate-chat-bubble{animation:chatBubbleIn .26s cubic-bezier(.22,.61,.36,1) both;}";
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    if (open && !hasStarterMessage) {
      setMessages(() => [{ from: "bot", text: STARTER_MESSAGE }]);
    }
    if (open) {
      setSuggestions(pickSuggestions());
      setActiveSuggestion(null);
    }
  }, [open, hasStarterMessage, setMessages]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const panel = panelRef.current;
    if (!panel) {
      return;
    }
    panel.classList.remove("chat-warp-in");
    panel.classList.remove("chat-warp-out");
    void panel.offsetWidth;
    panel.classList.add("chat-warp-in");
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [messages, open]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
    textarea.style.overflowY = "hidden";
  }, [input]);

  const handleSend = useCallback(
    (preset?: string) => {
      const trimmed = (preset ?? input).trim();
      if (!trimmed) {
        return;
      }

      setMessages((prev) => {
        const userMessage: ChatMessage = { from: "user", text: trimmed };
        const botMessage: ChatMessage = { from: "bot", text: getBestAnswer(trimmed) };
        return [...prev, userMessage, botMessage];
      });

      setSuggestions(pickSuggestions([trimmed]));
      setActiveSuggestion(null);

      if (!preset) {
        setInput("");
      }
    },
    [input, setMessages],
  );

  const handleInputChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleSuggestionClick = useCallback(
    (question: string) => {
      if (activeSuggestion) {
        return;
      }
      setActiveSuggestion(question);
      setTimeout(() => {
        handleSend(question);
      }, 160);
    },
    [activeSuggestion, handleSend],
  );

  if (!open) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className="fixed bottom-20 right-4 z-[9999] flex h-96 w-80 flex-col rounded-xl border shadow-xl backdrop-blur-xl bg-white/80 border-white/30 text-neutral-900 dark:bg-neutral-900/80 dark:border-white/10 dark:text-white chat-panel-shell chat-warp-in"
    >
      <div className="flex items-center justify-between border-b border-white/30 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-700 dark:text-neutral-300 dark:border-white/10">
        <span>Ask me about my work</span>
        <button
          type="button"
          onClick={onClose}
          className="text-[10px] font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white cursor-pointer select-none"
          aria-label="Close chat"
        >
          ✕
        </button>
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 px-3 pt-3 pb-1 text-xs">
          {suggestions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => handleSuggestionClick(question)}
              disabled={!!activeSuggestion}
              className={`chat-suggestion${
                activeSuggestion === question ? " chat-suggestion--sending" : ""
              }${
                activeSuggestion && activeSuggestion !== question ? " chat-suggestion--muted" : ""
              }`}
            >
              {question}
            </button>
          ))}
        </div>
      )}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-3 flex flex-col space-y-2 text-sm no-scrollbar"
        aria-live="polite"
      >
        {messages.map((message, index) => {
          const isUser = message.from === "user";
          const bubbleClass = isUser
            ? "self-end max-w-[80%] rounded-lg px-3 py-2 text-sm bg-blue-600 text-white animate-chat-bubble"
            : "self-start max-w-[80%] rounded-lg px-3 py-2 text-sm bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-white animate-chat-bubble";
          return (
            <div key={`${message.from}-${index}`} className={bubbleClass}>
              {message.text}
            </div>
          );
        })}
      </div>
      <div className="border-t border-white/30 dark:border-white/10 p-2 flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your question..."
          rows={1}
          className="flex-1 resize-none overflow-hidden rounded-md border border-white/30 dark:border-white/10 bg-transparent px-2 py-2 text-sm leading-snug text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={input.trim().length === 0}
          className="rounded-md bg-blue-600 text-white text-xs font-medium px-3 py-2 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;
    if (!trimmed) {
      return;
    }

    setMessages((prev) => {
      const userMessage: ChatMessage = { from: "user", text: trimmed };
      const botMessage: ChatMessage = { from: "bot", text: getBestAnswer(trimmed) };
      return [...prev, userMessage, botMessage];
    });
    setInput("");
  }, [input, setMessages]);

  const handleInputChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  if (!open) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className="fixed bottom-20 right-4 z-[9999] flex h-96 w-80 flex-col rounded-xl border shadow-xl backdrop-blur-xl bg-white/80 border-white/30 text-neutral-900 dark:bg-neutral-900/80 dark:border-white/10 dark:text-white chat-panel-shell chat-warp-in"
    >
      <div className="flex items-center justify-between border-b border-white/30 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-700 dark:text-neutral-300 dark:border-white/10">
        <span>Ask me about my work</span>
        <button
          type="button"
          onClick={onClose}
          className="text-[10px] font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white cursor-pointer select-none"
          aria-label="Close chat"
        >
          ✕
        </button>
      </div>
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-3 flex flex-col space-y-2 text-sm no-scrollbar"
        aria-live="polite"
      >
        {messages.map((message, index) => {
          const isUser = message.from === "user";
          const bubbleClass = isUser
            ? "self-end max-w-[80%] rounded-lg px-3 py-2 text-sm bg-blue-600 text-white"
            : "self-start max-w-[80%] rounded-lg px-3 py-2 text-sm bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-white";
          return (
            <div key={`${message.from}-${index}`} className={bubbleClass}>
              {message.text}
            </div>
          );
        })}
      </div>
      <div className="border-t border-white/30 dark:border-white/10 p-2 flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your question..."
          rows={1}
          className="flex-1 resize-none overflow-hidden rounded-md border border-white/30 dark:border-white/10 bg-transparent px-2 py-2 text-sm leading-snug text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={input.trim().length === 0}
          className="rounded-md bg-blue-600 text-white text-xs font-medium px-3 py-2 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;
