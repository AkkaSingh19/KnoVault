import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, XCircle } from 'lucide-react';
import client from '../api/client';
import ToolsPanel from '../components/ToolsPanel';
import ChatPanel from '../components/ChatPanel';

const STATUS_CONFIG = {
  processing: { icon: Clock, style: 'bg-amber-50 text-amber-700', label: 'Processing' },
  ready: { icon: CheckCircle2, style: 'bg-emerald-50 text-emerald-700', label: 'Ready' },
  failed: { icon: XCircle, style: 'bg-red-50 text-red-700', label: 'Failed' },
};

function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [mobileTab, setMobileTab] = useState('tools');

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await client.get(`/documents/${id}/`);
        setDoc(res.data);
      } catch {
        navigate('/not-found');
      }
    };
    fetchDoc();
  }, [id, navigate]);

  if (!doc) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>;
  }

  const status = STATUS_CONFIG[doc.status];
  const StatusIcon = status.icon;

  return (
    <div className="h-screen flex flex-col bg-bg">
      <header className="border-b border-slate-200 bg-white px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-slate-900 p-1 -ml-1 rounded-lg hover:bg-slate-50">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 truncate">{doc.original_filename}</p>
          <p className="text-xs text-slate-500">{doc.page_count} pages · {doc.chunk_count} chunks</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${status.style}`}>
          <StatusIcon size={12} />
          {status.label}
        </span>
      </header>

      <div className="flex border-b border-slate-200 md:hidden">
        <button
          onClick={() => setMobileTab('tools')}
          className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            mobileTab === 'tools' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500'
          }`}
        >
          Tools
        </button>
        <button
          onClick={() => setMobileTab('chat')}
          className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            mobileTab === 'chat' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500'
          }`}
        >
          Chat
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className={`${mobileTab === 'tools' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-2/5 border-r border-slate-200 overflow-hidden bg-slate-50/50`}>
          <ToolsPanel docId={id} />
        </div>
        <div className={`${mobileTab === 'chat' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-3/5 overflow-hidden`}>
          <ChatPanel docId={id} />
        </div>
      </div>
    </div>
  );
}

export default DocumentDetail;