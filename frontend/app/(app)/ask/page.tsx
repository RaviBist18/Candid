"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
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

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  timestamp: number;
};

const SUGGESTED_QUESTIONS = [
  "How do I know if my resume is ATS-friendly?",
  "What projects actually impress recruiters?",
  "How should I prioritize which skills to learn first?",
  "What makes a GitHub profile look strong to hiring managers?",
  "How long should I spend on a portfolio project?",
];

// naive keyword -> follow-up map, good enough until real AI layer is wired
const FOLLOWUP_MAP: { keywords: string[]; question: string }[] = [
  {
    keywords: ["ats", "resume"],
    question: "What's the #1 ATS mistake people make?",
  },
  {
    keywords: ["project", "portfolio"],
    question: "Should I remove old weak projects?",
  },
  {
    keywords: ["skill", "learn"],
    question: "How do I show a new skill without a job using it yet?",
  },
  {
    keywords: ["github", "profile"],
    question: "Does commit frequency actually matter?",
  },
  {
    keywords: ["interview"],
    question: "How do I explain a project I built with AI help?",
  },
];

function pickFollowup(lastUserText: string): string {
  const lower = lastUserText.toLowerCase();
  const match = FOLLOWUP_MAP.find((f) =>
    f.keywords.some((k) => lower.includes(k)),
  );
  return match ? match.question : "What should I focus on this week?";
}

// mock reply generator — swap for real API call once backend AI layer ships
function mockReply(question: string): string {
  return `Good question. Based on general hiring patterns: ${question
    .replace(/\?$/, "")
    .toLowerCase()} comes down to showing evidence, not claims — recruiters skim in seconds, so what's provable (a repo, a metric, a live link) beats a bullet point every time. This is a mock response; real answers will pull from current market signal once the AI layer is connected.`;
}

export default function AskQuestionPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [followup, setFollowup] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, "up" | "down">>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, followup]);

  function streamAssistantReply(fullText: string) {
    const id = `a-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id,
        role: "assistant",
        content: "",
        isStreaming: true,
        timestamp: Date.now(),
      },
    ]);
    const words = fullText.split(" ");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, content: words.slice(0, i).join(" ") } : m,
        ),
      );
      if (i >= words.length) {
        clearInterval(interval);
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, isStreaming: false } : m)),
        );
        setSending(false);
      }
    }, 35);
  }

  function handleSend(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || sending) return;
    if (listening) {
      recognitionRef.current.userStopped = true;
      recognitionRef.current?.stop();
      setListening(false);
    }
    setInput("");
    setFollowup(null);
    setMessages((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: Date.now(),
      },
    ]);
    setSending(true);
    setTimeout(() => {
      streamAssistantReply(mockReply(text));
      setFollowup(pickFollowup(text));
    }, 500);
  }

  function handleReset() {
    setMessages([]);
    setInput("");
    setFollowup(null);
    setSending(false);
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
      // browser cut the session (e.g. long silence) but user hasn't clicked stop — restart it
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
                {m.content}
                {m.isStreaming && (
                  <span className="inline-block w-1.5 h-4 ml-0.5 bg-current opacity-60 animate-pulse align-middle" />
                )}
              </div>
              <span className="text-[10px] text-text-muted px-1">
                {new Date(m.timestamp).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>

              {m.role === "assistant" && !m.isStreaming && (
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
        {sending && !messages.some((m) => m.isStreaming) && (
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

        {followup && !sending && (
          <div className="pl-[38px]">
            <button
              type="button"
              onClick={() => handleSend(followup)}
              className="group flex items-center gap-2 text-left text-xs font-medium text-primary bg-primary/5 border border-dashed border-primary/40 rounded-full px-3.5 py-2 hover:bg-primary/10 hover:border-primary transition-colors"
            >
              <span>{followup}</span>
              <span className="ml-0.5 opacity-60 group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </button>
          </div>
        )}

        <div ref={scrollRef} />
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
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              listening ? "Listening..." : "Ask anything about your career..."
            }
            disabled={sending}
            className="flex-1 text-sm bg-transparent focus:outline-none disabled:opacity-60"
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
