import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import client from '../api/client';

function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await client.post('/auth/signup/', { username, email, password });
      const loginRes = await client.post('/auth/login/', { email, password });
      localStorage.setItem('access_token', loginRes.data.access);
      localStorage.setItem('refresh_token', loginRes.data.refresh);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.username?.[0]
        || err.response?.data?.email?.[0]
        || err.response?.data?.password?.[0]
        || 'Signup failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <img src="/knovault-icon.jpeg" alt="" className="w-10 h-10 rounded-xl mb-3" />
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="text-sm text-slate-500 mt-1">Start chatting with your documents</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="yourname"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="At least 6 characters"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-xl font-medium disabled:opacity-50 transition-colors"
          >
            <UserPlus size={16} />
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>

          <p className="text-sm text-center text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-medium hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;