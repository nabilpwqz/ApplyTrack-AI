import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext.tsx';
import { applicationsAPI, emailAPI, remindersAPI } from '../services/api.ts';
import { Application, EmailEvent, Reminder } from '../types/index.ts';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Sparkles, 
  Building2, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Mail, 
  ArrowUpRight, 
  Plus, 
  RefreshCw, 
  Clock,
  Send,
  Zap,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [syncingEmails, setSyncingEmails] = useState<boolean>(false);

  // 1. Applications List Query
  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['applicationsList'],
    queryFn: () => applicationsAPI.getAll(),
  });

  // 2. Pending Reminders Query
  const { data: remindersData, isLoading: remindersLoading } = useQuery({
    queryKey: ['dashboardReminders'],
    queryFn: () => remindersAPI.getAll(false),
  });

  // 3. Email Sync Events Query
  const { data: emailEventsData, isLoading: emailLoading } = useQuery({
    queryKey: ['emailEvents'],
    queryFn: emailAPI.getEvents,
  });

  // Email Process Mutation
  const processEmailMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'CREATE' | 'UPDATE' | 'DISMISS' }) =>
      emailAPI.process(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailEvents'] });
      queryClient.invalidateQueries({ queryKey: ['applicationsList'] });
      toast.success('Email update processed successfully!');
    },
  });

  const handleSyncEmails = async () => {
    setSyncingEmails(true);
    const res = await emailAPI.sync();
    setSyncingEmails(false);
    if (res.success) {
      toast.success(res.message || 'Recruiter email scanner completed!');
      queryClient.invalidateQueries({ queryKey: ['emailEvents'] });
    } else {
      toast.error('Email scanner failed');
    }
  };

  if (appsLoading || remindersLoading || emailLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-3">
        <span className="loading loading-spinner loading-lg text-amber-500"></span>
        <p className="text-slate-400 text-sm font-medium">Initializing AI Career Dashboard...</p>
      </div>
    );
  }

  const apps: Application[] = appsData?.data || [];
  const reminders: Reminder[] = remindersData?.data || [];
  const emailEvents: EmailEvent[] = emailEventsData?.data || [];

  const totalApps = apps.length;
  const activeApps = apps.filter(a => !['ACCEPTED', 'REJECTED', 'WITHDRAWN', 'GHOSTED'].includes(a.status)).length;
  const interviewsCount = apps.filter(a => ['INTERVIEW', 'FINAL_INTERVIEW', 'OFFER', 'ACCEPTED'].includes(a.status)).length;
  const offersCount = apps.filter(a => ['OFFER', 'ACCEPTED'].includes(a.status)).length;

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Welcome Banner */}
      <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/10 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="badge badge-warning badge-sm uppercase font-bold tracking-wider">
              {user?.name === 'Guest' ? 'Guest Demo Session' : 'Active Account'}
            </span>
            <span className="text-xs text-slate-400 font-semibold">• 42 Pre-Seeded Applications Active</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="text-gradient">{user?.name || 'Guest'}</span> 👋
          </h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-xl leading-relaxed">
            Your career management dashboard tracks <strong>{activeApps} active pipelines</strong>, automatically scans recruiter emails, and predicts interview outcomes.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 z-10 w-full md:w-auto">
          <button 
            onClick={handleSyncEmails}
            disabled={syncingEmails}
            className="btn btn-sm btn-outline border-white/10 text-slate-200 hover:bg-white/5 rounded-xl text-xs flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingEmails ? 'animate-spin text-amber-400' : ''}`} />
            {syncingEmails ? 'Scanning...' : 'Sync Emails'}
          </button>
          
          <button 
            onClick={() => navigate('/dashboard/applications')}
            className="btn btn-sm btn-primary text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" /> Add Application
          </button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-5 space-y-2 relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Total Logged</span>
            <Briefcase className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">{totalApps}</div>
          <p className="text-[10px] text-slate-500 uppercase font-bold">Applications in pipeline</p>
        </div>

        <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-5 space-y-2 relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Active Progress</span>
            <TrendingUp className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">{activeApps}</div>
          <p className="text-[10px] text-slate-500 uppercase font-bold">In Active Stages</p>
        </div>

        <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-5 space-y-2 relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Interviews</span>
            <CalendarIcon className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-white">{interviewsCount}</div>
          <p className="text-[10px] text-slate-500 uppercase font-bold">Scheduled / Completed</p>
        </div>

        <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-5 space-y-2 relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Offers Secured</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">{offersCount}</div>
          <p className="text-[10px] text-slate-500 uppercase font-bold">Pending Decision</p>
        </div>

      </div>

      {/* AI Quick Launcher Suites */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> AI Intelligence Tools
        </h3>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            to="/dashboard/ai-hub" 
            className="p-4 bg-neutral-900/40 border border-white/5 rounded-2xl hover:border-amber-500/40 hover:bg-neutral-900/80 transition-all space-y-2 group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-xs">Job Match Score</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed">Compare job postings against candidate profile skills.</p>
          </Link>

          <Link 
            to="/dashboard/ai-hub" 
            className="p-4 bg-neutral-900/40 border border-white/5 rounded-2xl hover:border-amber-500/40 hover:bg-neutral-900/80 transition-all space-y-2 group"
          >
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
              <Send className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-xs">AI Email Drafter</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed">Draft recruiter follow-up pitches in custom tones.</p>
          </Link>

          <Link 
            to="/dashboard/companies" 
            className="p-4 bg-neutral-900/40 border border-white/5 rounded-2xl hover:border-amber-500/40 hover:bg-neutral-900/80 transition-all space-y-2 group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-600/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-xs">Layoff Risk Predictor</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed">Monitor stability scores and funding indices.</p>
          </Link>

          <Link 
            to="/dashboard/analytics" 
            className="p-4 bg-neutral-900/40 border border-white/5 rounded-2xl hover:border-amber-500/40 hover:bg-neutral-900/80 transition-all space-y-2 group"
          >
            <div className="w-8 h-8 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-xs">Funnel Conversion</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed">Track response metrics and weekly volumes.</p>
          </Link>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Email Parser Inbox & Applications List */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Email Sync Scanner Feed */}
          {emailEvents.length > 0 && (
            <div className="glass-card rounded-2xl p-6 border border-amber-500/20 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-amber-400 animate-pulse" />
                  <div>
                    <h3 className="font-bold text-white text-sm">Recruiter Email Auto-Parser</h3>
                    <p className="text-[10px] text-slate-400">Extracted updates needing your confirmation</p>
                  </div>
                </div>
                <span className="badge badge-warning badge-sm font-bold text-slate-950">
                  {emailEvents.length} Pending
                </span>
              </div>

              <div className="space-y-3">
                {emailEvents.map((evt) => (
                  <div key={evt._id} className="p-4 bg-neutral-900/60 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{evt.extractedData?.company || 'Company'}</span>
                        <span className="badge badge-outline border-amber-500/30 text-amber-400 text-[9px] uppercase font-bold">
                          {evt.extractedData?.applicationStatus || 'UPDATE'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium">{evt.subject}</p>
                      <p className="text-[10px] text-slate-400 leading-relaxed truncate max-w-lg">{evt.bodyPreview}</p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button 
                        onClick={() => processEmailMutation.mutate({ id: evt._id, action: 'CREATE' })}
                        className="btn btn-xs btn-primary text-slate-950 font-bold rounded"
                      >
                        Confirm & Create
                      </button>
                      <button 
                        onClick={() => processEmailMutation.mutate({ id: evt._id, action: 'DISMISS' })}
                        className="btn btn-xs btn-ghost text-slate-400 hover:text-white"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Applications Quick List */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Recent Active Applications</h3>
                <p className="text-xs text-slate-400">Track and jump directly into job dossiers</p>
              </div>
              <Link to="/dashboard/applications" className="text-xs text-amber-400 hover:underline font-bold">
                View Kanban Board &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {apps.slice(0, 5).map((app) => (
                <div 
                  key={app._id}
                  onClick={() => navigate(`/dashboard/applications/${app._id}`)}
                  className="p-4 bg-neutral-900/30 rounded-xl border border-white/5 hover:border-amber-500/30 cursor-pointer transition-all flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-xs">{app.jobTitle}</h4>
                      <span className="badge badge-neutral text-slate-300 text-[9px] uppercase font-bold">
                        {app.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {app.companyId?.name || app.companyName} • {app.location || 'Remote'}
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-[10px] text-slate-500 block font-bold">
                      {new Date(app.applicationDate).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-bold">
                      Open dossier <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}

              {apps.length === 0 && (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No applications logged yet. Click "Add Application" to get started.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Reminders & Quick Calendar */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Pending Tasks & Reminders Widget */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm">Action Reminders</h3>
                <p className="text-[10px] text-slate-400">Follow-up triggers and deadlines</p>
              </div>
              <span className="badge badge-warning badge-sm font-bold text-slate-950">
                {reminders.length} Due
              </span>
            </div>

            <div className="space-y-3">
              {reminders.slice(0, 4).map((rem) => (
                <div key={rem._id} className="p-3 bg-neutral-900/40 rounded-xl border border-white/5 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-white text-xs">{rem.title}</h4>
                    <span className="text-[9px] text-amber-400 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(rem.dueAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{rem.description}</p>
                </div>
              ))}

              {reminders.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No pending action reminders. You're up to date!
                </div>
              )}
            </div>
          </div>

          {/* AI Quick Advisor Card */}
          <div className="glass-card rounded-2xl p-6 border border-amber-500/20 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-sm">Career Advice Tip</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Applications with custom follow-ups sent within <strong>7-10 days</strong> yield a <strong>42% higher response rate</strong> than passive waiting.
            </p>
            <Link 
              to="/dashboard/ai-hub"
              className="btn btn-xs btn-primary text-slate-950 font-bold w-full rounded text-center block pt-1"
            >
              Draft Follow-Up Email
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
