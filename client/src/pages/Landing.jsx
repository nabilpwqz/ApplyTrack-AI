import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Sparkles, 
  Briefcase, 
  MailCheck, 
  FileCheck, 
  TrendingUp, 
  ShieldAlert, 
  DollarSign, 
  ArrowRight,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Landing = () => {
  const { loginDemo } = useAuth();
  const navigate = useNavigate();

  const handleDemoAccess = async () => {
    toast.loading('Initializing demo session and seeding database...', { id: 'demo' });
    const res = await loginDemo();
    if (res.success) {
      toast.success('Access granted! Welcome to ApplyTrack AI, Nabil.', { id: 'demo' });
      navigate('/dashboard');
    } else {
      toast.error('Failed to start demo session', { id: 'demo' });
    }
  };

  const features = [
    {
      title: 'Automatic Email Import',
      desc: 'Parses job receipts and scheduling emails from your inbox automatically. Review extracted events before confirming modifications.',
      icon: MailCheck,
      color: 'text-indigo-400'
    },
    {
      title: 'AI Follow-Up Assistant',
      desc: 'Drafts tailored emails to recruiters based on response days and previous communication in Professional, Friendly, or Confident tones.',
      icon: Sparkles,
      color: 'text-purple-400'
    },
    {
      title: 'Interview Success Probability',
      desc: 'Weights profile skills, experience, and job descriptions using a calibration score model to predict outcomes and suggest target study topics.',
      icon: FileCheck,
      color: 'text-teal-400'
    },
    {
      title: 'Company Health & Layoff Risk',
      desc: 'Gathers indicators on headcount trends, seed funding, and industry stability to rate overall corporate health and estimate layoff risk.',
      icon: ShieldAlert,
      color: 'text-amber-400'
    },
    {
      title: 'Salary Negotiation Advisor',
      desc: 'Compares offers against market ranges in your region and builds negotiation leverage talking points along with recruiter message scripts.',
      icon: DollarSign,
      color: 'text-emerald-400'
    },
    {
      title: 'Funnel & Source Analytics',
      desc: 'Uncovers conversion efficiency from screening to offer stages, compares rates by company tier, and identifies top performing sourcing channels.',
      icon: TrendingUp,
      color: 'text-pink-400'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-mesh text-slate-100 flex flex-col justify-between">
      {/* Header */}
      <header className="px-6 lg:px-12 py-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="w-4 h-4 text-white" />
          </span>
          <span className="text-xl font-bold tracking-tight text-white">
            ApplyTrack <span className="text-primary">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Log In
          </Link>
          <Link to="/register" className="btn btn-sm btn-primary rounded-lg">
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 lg:px-12 py-16 md:py-24 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7 space-y-8 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Career OS
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            Never lose track of another <span className="text-gradient">job application</span>
          </h1>
          
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
            Turn scattered sheets and recruiter emails into an automated, measurable pipeline. Track statuses, auto-parse inbox updates, evaluate layoff risks, and negotiate compensation packages.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button 
              onClick={handleDemoAccess}
              className="btn btn-primary btn-md rounded-xl shadow-lg shadow-primary/30 flex items-center gap-2 hover:scale-[1.02] transition-transform"
            >
              Access Demo Session (42 Apps Seeding)
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link 
              to="/register" 
              className="btn btn-outline border-white/10 text-slate-200 hover:bg-white/5 rounded-xl flex items-center gap-2"
            >
              Create Account
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex items-center gap-6 pt-4 border-t border-white/5 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary" /> $0 Host Setup</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary" /> Gemini-Powered Models</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary" /> Inbox Parser Included</span>
          </div>
        </div>

        {/* Hero Dashboard Preview */}
        <div className="md:col-span-5 relative w-full flex items-center justify-center animate-float">
          <div className="absolute inset-0 bg-primary/15 rounded-3xl filter blur-3xl -z-10"></div>
          
          <div className="w-full glass-panel border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-warning"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-success"></span>
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Candidate Workspace</span>
            </div>

            {/* Quick Stats Mockup */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-neutral/40 rounded-lg p-2 border border-white/5 text-center">
                <p className="text-lg font-bold text-white">42</p>
                <p className="text-[9px] text-slate-400">Total Apps</p>
              </div>
              <div className="bg-neutral/40 rounded-lg p-2 border border-white/5 text-center">
                <p className="text-lg font-bold text-teal-400">8</p>
                <p className="text-[9px] text-slate-400">Interviews</p>
              </div>
              <div className="bg-neutral/40 rounded-lg p-2 border border-white/5 text-center">
                <p className="text-lg font-bold text-primary">2</p>
                <p className="text-[9px] text-slate-400">Offers</p>
              </div>
            </div>

            {/* Inbox Parser Event Mockup */}
            <div className="bg-primary/5 rounded-lg p-3 border border-primary/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-bold text-primary tracking-wide">Recruiter Mail Detected</span>
                <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[8px] font-bold">Confidence: 96%</span>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-white">Hiring Update: Google Frontend Engineer</h4>
                <p className="text-[10px] text-slate-400 italic">"We would love to schedule a panel loop this Thursday..."</p>
              </div>
              <div className="flex gap-2 pt-1">
                <div className="px-2 py-0.5 bg-primary text-white rounded text-[9px] font-bold">Confirm Stage update to INTERVIEW</div>
              </div>
            </div>

            {/* Inactivity warning */}
            <div className="bg-warning/5 rounded-lg p-3 border border-warning/20 flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-xs font-semibold text-warning">Application At Risk</h4>
                <p className="text-[10px] text-slate-400">Microsoft SWE: No contact for 12 days.</p>
              </div>
              <span className="text-[9px] text-slate-400 underline cursor-pointer">Draft Follow-Up</span>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Grid */}
      <section className="bg-neutral/20 border-t border-white/5 py-20 px-6 lg:px-12 w-full">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-white">Command center tools</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Equipped with intelligent career modules that shift you from a passive job tracker into an active market negotiator.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, idx) => (
              <div key={idx} className="glass-card rounded-2xl p-6 space-y-4">
                <span className={`w-10 h-10 rounded-xl bg-neutral flex items-center justify-center border border-white/5 ${f.color}`}>
                  <f.icon className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-bold text-white">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-white/5 text-center text-xs text-slate-600">
        &copy; {new Date().getFullYear()} ApplyTrack AI. All rights reserved. Open-source MERN platform.
      </footer>
    </div>
  );
};
export default Landing;
