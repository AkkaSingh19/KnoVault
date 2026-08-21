import { useState, useEffect, useRef } from 'react';
import client from '../api/client';
import Skeleton from './Skeleton';
import { MessageCircle } from 'lucide-react';

function MessageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-2/3 rounded-2xl" />
      <Skeleton className="h-14 w-3/4 ml-auto rounded-2xl" />
      <Skeleton className="h-10 w-1/2 rounded-2xl" />
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1 px-4 py-3 bg-gray-100 rounded-xl w-fit">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
    </div>
  );
}

function ChatPanel({ docId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await client.get(`/documents/${docId}/messages/`);
        setMessages(res.data);
      } catch {
      } finally {
        setLoadingHistory(false);
      }
    };
    loadHistory();
  }, [docId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = async (e) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || sending) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: question, source_pages: [] }]);
    setSending(true);

    try {
      const res = await client.post(`/documents/${docId}/chat/`, { question });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data.answer, source_pages: res.data.source_pages },
      ]);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Something went wrong. Please try again.';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: errMsg, source_pages: [], isError: true },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingHistory && <MessageSkeleton />}

        {!loadingHistory && messages.length === 0 && !sending && (
        <div className="flex flex-col items-center text-center mt-12 px-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-3">
            <MessageCircle size={20} className="text-brand-600" />
            </div>
            <p className="text-sm text-slate-500 max-w-xs">
           What would you like to know? Explore your document with AI.
            </p>
        </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`animate-fade-in-up max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
            m.role === 'user'
                ? 'bg-brand-600 text-white ml-auto'
                : m.isError
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-white text-slate-800 border border-slate-200'
            }`}
          >
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}

        {sending && <TypingDots />}

        <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="border-t border-slate-200 p-3 flex gap-2 bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this document..."
          disabled={sending}
          className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
        >
          {sending ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default ChatPanel;