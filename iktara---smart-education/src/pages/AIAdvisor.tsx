/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, GraduationCap, Compass, SendHorizontal, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';

interface Msg {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

// Custom Markdown parsing list & bold helper
function FormattedMessage({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-2">
      {lines.map((line, idx) => {
        const cleanLine = line.trim();

        // Is it a header?
        if (cleanLine.startsWith('###')) {
          return (
            <h4 key={idx} className="font-bold text-slate-100 text-xs mt-3 pt-1.5 border-b border-slate-800 pb-0.5">
              {parseBoldText(cleanLine.replace(/^###\s*/, ''))}
            </h4>
          );
        }
        if (cleanLine.startsWith('##')) {
          return (
            <h3 key={idx} className="font-bold text-indigo-400 text-sm mt-3 pt-1">
              {parseBoldText(cleanLine.replace(/^##\s*/, ''))}
            </h3>
          );
        }

        // Is it a list item?
        const isBullet = cleanLine.startsWith('- ') || cleanLine.startsWith('* ');
        if (isBullet) {
          const block = cleanLine.replace(/^[-*]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-1.5 mt-1.5">
              <span className="text-indigo-400 mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span className="text-slate-200 text-xs leading-relaxed">{parseBoldText(block)}</span>
            </div>
          );
        }

        // Paragraph line
        if (!cleanLine) {
          return <div key={idx} className="h-1" />;
        }

        return (
          <p key={idx} className="text-slate-200 leading-relaxed text-xs">
            {parseBoldText(line)}
          </p>
        );
      })}
    </div>
  );
}

// Bold markdown splitter
function parseBoldText(input: string) {
  const parts = input.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-indigo-400">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function AIAdvisor() {
  const initialWelcomeMsg: Msg = {
    id: "welc",
    sender: "ai",
    text: "Hello! I am your virtual ML Academic Counselor. I've analyzed your cohort's performance indicators, attendance averages, and active classifiers.\n\nAsk me how to design custom study blocks, interpret feature importances, or remediate a high-risk candidate profile."
  };

  const [messages, setMessages] = useState<Msg[]>([initialWelcomeMsg]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [cohortSummary, setCohortSummary] = useState<any>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  const fetchCohortSummary = async () => {
    try {
      const res = await fetch('/api/dataset-summary');
      if (res.ok) {
        const d = await res.json();
        setCohortSummary(d);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchCohortSummary();
  }, []);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    if (!textToSend) {
      setInputText('');
    }

    const newUsrMsg: Msg = {
      id: `m-usr-${Date.now()}`,
      sender: 'user',
      text
    };

    setMessages(prev => [...prev, newUsrMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: cohortSummary ? {
            schoolCohortSize: cohortSummary.rowCount,
            benchmarks: cohortSummary.stats,
            description: "Advising cohort parameters"
          } : undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Consultation API failed.");

      const newAiMsg: Msg = {
        id: `m-ai-${Date.now()}`,
        sender: 'ai',
        text: data.response
      };

      setMessages(prev => [...prev, newAiMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `m-err-${Date.now()}`,
          sender: 'ai',
          text: `Counsellor connection lag: ${err.message}. Verify process.env.GEMINI_API_KEY value is loaded.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([initialWelcomeMsg]);
  };

  const chips = [
    "What factors impact student failure the most?",
    "Suggest a standard study schedule for a candidate with <75% attendance.",
    "Explain how Random Forest feature importance is calculated here.",
    "How should counselors utilize risk levels (Critical vs Medium) in a class?"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-5xl mx-auto space-y-4 animate-fade-in relative">
      {/* 1. Header Information Panel */}
      <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 shadow-lg">
        <div>
          <h2 className="text-sm font-bold text-white font-display flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4 text-indigo-400" />
            AI Academic Diagnostic Guidance Assistant
          </h2>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Live feedback grounded on current {cohortSummary?.rowCount || 0} student cohort variables.
          </p>
        </div>
        
        <div className="flex items-center gap-2.5">
          {cohortSummary && (
            <div className="text-[10px] bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg text-slate-300 font-medium">
              Attendance Avg: <span className="font-bold font-mono text-indigo-400">{cohortSummary?.stats?.attendance?.mean || 0}%</span>
            </div>
          )}
          <button
            onClick={handleClearHistory}
            className="p-1 px-2.5 border border-slate-700 hover:border-red-550/30 text-[10px] text-slate-400 hover:text-red-400 font-semibold bg-slate-900/40 hover:bg-red-500/10 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
            title="Reset conversation dialogue"
          >
            <Trash2 className="h-3 w-3" />
            Reset Chat
          </button>
        </div>
      </div>

      {/* 2. Messages Thread Window */}
      <div className="flex-1 overflow-y-auto bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 space-y-4 shadow-xl">
        {messages.map((m) => {
          const isAi = m.sender === 'ai';
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              <div className={`p-2.5 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center border ${
                isAi
                  ? 'bg-emerald-500/10 border-emerald-550/20 text-emerald-400'
                  : 'bg-indigo-500/10 border-indigo-550/20 text-indigo-400'
              }`}>
                {isAi ? <GraduationCap className="h-5 w-5" /> : <Compass className="h-5 w-5" />}
              </div>

              <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                isAi
                  ? 'bg-slate-900 border border-slate-700/60 text-slate-200 shadow-sm'
                  : 'bg-indigo-600 font-medium text-white shadow-md shadow-indigo-600/10'
              }`}>
                {isAi ? (
                  <FormattedMessage text={m.text} />
                ) : (
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{m.text}</p>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-550/20 text-emerald-400 h-10 w-10 flex items-center justify-center animate-spin">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/60 text-slate-400 text-xs italic">
              AI Counselor is synthesizing educational models recommendations...
            </div>
          </div>
        )}

        <div ref={threadEndRef} />
      </div>

      {/* 3. Helper suggestions chips (hide while loading) */}
      {!loading && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none shrink-0 px-2">
          {chips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="bg-slate-800/55 hover:bg-slate-700/40 border border-slate-700 hover:border-indigo-500/30 text-slate-400 hover:text-slate-200 text-[10px] font-semibold tracking-tight px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-all"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* 4. Input layout */}
      <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-4 shrink-0 shadow-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            disabled={loading}
            placeholder={loading ? "Generating advisors blueprint..." : "Ask your ML academic counselor..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-550/30 transition-all text-xs disabled:opacity-50"
            id="chat-input-field"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="p-3 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl shadow-lg shadow-indigo-600/10 transition-all cursor-pointer disabled:opacity-50 disabled:bg-slate-700 disabled:shadow-none"
            id="chat-send-btn"
          >
            <SendHorizontal className="h-4 w-4 shrink-0" />
          </button>
        </form>
      </div>
    </div>
  );
}
