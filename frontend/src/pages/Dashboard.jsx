import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import DocumentCard from '../components/DocumentCard';
import UploadModal from '../components/UploadModal';
import { Plus, LogOut, FileText} from 'lucide-react';
import { toast } from 'sonner';
import Skeleton from '../components/Skeleton';


function DocumentCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-3">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-5 w-20 rounded-full" />
    </div>
  );
}

function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const pollRef = useRef(null);

  const fetchDocuments = async () => {
    try {
      const res = await client.get('/documents/');
      setDocuments(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // poll every 3s while any doc is still processing
  useEffect(() => {
    const hasProcessing = documents.some((d) => d.status === 'processing');
    if (hasProcessing) {
      pollRef.current = setInterval(fetchDocuments, 3000);
    }
    return () => clearInterval(pollRef.current);
  }, [documents]);

  const handleLogout = async () => {
    try {
      await client.post('/auth/logout/', { refresh: localStorage.getItem('refresh_token') });
    } catch {
    }
    localStorage.clear();
    navigate('/login');
  };

  const handleUploaded = (newDoc) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleDeleted = (id) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="min-h-screen bg-bg">
        <header className="border-b border-slate-200 bg-white px-4 py-3.5 flex justify-between items-center">
            <div className="flex items-center gap-2">
            <img src="/knovault-icon.jpeg" alt="" className="w-7 h-7 rounded-lg" />
            <h1 className="text-lg font-bold text-slate-900">KnoVault</h1>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
            <LogOut size={16} />
            Log out
            </button>
        </header>

            <main className="max-w-3xl mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-5">
                <h2 className="text-base font-semibold text-slate-900">Your Documents</h2>
                <button
                    onClick={() => setShowUpload(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium transition-colors"
                >
                    <Plus size={16} />
                    Upload PDF
                </button>
                </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => <DocumentCardSkeleton key={i} />)}
                </div>
                ) : documents.length === 0 ? (
            <div className="flex flex-col items-center text-center py-20 px-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
                <FileText size={28} className="text-brand-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">No documents yet</h3>
            <p className="text-sm text-slate-500 mb-5 max-w-xs">
                Upload a PDF and start asking questions
            </p>
            </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} onDeleted={handleDeleted} />
            ))}
          </div>
        )}
      </main>

      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} onUploaded={handleUploaded} />
      )}
    </div>
  );
}

export default Dashboard;