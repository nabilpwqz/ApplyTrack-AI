import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext.jsx';
import { analyticsAPI, remindersAPI, applicationsAPI } from '../services/api.js';
import { 
  Briefcase, 
  Calendar, 
  Award, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight, 
  ExternalLink,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch Analytics summary
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analyticsSummary'],
    queryFn: analyticsAPI.getSummary,
  });

  // Fetch Reminders
  const { data: remindersData, isLoading: remindersLoading } = useQuery({
    queryKey: ['remindersList', { completed: 'false' }],
    queryFn: () => remindersAPI.getAll({ completed: 'false' }),
  });

  // Fetch all applications to calculate warnings
  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['allApplications'],
    queryFn: () => applicationsAPI.getAll(),
  });

  // Toggle Reminder Complete Mutation
  const toggleReminderMutation = useMutation({
    mutationFn: remindersAPI.toggleComplete,
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries(['remindersList']);
      }
    },
  });

  if (analyticsLoading || remindersLoading || appsLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-slate-400 text-sm">Compiling search statistics...</p>
      </div>
    );
  }

  const stats = analyticsData?.data?.metrics || {
    total: 0,
    active: 0,
    interviews: 0,
    offers: 0,
    responseRate: 0,
    avgResponseDays: 0
  };

  const funnel = analyticsData?.data?.funnel || {
    SAVED: 0,
    APPLIED: 0,
    SCREENING: 0,
    ASSESSMENT: 0,
    INTERVIEW: 0,
    FINAL_INTERVIEW: 0,
    OFFER: 0,
    ACCEPTED: 0,
  };

  const activeReminders = remindersData?.data || [];
  const allApps = appsData?.data || [];

  // Filter applications that need attention (Lost Applications Logic)
  // 🟢 Active (Recent activity in 5 days or interview scheduled)
  // 🟡 Needs Attention (Activity between 6-10 days ago or follow-up due/overdue)
  // 🔴 At Risk (No activity for >10 days)
  // ⚫ Ghosted (No activity for >30 days)
  const needsAttentionApps = allApps.filter(app => {
    if (['ACCEPTED', 'REJECTED', 'WITHDRAWN'].includes(app.status)) return false;
    
    const lastActivity = new Date(app.lastActivityAt);
    const diffTime = Math.abs(new Date() - lastActivity);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 8 && app.status !== 'GHOSTED';
  }).slice(0, 4);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SAVED': return 'badge-neutral';
      case 'APPLIED': return 'badge-primary';
      case 'SCREENING': return 'badge-info';
      case 'ASSESSMENT': return 'badge-warning';
      case 'INTERVIEW':
      case 'FINAL_INTERVIEW': return 'badge-secondary';
      case 'OFFER': return 'badge-success text-white font-semibold animate-pulse';
      case 'ACCEPTED': return 'badge-success text-white';
      case 'REJECTED': return 'badge-error';
      case 'GHOSTED': return 'badge-ghost border border-white/10';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Greetings Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Good morning, {user?.name || 'Nabil'}
          </h1>
          <p className="text-slate-400 text-sm">
            Here is your job search overview. You have received {stats.offers} job offers and have {stats.active} active applications.
          </p>
        </div>
        <Link 
          to="/dashboard/applications" 
          className="btn btn-primary rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Add Application
        </Link>
      </div>

      {/* Counters Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-slate-400 font-medium">Applied Jobs</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center text-info">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.active}</p>
            <p className="text-xs text-slate-400 font-medium">Active Pipelines</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{funnel.INTERVIEW + funnel.FINAL_INTERVIEW}</p>
            <p className="text-xs text-slate-400 font-medium">Interviews Scheduled</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-success animate-pulse">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.offers}</p>
            <p className="text-xs text-slate-400 font-medium">Offers Received</p>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left Side: Funnel + Recent */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Funnel Display */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Application Pipeline Funnel</h2>
              <p className="text-xs text-slate-400">Stages conversion rate of active applications</p>
            </div>
            
            <div className="space-y-4">
              {[
                { name: 'Applied', count: funnel.APPLIED, pct: 100, color: 'bg-primary' },
                { name: 'Screening', count: funnel.SCREENING, pct: stats.total > 0 ? Math.round(((funnel.SCREENING + funnel.ASSESSMENT + funnel.INTERVIEW + funnel.FINAL_INTERVIEW + funnel.OFFER + funnel.ACCEPTED) / stats.total) * 100) : 0, color: 'bg-info' },
                { name: 'Assessment', count: funnel.ASSESSMENT, pct: stats.total > 0 ? Math.round(((funnel.ASSESSMENT + funnel.INTERVIEW + funnel.FINAL_INTERVIEW + funnel.OFFER + funnel.ACCEPTED) / stats.total) * 100) : 0, color: 'bg-warning' },
                { name: 'Interview Loop', count: funnel.INTERVIEW + funnel.FINAL_INTERVIEW, pct: stats.total > 0 ? Math.round(((funnel.INTERVIEW + funnel.FINAL_INTERVIEW + funnel.OFFER + funnel.ACCEPTED) / stats.total) * 100) : 0, color: 'bg-secondary' },
                { name: 'Offer Delivered', count: funnel.OFFER, pct: stats.total > 0 ? Math.round((funnel.OFFER / stats.total) * 100) : 0, color: 'bg-success' }
              ].map((stage, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span>{stage.name}</span>
                    <span className="text-slate-400">
                      {stage.count} {stage.count === 1 ? 'job' : 'jobs'} ({stage.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-neutral/40 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`${stage.color} h-2.5 rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(stage.pct, 2)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Applications Table */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Recent Applications</h2>
                <p className="text-xs text-slate-400">Your latest logged job submissions</p>
              </div>
              <Link to="/dashboard/applications" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                View All
                <ChevronRight className="w-4.5 h-4.5" />
              </Link>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="table w-full text-slate-300">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 text-xs">
                    <th>Company</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {allApps.slice(0, 5).map((app) => (
                    <tr key={app._id} className="hover:bg-neutral/20 border-none transition-colors">
                      <td className="font-semibold text-white">
                        {app.companyId ? app.companyId.name : 'Unknown'}
                      </td>
                      <td>{app.jobTitle}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(app.status)} badge-sm`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="text-xs text-slate-400">
                        {new Date(app.applicationDate).toLocaleDateString()}
                      </td>
                      <td className="text-right">
                        <Link 
                          to={`/dashboard/applications/${app._id}`}
                          className="btn btn-ghost btn-xs text-primary hover:bg-primary/10 rounded"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {allApps.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-slate-500 text-sm">
                        No applications tracked yet.{' '}
                        <Link to="/dashboard/applications" className="text-primary underline">
                          Add one now
                        </Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Tasks + Warnings */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Today's Tasks */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white">Today's Tasks</h2>
              <p className="text-xs text-slate-400">Actions required today</p>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {activeReminders.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm flex flex-col items-center gap-2">
                  <CheckCircle className="w-8 h-8 text-success/60" />
                  All caught up! No pending tasks.
                </div>
              ) : (
                activeReminders.slice(0, 4).map((reminder) => (
                  <div key={reminder._id} className="flex items-start gap-3 p-3 bg-neutral/30 rounded-xl border border-white/5 group">
                    <input 
                      type="checkbox" 
                      className="checkbox checkbox-primary checkbox-sm mt-0.5 rounded cursor-pointer"
                      checked={reminder.completed}
                      onChange={() => toggleReminderMutation.mutate(reminder._id)}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate group-hover:text-primary transition-colors">
                        {reminder.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1">
                        {reminder.description}
                      </p>
                      <span className="text-[9px] text-slate-500">
                        Due: {new Date(reminder.dueAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Lost Applications / Attention Center */}
          <div className="glass-card rounded-2xl p-6 space-y-4 border border-warning/10">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <div>
                <h2 className="text-lg font-bold text-white">Application Health</h2>
                <p className="text-xs text-slate-400">Pipelines flagged as inactive or stalled</p>
              </div>
            </div>

            <div className="space-y-3">
              {needsAttentionApps.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  🟢 All active applications have had recent updates!
                </div>
              ) : (
                needsAttentionApps.map((app) => {
                  const lastActivity = new Date(app.lastActivityAt);
                  const diffTime = Math.abs(new Date() - lastActivity);
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={app._id} className="p-3 bg-warning/5 rounded-xl border border-warning/10 flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-white">
                          {app.companyId ? app.companyId.name : 'Company'}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          {app.jobTitle} • No contact for {diffDays} days
                        </p>
                      </div>
                      <Link 
                        to={`/dashboard/applications/${app._id}`}
                        className="btn btn-xs btn-outline btn-warning rounded text-[10px]"
                      >
                        Follow up
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
export default Dashboard;
