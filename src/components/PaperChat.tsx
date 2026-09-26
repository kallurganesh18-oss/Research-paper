import React, { useState } from 'react';
import { Send, MessageSquare, Bot, User, Loader2, Sparkles, HelpCircle } from 'lucide-react';

interface PaperChatProps {
  paperTitle: string;
  paperContext: any;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const PaperChat: React.FC<PaperChatProps> = ({ paperTitle, paperContext }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `I've analyzed "${paperTitle}". You can ask me anything about the model layers, mathematical breakthroughs, or how to implement the 3rd-year CS extensions for your resume!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    'How do the skip connections preserve gradient flow?',
    'What hardware is needed to train the student extension?',
    'How should I describe this in a FAANG internship interview?',
    'What is the computational complexity vs RNNs/CNNs?',
  ];

  const handleSend = async (questionToSend?: string) => {
    const q = questionToSend || input;
    if (!q.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: q };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          paperContext,
          history: messages,
        }),
      });

      if (!res.ok) throw new Error('Failed to get answer');
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${err.message || 'Could not connect to research agent.'}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[540px]">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Architecture Inspector & CS Student Q&A
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded">
          gemini-3.8-flash
        </span>
      </div>

      {/* Suggested prompts */}
      <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto text-[11px]">
        <span className="text-slate-500 flex items-center space-x-1 shrink-0">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Quick Ask:</span>
        </span>
        {suggestedQuestions.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSend(sq)}
            className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700/60 shrink-0 transition-colors"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-2.5 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5 text-blue-400">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl px-4 py-2.5 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap'
              }`}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-2.5 text-slate-400 text-xs">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <span className="font-mono text-slate-400">Research agent is reasoning...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about ${paperTitle.slice(0, 30)}...`}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask</span>
        </button>
      </form>
    </div>
  );
};
