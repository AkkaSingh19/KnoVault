import { Link } from 'react-router-dom';
import { FileText, ShieldCheck, Sparkles } from 'lucide-react';

const FEATURES = [
  { icon: FileText, title: 'Upload any PDF', desc: 'Drop in a document and get instant, structured understanding — no setup required.' },
  { icon: ShieldCheck, title: 'Grounded answers', desc: 'Every response is generated strictly from your document and cites the exact page it came from.' },
  { icon: Sparkles, title: 'Summaries & study notes', desc: 'Get an instant overview, key terms, and exam-ready notes — generated once, cached forever.' },
];

function Landing() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="px-4 py-4 flex justify-between items-center max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <img src="/knovault-icon.jpeg" alt="" className="w-7 h-7 rounded-lg" />
          <span className="text-lg font-bold text-slate-900">KnoVault</span>
        </div>
        <div className="flex gap-2">
          <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900">
            Log In
          </Link>
          <Link to="/signup" className="px-4 py-2 text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-colors">
            Sign Up
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-16 pb-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight text-slate-900">
          Chat with your PDFs.
          <br />
          <span className="text-brand-600">Every answer, grounded.</span>
        </h1>
        <p className="text-slate-600 text-lg mb-8 max-w-xl mx-auto">
          Upload any document and get accurate, page-cited answers — powered by real retrieval, not guesswork.
        </p>
        <Link
          to="/signup"
          className="inline-block px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium transition-colors"
        >
          Get Started — Free
        </Link>
      </main>

      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left">
                <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center mb-3">
                  <Icon size={18} className="text-brand-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-slate-600">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Landing;