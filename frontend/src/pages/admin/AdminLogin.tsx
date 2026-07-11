import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, Loader2, Shield } from 'lucide-react';
import axios from 'axios';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/api/admin/login', { password });
      if (response.data.success) {
        localStorage.setItem('bhejdo_admin_token', response.data.data.token);
        navigate('/admin');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen warm-canvas flex items-center justify-center px-4 relative overflow-hidden">
      <div className="warm-blob" style={{ width: 320, height: 320, top: -40, right: -40, background: '#F7C9A3' }} />
      <div className="warm-blob" style={{ width: 280, height: 280, bottom: -40, left: -40, background: '#DDD0FA' }} />

      <div className="relative w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="icon-tile icon-tile-terra inline-flex items-center justify-center w-16 h-16 mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">BhejDo Admin Portal</h1>
          <p className="text-slate-500 text-sm mt-1">Restricted access. Authorized personnel only.</p>
        </div>

        {/* Login Card */}
        <div className="soft-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                  autoFocus
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="btn-terra w-full py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Access Admin Portal
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 text-xs mt-6">
          BhejDo Platform Administration v1.0
        </p>
      </div>
    </div>
  );
}
