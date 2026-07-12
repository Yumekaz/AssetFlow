import React, { useState } from 'react';
import axios from 'axios';
import { Box, Lock, Mail, ArrowRight, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@assetflow.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', { email, password });
      if (response.data && response.data.token) {
        login(response.data.token, response.data.user);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials or server offline.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#050505] p-6 relative overflow-hidden transition-colors duration-700">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-brand-600 dark:bg-gradient-brand shadow-[0_10px_40px_rgba(99,102,241,0.5)] mb-6 animate-in zoom-in duration-500">
            <Box size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">AssetFlow</h1>
          <p className="text-slate-500 dark:text-white/50 text-lg">Intelligent Resource Telemetry</p>
        </div>

        <div className="glass-panel p-8 sm:p-10 rounded-3xl animate-in slide-in-from-bottom-12 fade-in duration-700 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleLogin} className="space-y-6">
            
            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl flex items-start gap-3 animate-in shake">
                <Activity className="text-rose-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm font-medium text-rose-700 dark:text-rose-300">{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-white/60 uppercase tracking-wider pl-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 group-focus-within:text-brand-500 transition-colors" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-[#111] border border-transparent dark:border-white/5 focus:border-brand-500 dark:focus:border-brand-500 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 outline-none focus:ring-2 focus:ring-brand-500/20 transition-all shadow-inner"
                  placeholder="admin@assetflow.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-white/60 uppercase tracking-wider pl-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 group-focus-within:text-brand-500 transition-colors" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-[#111] border border-transparent dark:border-white/5 focus:border-brand-500 dark:focus:border-brand-500 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 outline-none focus:ring-2 focus:ring-brand-500/20 transition-all shadow-inner"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden rounded-2xl p-0.5 bg-gradient-to-r from-brand-500 to-accent-500 focus:outline-none focus:ring-4 focus:ring-brand-500/30 transition-all disabled:opacity-70"
            >
              <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors"></div>
              <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-accent-600 px-6 py-3.5 rounded-[14px] text-white font-bold text-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                {loading ? 'Authenticating...' : 'Sign In'}
                {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
              </div>
            </button>
            
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 dark:text-white/40">
              Demo Credentials: <br/>
              <span className="font-mono text-xs bg-slate-200 dark:bg-white/10 px-2 py-1 rounded mt-1 inline-block">admin@assetflow.com / password123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
