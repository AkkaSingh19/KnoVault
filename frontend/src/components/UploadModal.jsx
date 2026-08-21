import { useState, useRef } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';
import client from '../api/client';
import { toast } from 'sonner';

function UploadModal({ onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === 'application/pdf') setFile(dropped);
  };

   const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await client.post('/documents/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUploaded(response.data);
      toast.success('Uploading your document');
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || 'Upload failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center px-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Upload PDF</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
          />

          {file ? (
            <div className="flex flex-col items-center gap-2">
              <FileText size={28} className="text-brand-600" />
              <p className="text-sm font-medium text-slate-900 truncate max-w-full">{file.name}</p>
              <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <UploadCloud size={28} className="text-slate-400" />
              <p className="text-sm text-slate-600">
                <span className="text-brand-600 font-medium">Click to browse</span> or drag a PDF here
              </p>
              <p className="text-xs text-slate-400">Max 100 pages</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            disabled={uploading}
            className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-medium disabled:opacity-50 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium disabled:opacity-50 transition-colors"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadModal;