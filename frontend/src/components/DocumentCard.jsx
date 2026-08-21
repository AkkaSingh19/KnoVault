import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import client from '../api/client';
import ConfirmModal from './ConfirmModal';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  processing: { icon: Clock, style: 'bg-amber-50 text-amber-700', label: 'Processing' },
  ready: { icon: CheckCircle2, style: 'bg-emerald-50 text-emerald-700', label: 'Ready' },
  failed: { icon: XCircle, style: 'bg-red-50 text-red-700', label: 'Failed' },
};

function DocumentCard({ doc, onDeleted }) {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const status = STATUS_CONFIG[doc.status];
  const StatusIcon = status.icon;

   const handleDelete = async () => {
    setDeleting(true);
    try {
      await client.delete(`/documents/${doc.id}/delete/`);
      onDeleted(doc.id);
      toast.success('Document deleted');
    } catch {
      toast.error('Failed to delete document.');
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <div
        onClick={() => doc.status === 'ready' && navigate(`/documents/${doc.id}`)}
        className={`group relative bg-white border border-slate-200 rounded-2xl p-5 transition-all ${
        doc.status === 'ready' ? 'cursor-pointer hover:border-brand-300 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5' : ''
        }`}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
            <FileText size={20} className="text-brand-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900 truncate">{doc.original_filename}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {doc.status === 'ready' && `${doc.page_count} pages · ${doc.chunk_count} chunks`}
              {doc.status === 'processing' && 'Extracting and indexing...'}
              {doc.status === 'failed' && (doc.failure_reason || 'Processing failed')}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.style}`}>
            <StatusIcon size={12} />
            {status.label}
          </span>

            <button
                onClick={(e) => {
                e.stopPropagation();
                setShowConfirm(true);
                }}
                className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                aria-label="Delete document"
            >
                <Trash2 size={16} />
            </button>
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          title="Delete document?"
          message={`"${doc.original_filename}" and its chat history will be permanently removed. This can't be undone.`}
          confirmLabel={deleting ? 'Deleting...' : 'Delete'}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}

export default DocumentCard;