import React, { useState, useEffect } from 'react';
import { Bot, Send, User, ShieldCheck, Upload } from 'lucide-react';
import { askCopilot, fetchOrders } from '../services/api';
import { UploadDataModal } from '../components/forms/UploadDataModal';

interface Message {
  sender: 'user' | 'copilot';
  text: string;
  engine?: string;
}

const suggestedQuestions = [
  "Why are today's deliveries at risk?",
  "What is the biggest delivery problem today?",
  "Which vehicle should handle order O1001?",
  "Which customers are difficult to deliver to?",
  "What should we change to improve today's success rate?",
];

export const CopilotPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    checkData();
  }, []);

  async function checkData() {
    const orders = await fetchOrders().catch(() => []);
    const dataPresent = orders.length > 0;
    setHasData(dataPresent);

    setMessages([
      {
        sender: 'copilot',
        text: dataPresent
          ? "Hello! I am LOGIX Copilot, your data-grounded AI Delivery Success assistant. I query your live uploaded logistics records to explain failure risks, evaluate vehicle assignments, and recommend risk-prevention actions. How can I help you today?"
          : "Hello! I am LOGIX Copilot. Please upload logistics data (CSV or Excel) before asking for delivery analysis.",
        engine: 'LOGIX Firestore Grounded Engine',
      },
    ]);
  }

  async function handleSend(queryText?: string) {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    if (!hasData) {
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: textToSend },
        { sender: 'copilot', text: 'Please upload logistics data before asking for delivery analysis.' },
      ]);
      if (!queryText) setInput('');
      return;
    }

    const userMsg: Message = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await askCopilot(textToSend);
      const botMsg: Message = {
        sender: 'copilot',
        text: res.answer,
        engine: res.engine || 'Grounded Engine',
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { sender: 'copilot', text: 'Error connecting to LOGIX Copilot backend.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 flex flex-col h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-600 text-white rounded-lg">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">LOGIX Copilot</h1>
            <p className="text-xs text-slate-500">
              Grounded AI assistant answering directly from your uploaded logistics records.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!hasData && (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Data
            </button>
          )}
          <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            Data-Grounded • No Hallucinations
          </span>
        </div>
      </div>

      {/* Suggested Chips */}
      <div className="shrink-0 flex flex-wrap gap-2">
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="text-xs font-semibold px-3 py-1.5 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 rounded-full cursor-pointer transition-all shadow-2xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat History Panel */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 p-5 overflow-y-auto space-y-4 shadow-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`p-2 rounded-lg shrink-0 ${
                m.sender === 'user' ? 'bg-slate-900 text-white' : 'bg-indigo-600 text-white'
              }`}
            >
              {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-2xl rounded-xl p-4 text-xs space-y-1.5 leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-line font-medium">{m.text}</div>
              {m.engine && (
                <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-200/50">
                  Engine: {m.engine}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 italic">
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            LOGIX AI is querying uploaded logistics records...
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="shrink-0 flex items-center gap-2 bg-white p-2 border border-slate-200 rounded-xl shadow-xs"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Copilot about uploaded delivery risks, vehicle choices, or customer behavior..."
          className="flex-1 px-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          Send
        </button>
      </form>

      <UploadDataModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={checkData}
      />
    </div>
  );
};
