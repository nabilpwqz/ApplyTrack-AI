import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { Mail, Lock, UserCheck, ArrowRight, Sparkles, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const { login, loginDemo, loginDemoAdmin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setSubmitting(true);
    const success = await login(email, password);
    setSubmitting(false);

    if (success) {
      navigate('/dashboard');
    }
  };

  const handleDemoLogin = async () => {
    setSubmitting(true);
    const success = await loginDemo();
    setSubmitting(false);

    if (success) {
      navigate('/dashboard');
    }
  };

  const handleDemoAdminLogin = async () => {
    setSubmitting(true);
    const success = await loginDemoAdmin();
    setSubmitting(false);

    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden selection:bg-brand-500 selection:text-slate-950">
      
      {/* Ambient Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md space-y-6 z-10"
      >
        
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <motion.div 
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl shadow-brand-500/20"
            >
              A
            </motion.div>
            <span className="font-extrabold text-3xl tracking-tight text-white">
              ApplyTrack<span className="text-brand-400">.AI</span>
            </span>
          </Link>
          <p className="text-sm text-slate-400 font-medium pt-2">AI-Powered Career Intelligence Platform</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
          <div className="mb-5 text-center sm:text-left">
            <h2 className="text-xl font-bold text-white">Welcome back</h2>
            <p className="text-xs text-slate-400">Enter your credentials to access your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            <div className="form-control">
              <label className="label text-[10px] text-slate-400 font-bold uppercase tracking-wider py-1">Email Address</label>
              <div className="relative group">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                <input 
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-sm h-10 w-full pl-10 bg-neutral-950/50 border-white/10 text-white text-sm rounded-xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label text-[10px] text-slate-400 font-bold uppercase tracking-wider py-1">Password</label>
              <div className="relative group">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                <input 
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-sm h-10 w-full pl-10 bg-neutral-950/50 border-white/10 text-white text-sm rounded-xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="text-right pb-1">
              <Link to="/forgot-password" className="text-[11px] text-brand-400 hover:text-brand-300 font-medium transition-colors">
                Forgot password?
              </Link>
            </div>

            <button 
              type="submit"
              disabled={submitting}
              className="btn btn-primary min-h-0 h-10 text-slate-950 font-extrabold w-full rounded-xl text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:scale-[1.02] transition-all border-none"
            >
              {submitting ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  Sign In to Workspace <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 font-bold hover:text-brand-300 transition-colors">
              Create one for free
            </Link>
          </div>

          <div className="divider text-[10px] text-slate-500 font-semibold my-4">OR TRY INSTANT DEMO</div>

          <div className="flex gap-2">
            <button 
              onClick={handleDemoLogin}
              disabled={submitting}
              className="flex-1 btn btn-sm h-9 bg-neutral-800/80 border-white/5 text-slate-300 hover:text-white hover:bg-neutral-700 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all font-semibold"
            >
              <UserCheck className="w-3.5 h-3.5 text-brand-400" /> Guest
            </button>
            <button 
              onClick={handleDemoAdminLogin}
              disabled={submitting}
              className="flex-1 btn btn-sm h-9 bg-neutral-800/80 border-white/5 text-slate-300 hover:text-white hover:bg-neutral-700 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all font-semibold"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-purple-400" /> Admin
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;
