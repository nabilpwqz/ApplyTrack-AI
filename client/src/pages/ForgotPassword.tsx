import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api.ts';
import { Mail, Lock, KeyRound, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState<string>('');
  const [resetToken, setResetToken] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    const res = await authAPI.forgotPassword(email);
    setSubmitting(false);

    if (res.success) {
      toast.success('Reset token generated!');
      if (res.data?.resetToken) {
        setResetToken(res.data.resetToken);
      }
      setStep(2);
    } else {
      toast.error(res.message || 'Failed to generate reset token');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetToken || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    const res = await authAPI.resetPassword(resetToken, newPassword);
    setSubmitting(false);

    if (res.success) {
      toast.success('Password reset successfully! Please log in.');
      navigate('/login');
    } else {
      toast.error(res.message || 'Failed to reset password');
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-4 selection:bg-brand-500 selection:text-slate-950">
      <div className="w-full max-w-md space-y-6">

        {/* Header Logo */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-teal-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
              A
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              ApplyTrack<span className="text-brand-400">.AI</span>
            </span>
          </Link>
          <h2 className="text-lg font-bold text-white">Reset your password</h2>
          <p className="text-xs text-slate-400">
            {step === 1 ? 'Enter your email to receive a reset token' : 'Enter the token and your new password'}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 border-white/10 space-y-4">
          {step === 1 ? (
            <form onSubmit={handleRequestToken} className="space-y-4">
              <div className="form-control">
                <label className="label text-[10px] text-slate-400 font-bold uppercase py-0.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input input-bordered w-full pl-9 bg-neutral-900 border-white/5 text-white text-xs rounded-xl focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-sm btn-primary text-slate-950 font-bold w-full rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                {submitting ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <>
                    Send Reset Token <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {resetToken && (
                <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-teal-300 leading-relaxed">
                    Demo mode: your reset token has been auto-filled below (in production this would be emailed to you).
                  </p>
                </div>
              )}

              <div className="form-control">
                <label className="label text-[10px] text-slate-400 font-bold uppercase py-0.5">Reset Token</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Paste your reset token"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="input input-bordered w-full pl-9 bg-neutral-900 border-white/5 text-white text-xs rounded-xl focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label text-[10px] text-slate-400 font-bold uppercase py-0.5">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input input-bordered w-full pl-9 bg-neutral-900 border-white/5 text-white text-xs rounded-xl focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label text-[10px] text-slate-400 font-bold uppercase py-0.5">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input input-bordered w-full pl-9 bg-neutral-900 border-white/5 text-white text-xs rounded-xl focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-sm btn-primary text-slate-950 font-bold w-full rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                {submitting ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <>
                    Reset Password <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-sm btn-ghost text-slate-400 w-full rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            </form>
          )}

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/5">
            Remember your password?{' '}
            <Link to="/login" className="text-brand-400 font-bold hover:underline">
              Sign in
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;