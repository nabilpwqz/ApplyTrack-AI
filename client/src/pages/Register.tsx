import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { Sparkles, User as UserIcon, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const Register: React.FC = () => {
  const { register, loginDemo } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      return toast.error('Please fill in all input fields');
    }

    setLoading(true);
    const res = await register(name, email, password);
    setLoading(false);

    if (res.success && res.data) {
      toast.success(`Welcome to ApplyTrack AI, ${res.data.name}!`);
      navigate('/dashboard');
    } else {
      toast.error(res.message || 'Registration failed');
    }
  };

  const handleDemoAccess = async () => {
    setLoading(true);
    toast.loading('Initializing demo session and seeding database...', { id: 'demo' });
    const res = await loginDemo();
    setLoading(false);

    if (res.success) {
      toast.success('Access granted! Welcome to ApplyTrack AI, Guest.', { id: 'demo' });
      navigate('/dashboard');
    } else {
      toast.error('Failed to start demo session', { id: 'demo' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
        
        {/* Brand */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link to="/" className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight pt-1">Create an Account</h2>
          <p className="text-xs text-slate-400">Initialize your personal career command center</p>
        </div>

        {/* Action Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label py-1 text-slate-400 text-xs">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <UserIcon className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered w-full pl-10 bg-neutral/30 border-white/10 text-white rounded-lg focus:outline-none focus:border-amber-500 text-sm"
                required
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label py-1 text-slate-400 text-xs">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered w-full pl-10 bg-neutral/30 border-white/10 text-white rounded-lg focus:outline-none focus:border-amber-500 text-sm"
                required
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label py-1 text-slate-400 text-xs">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered w-full pl-10 pr-10 bg-neutral/30 border-white/10 text-white rounded-lg focus:outline-none focus:border-amber-500 text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary text-slate-950 font-bold w-full rounded-lg text-sm flex items-center justify-center gap-2 mt-2"
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner loading-xs"></span> : 'Sign Up'}
          </button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="flex-shrink mx-4 text-[10px] text-slate-500 uppercase font-bold tracking-wider">or</span>
          <div className="flex-grow border-t border-white/5"></div>
        </div>

        {/* Demo login trigger */}
        <button
          onClick={handleDemoAccess}
          className="btn btn-outline border-amber-500/40 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500 w-full rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
          disabled={loading}
        >
          Access Demo Account (Seeded)
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-400 hover:underline font-semibold">
            Log In
          </Link>
        </p>

      </div>
    </div>
  );
};
export default Register;
