import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Lock, Mail, User, ArrowRight, Activity, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

interface Department {
  id: string;
  name: string;
}

export const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get('/api/departments');
        if (Array.isArray(res.data)) {
          setDepartments(res.data);
        }
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };
    fetchDepartments();
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await axios.post('/api/auth/signup', {
        name,
        email,
        password,
        departmentId: departmentId || undefined,
        // The server will explicitly override/ignore 'role' if passed, securing it to 'Employee'
      });
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#050505] p-6 relative overflow-hidden transition-colors duration-700">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-brand-600 dark:bg-gradient-brand shadow-[0_10px_40px_rgba(99,102,241,0.5)] mb-4 animate-in zoom-in duration-500">
            <Box size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">Join AssetFlow</h1>
          <p className="text-slate-500 dark:text-white/50">Register as a new Employee</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-12 duration-500">
          <form onSubmit={handleSignup} className="space-y-4">
            
            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl flex items-start gap-3">
                <Activity className="text-rose-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm font-medium text-rose-700 dark:text-rose-300">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1.5 animate-ping"></div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{success}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-white/60 uppercase tracking-wider pl-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 group-focus-within:text-brand-500 transition-colors" size={20} />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-[#111] border border-transparent dark:border-white/5 focus:border-brand-500 dark:focus:border-brand-500 rounded-2xl py-3 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 outline-none transition-all shadow-inner"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-white/60 uppercase tracking-wider pl-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 group-focus-within:text-brand-500 transition-colors" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-[#111] border border-transparent dark:border-white/5 focus:border-brand-500 dark:focus:border-brand-500 rounded-2xl py-3 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 outline-none transition-all shadow-inner"
                  placeholder="john.doe@company.com"
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
                  className="w-full bg-slate-100 dark:bg-[#111] border border-transparent dark:border-white/5 focus:border-brand-500 dark:focus:border-brand-500 rounded-2xl py-3 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 outline-none transition-all shadow-inner"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-white/60 uppercase tracking-wider pl-1">Department (Optional)</label>
              <select
                value={departmentId}
                onChange={e => setDepartmentId(e.target.value)}
                className="w-full bg-slate-100 dark:bg-[#111] border border-transparent dark:border-white/5 focus:border-brand-500 dark:focus:border-brand-500 rounded-2xl py-3 px-4 text-slate-900 dark:text-white outline-none transition-all shadow-inner"
              >
                <option value="">Select Department...</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden rounded-2xl p-0.5 bg-gradient-to-r from-brand-500 to-accent-500 focus:outline-none focus:ring-4 focus:ring-brand-500/30 transition-all disabled:opacity-70 mt-2"
            >
              <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors"></div>
              <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-accent-600 px-6 py-3.5 rounded-[14px] text-white font-bold text-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                {loading ? 'Registering...' : 'Sign Up'}
                {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
              </div>
            </button>
            
          </form>

          <div className="mt-6 flex justify-between items-center text-sm">
            <Link to="/login" className="flex items-center gap-1.5 text-slate-500 hover:text-brand-500 transition-colors">
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
