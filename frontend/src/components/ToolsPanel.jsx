import { useState, useEffect, useRef } from 'react';
import client from '../api/client';
import { FileText, Tags, BookOpen } from 'lucide-react';
import Skeleton from './Skeleton';

const TABS = [
  { key: 'summary', label: 'Summary', icon: FileText },
  { key: 'keywords', label: 'Keywords', icon: Tags },
  { key: 'study_notes', label: 'Study Notes', icon: BookOpen },
];

function ContentSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/6" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}


function ToolsPanel({ docId }) {
  const [activeTab, setActiveTab] = useState('summary');
  const [cache, setCache] = useState({});
  const [loadingTab, setLoadingTab] = useState(null);
  const [errors, setErrors] = useState({});
  const scrollRef = useRef(null);

  const loadTab = async (kind) => {
    if (cache[kind]) return;

    setLoadingTab(kind);
    setErrors((prev) => ({ ...prev, [kind]: null }));

    try {
      const res = await client.post(`/documents/${docId}/tools/${kind}/`);
      setCache((prev) => ({ ...prev, [kind]: res.data }));
    } catch (err) {
      const status = err.response?.status;
      let message = 'Failed to generate content.';
      if (status === 429) {
        message = "Daily AI usage limit reached. Please try again tomorrow.";
      } else if (status === 503) {
        message = 'AI service is temporarily unavailable. Please try again in a moment.';
      } else if (status === 502) {
        message = 'The AI returned an unexpected response. Please try again.';
      }
      setErrors((prev) => ({ ...prev, [kind]: { message, retryable: status !== 429 } }));
    } finally {
      setLoadingTab(null);
    }
  };

  useEffect(() => {
    loadTab('summary');
  }, [docId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [activeTab]);

  const handleTabClick = (kind) => {
    setActiveTab(kind);
    loadTab(kind);
  };

  const content = cache[activeTab];
  const isLoading = loadingTab === activeTab;
  const error = errors[activeTab];

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-slate-200 bg-white">
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <TabIcon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {isLoading && <ContentSkeleton />}

        {!isLoading && error && (
          <div className="text-sm space-y-2">
            <p className="text-red-500">{error.message}</p>
            {error.retryable && (
              <button onClick={() => loadTab(activeTab)} className="text-gray-500 underline">
                Click to regenerate
              </button>
            )}
          </div>
        )}

        {!isLoading && !error && !content && (
          <button onClick={() => loadTab(activeTab)} className="text-sm text-gray-500 underline">
            Click to generate
          </button>
        )}

        {activeTab === 'summary' && content && (
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-1">Overview</h3>
              <p className="text-gray-700">{content.overview}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Key Points</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {content.key_points?.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Conclusion</h3>
              <p className="text-gray-700">{content.conclusion}</p>
            </div>
          </div>
        )}

        {activeTab === 'keywords' && content && (
          <div className="space-y-3 text-sm">
            {content.keywords?.map((kw, i) => (
              <div key={i}>
                <span className="font-semibold">{kw.term}</span>
                <p className="text-gray-700">{kw.definition}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'study_notes' && content && (
          <div className="space-y-4 text-sm">
            {content.sections?.map((section, i) => (
              <div key={i}>
                <h3 className="font-semibold mb-1">{section.heading}</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {section.points?.map((point, j) => (
                    <li key={j}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ToolsPanel;