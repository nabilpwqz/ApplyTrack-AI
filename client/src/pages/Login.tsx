import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { Mail, Lock, UserCheck, ArrowRight, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, loginDemo } = useAuth();
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

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-4 selection:bg-amber-500 selection:text-slate-950">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              A
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              ApplyTrack<span className="text-amber-400">.AI</span>
            </span>
          </Link>
          <h2 className="text-lg font-bold text-white">Sign in to your account</h2>
          <p className="text-xs text-slate-400">Access your job applications and AI career tools</p>
        </div>

        {/* Demo Fast Pass Card */}
        <div className="glass-card p-4 rounded-2xl border border-amber-500/20 space-y-2.5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-amber-400 font-bold text-xs">
            <Sparkles className="w-4 h-4 animate-pulse" /> Instant Demo Access
          </div>
          <p className="text-[10px] text-slate-300 leading-relaxed">
            Want to test without registering? Launch the pre-seeded Guest demo workspace with 42 active job applications.
          </p>
          <button 
            onClick={handleDemoLogin}
            disabled={submitting}
            className="btn btn-sm btn-primary text-slate-950 font-bold w-full rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <UserCheck className="w-4 h-4" /> Access Demo Session (Guest)
          </button>
        </div>

        {/* Login Form Card */}
        <div className="glass-card rounded-2xl p-6 border-white/10 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="form-control">
              <label className="label text-[10px] text-slate-400 font-bold uppercase py-0.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input 
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-bordered w-full pl-9 bg-neutral-900 border-white/5 text-white text-xs rounded-xl focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label text-[10px] text-slate-400 font-bold uppercase py-0.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input 
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-bordered w-full pl-9 bg-neutral-900 border-white/5 text-white text-xs rounded-xl focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={submitting}
              className="btn btn-sm btn-outline border-amber-500/40 text-amber-400 hover:bg-amber-500/15 w-full rounded-xl text-xs flex items-center justify-center gap-1.5"
            >
              {submitting ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <>
                  Sign In <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/5">
            Don't have an account?{' '}
            <Link to="/register" className="text-amber-400 font-bold hover:underline">
              Create one for free
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
