import React, { useState } from 'react';
import { Terminal, Lock, Mail, ArrowRight, AlertCircle, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  onNavigate: (path: string) => void;
  isAdminLogin?: boolean;
}

export const LoginPage: React.FC<Props> = ({ onNavigate, isAdminLogin = false }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      onNavigate('/dashboard');
    } else {
      setError(result.error || 'Invalid email or password.');
    }
  };

  const handleDemoFill = (type: 'student' | 'admin') => {
    if (type === 'admin') {
      setEmail('admin@codearena.dev');
      setPassword('AdminPass123!');
    } else {
      setEmail('alex.dev@college.edu');
      setPassword('StudentPass123!');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-900/80 p-8 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-cyan-500/25">
            {isAdminLogin ? <Shield className="w-6 h-6 text-white" /> : <Terminal className="w-6 h-6 text-slate-950" />}
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {isAdminLogin ? 'Admin Portal Sign In' : 'Sign In to CodeArena'}
          </h2>
          <p className="text-xs text-slate-400 mt-2 font-mono">
            {isAdminLogin
              ? 'Authorized instructor & administrative credentials required'
              : 'Access your student dashboard, practice problems, and progress'}
          </p>
        </div>

        {/* Demo Quick-Click Buttons */}
        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider text-center">
            ⚡ One-Click Quick Fill Credentials
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('student')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Demo Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-950/40 hover:bg-purple-900/40 text-purple-300 border border-purple-800/40 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Admin Account</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-mono text-slate-400 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-mono text-slate-400">Password</label>
              <button
                type="button"
                onClick={() => onNavigate('/forgot-password')}
                className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px]"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
          <span>Don't have an account? </span>
          <button
            onClick={() => onNavigate('/register')}
            className="text-cyan-400 hover:text-cyan-300 font-semibold ml-1"
          >
            Create Student Account
          </button>
        </div>
      </div>
    </div>
  );
};
