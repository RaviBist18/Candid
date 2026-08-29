"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import {
  ArrowLeft,
  Sparkles,
  Send,
  RotateCcw,
  Mic,
  Square,
  User,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Check,
} from "lucide-react";
import { CandidLogo } from "@/components/Header";
import ReactMarkdown from "react-markdown";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
};

const SUGGESTED_QUESTIONS = [
  "How do I know if my resume is ATS-friendly?",
  "What projects actually impress recruiters?",
  "How should I prioritize which skills to learn first?",
  "What makes a GitHub profile look strong to hiring managers?",
  "How long should I spend on a portfolio project?",
];

export default function AskClient({
  initialMessages,
}: {
  initialMessages: ChatMessage[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, "up" | "down">>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 50);
    return () => clearTimeout(timer);
  }, [messages, sending]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSend(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || sending) return;
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    if (listening) {
      recognitionRef.current.userStopped = true;
      recognitionRef.current?.stop();
      setListening(false);
    }
    setInput("");
    setError("");

    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setSending(true);

    try {
      const reply = await apiFetch("/assistant/messages", {
        method: "POST",
        body: JSON.stringify({ content: text }),
      });
      setMessages((prev) => [...prev, reply]);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Try again.");
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setSending(false);
    }
  }

  async function handleReset() {
    setError("");
    try {
      await apiFetch("/assistant/messages", { method: "DELETE" });
      setMessages([]);
    } catch (e: any) {
      setError(e.message || "Failed to reset chat.");
    }
  }

  function handleCopy(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  function handleReact(id: string, type: "up" | "down") {
    setReactions((prev) => ({
      ...prev,
      [id]: prev[id] === type ? undefined! : type,
    }));
  }

  function toggleVoice() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input isn't supported in this browser.");
      return;
    }
    if (listening) {
      recognitionRef.current.userStopped = true;
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscript = "";

    recognition.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interim += transcript;
        }
      }
      setInput(finalTranscript + interim);
    };

    recognition.onend = () => {
      if (recognitionRef.current?.userStopped) return;
      recognition.start();
    };

    recognitionRef.current = recognition;
    recognitionRef.current.userStopped = false;
    recognition.start();
    setListening(true);
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary">
            <Sparkles size={19} className="text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary border-2 border-background" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text leading-tight">
              Career Assistant
            </h1>
            <p className="text-sm text-text-muted">
              Ask anything about your career, resume, or skills
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-primary transition-colors"
          >
            <RotateCcw size={13} />
            Reset chat
          </button>
        )}
      </div>

      <p className="mx-auto w-fit flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-center">
        <CandidLogo size={12} />
        AI-generated guidance — not a guarantee of interview or job outcomes.
      </p>

      {error && <p className="text-sm text-danger text-center">{error}</p>}

      {messages.length === 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Suggested Questions
          </p>
          <div className="flex flex-col gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSend(q)}
                className="text-left text-sm text-text bg-surface border border-border rounded-lg px-4 py-3 hover:border-primary hover:text-primary transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 pb-20">
        {messages.length === 0 && (
          <div className="flex items-start gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary mt-0.5">
              <Sparkles size={13} className="text-white" />
            </div>
            <div className="bg-surface border border-border rounded-lg rounded-tl-sm px-4 py-3 text-sm text-text max-w-[85%] leading-relaxed">
              Hi — I'm your career assistant. Ask me about resumes, skill gaps,
              project ideas, or how recruiters actually read your profile. Pick
              a question above or type your own below.
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-0.5 ${
                m.role === "assistant"
                  ? "bg-primary"
                  : "bg-background border border-border"
              }`}
            >
              {m.role === "assistant" ? (
                <Sparkles size={13} className="text-white" />
              ) : (
                <User size={13} className="text-text-muted" />
              )}
            </div>
            <div
              className={`flex flex-col gap-1 max-w-[85%] ${
                m.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`rounded-lg px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-white rounded-tr-sm"
                    : "bg-surface border border-border text-text rounded-tl-sm"
                }`}
              >
                {m.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  m.content
                )}
              </div>
              {m.created_at && (
                <span className="text-[10px] text-text-muted px-1">
                  {new Date(m.created_at).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              )}

              {m.role === "assistant" && (
                <div className="flex items-center gap-1 px-1 mt-0.5">
                  <button
                    type="button"
                    onClick={() => handleCopy(m.id, m.content)}
                    className="p-1 rounded text-text-muted hover:text-primary hover:bg-background transition-colors"
                    aria-label="Copy"
                  >
                    {copiedId === m.id ? (
                      <Check size={12} />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReact(m.id, "up")}
                    className={`p-1 rounded transition-colors ${reactions[m.id] === "up" ? "text-primary" : "text-text-muted hover:text-primary hover:bg-background"}`}
                    aria-label="Good response"
                  >
                    <ThumbsUp size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReact(m.id, "down")}
                    className={`p-1 rounded transition-colors ${reactions[m.id] === "down" ? "text-danger" : "text-text-muted hover:text-danger hover:bg-background"}`}
                    aria-label="Bad response"
                  >
                    <ThumbsDown size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
              <Sparkles size={13} className="text-white" />
            </div>
            <div className="flex items-center gap-1.5 px-4 py-3 rounded-lg bg-surface border border-border">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-text-muted animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={scrollRef} className="h-24" />
      </div>

      <div className="sticky bottom-4 mt-2">
        <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2 shadow-card">
          <button
            type="button"
            onClick={toggleVoice}
            aria-label={listening ? "Stop voice input" : "Start voice input"}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
              listening
                ? "bg-danger/10 text-danger"
                : "text-text-muted hover:text-primary hover:bg-background"
            }`}
          >
            {listening ? <Square size={15} /> : <Mic size={17} />}
          </button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              listening ? "Listening..." : "Ask anything about your career..."
            }
            disabled={sending}
            rows={1}
            style={{ maxHeight: "160px" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 160) + "px";
            }}
            className="flex-1 text-sm bg-transparent focus:outline-none disabled:opacity-60 resize-none py-1.5"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={sending || !input.trim()}
            aria-label="Send"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
