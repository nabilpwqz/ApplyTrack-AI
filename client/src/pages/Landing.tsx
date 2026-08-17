import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  Sparkles, 
  Target, 
  Mail, 
  TrendingUp, 
  Building2, 
  DollarSign, 
  ArrowRight, 
  CheckCircle2, 
  UserCheck
} from 'lucide-react';

export const Landing: React.FC = () => {
  const { loginDemo } = useAuth();
  const navigate = useNavigate();

  const handleDemoAccess = async () => {
    const success = await loginDemo();
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden">
      
      {/* Top Header Navbar */}
      <header className="border-b border-white/5 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black text-base sm:text-lg shadow-lg shadow-amber-500/20">
              A
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
              ApplyTrack<span className="text-amber-400">.AI</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={handleDemoAccess}
              className="btn btn-xs sm:btn-sm btn-ghost text-amber-400 hover:bg-amber-500/10 rounded-xl text-xs flex items-center gap-1 sm:gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Guest Demo</span>
            </button>
            <Link 
              to="/login"
              className="btn btn-xs sm:btn-sm btn-outline border-white/10 text-slate-200 hover:bg-white/5 rounded-xl text-xs"
            >
              Sign In
            </Link>
            <Link 
              to="/register"
              className="btn btn-xs sm:btn-sm btn-primary text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-5 sm:space-y-6">
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
            Stop losing job applications. <br />
            <span className="text-gradient">Track, Predict & Negotiate with AI.</span>
          </h1>

          <p className="text-slate-400 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed px-2">
            The all-in-one candidate command center that automatically parses recruiter emails, predicts interview probabilities, checks company stability, and drafts follow-up pitches.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 w-full max-w-md mx-auto sm:max-w-none">
            <button 
              onClick={handleDemoAccess}
              className="btn btn-md sm:btn-lg btn-primary text-slate-950 font-extrabold rounded-2xl text-xs sm:text-sm w-full sm:w-auto px-6 sm:px-8 shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
            >
              Access Demo Session (42 Apps Seeding) <ArrowRight className="w-4 h-4" />
            </button>
            
            <Link 
              to="/register"
              className="btn btn-md sm:btn-lg btn-outline border-white/10 text-slate-200 hover:bg-white/5 rounded-2xl text-xs sm:text-sm w-full sm:w-auto px-6 sm:px-8"
            >
              Create Free Account
            </Link>
          </div>

          <div className="pt-6 sm:pt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[11px] sm:text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> Full TypeScript engine</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> Standalone offline demo ready</span>
          </div>

        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 border-t border-white/5 bg-neutral-950/40">
        <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Built for modern job seekers</h2>
            <p className="text-slate-400 text-xs sm:text-sm">Five core AI layers designed to boost interview responses and offer values.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            
            <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm sm:text-base">Kanban Stage Tracker</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Drag-and-drop pipeline management with status auditing from Saved to Offer Received.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Recruiter Email Auto-Parser</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatically extracts recruiter emails, updates stages, and logs interview invitations.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600/10 flex items-center justify-center text-amber-500">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Interview Probability AI</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scores candidate-job match percentages (0-100%) and provides top expected interview questions.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Layoff Risk & Health Audit</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Monitors corporate stability indices, hiring volumes, and estimated lay-off risk indicators.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Salary Negotiation Advisor</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Benchmarks compensation packages, calculates counter-offer targets, and drafts negotiation pitches.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Funnel Conversion Analytics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Visualizes weekly application rates, response frequencies, and sourcing channel performance.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4 sm:px-6 text-center text-xs text-slate-500">
        <p>© 2026 ApplyTrack AI. Built with MERN + TypeScript.</p>
      </footer>

    </div>
  );
};

export default Landing;
