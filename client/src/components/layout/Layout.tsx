import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { emailAPI } from '../../services/api.ts';
import { EmailEvent } from '../../types/index.ts';
import { 
  LayoutDashboard, 
  Briefcase, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Building2, 
  Sparkles, 
  Settings as SettingsIcon, 
  LogOut, 
  Bell, 
  Menu, 
  X,
  MailWarning
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [unprocessedCount, setUnprocessedCount] = useState<number>(0);
  const [notificationOpen, setNotificationOpen] = useState<boolean>(false);
  const [pendingEmails, setPendingEmails] = useState<EmailEvent[]>([]);

  // Fetch pending parsed emails
  const fetchPendingEmails = async () => {
    const res = await emailAPI.getEvents();
    if (res.success && res.data) {
      setPendingEmails(res.data);
      setUnprocessedCount(res.data.length);
    }
  };

  useEffect(() => {
    fetchPendingEmails();
    const interval = setInterval(fetchPendingEmails, 45000);
    return () => clearInterval(interval);
  }, []);

  const handleSyncEmails = async () => {
    toast.loading('Syncing recruiter emails...', { id: 'email-sync' });
    const res = await emailAPI.sync();
    if (res.success) {
      toast.success(res.message || 'Synced successfully', { id: 'email-sync' });
      fetchPendingEmails();
    } else {
      toast.error('Failed to sync emails', { id: 'email-sync' });
    }
  };

  const handleProcessEmail = async (eventId: string, action: string, applicationId: string | null = null) => {
    toast.loading('Processing action...', { id: 'email-process' });
    const res = await emailAPI.process(eventId, action, applicationId);
    if (res.success) {
      toast.success('Successfully imported/updated application!', { id: 'email-process' });
      fetchPendingEmails();
      navigate('/dashboard/applications');
    } else {
      toast.error(res.message || 'Error processing email', { id: 'email-process' });
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Applications', path: '/dashboard/applications', icon: Briefcase },
    { name: 'Calendar', path: '/dashboard/calendar', icon: CalendarIcon },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Companies', path: '/dashboard/companies', icon: Building2 },
    { name: 'AI Command Center', path: '/dashboard/ai', icon: Sparkles },
    { name: 'Settings', path: '/dashboard/settings', icon: SettingsIcon },
  ];

  const activeClass = (path: string) => {
    const isCurrent = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
    return isCurrent
      ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
      : 'text-slate-400 hover:bg-neutral hover:text-white';
  };

  return (
    <div className="min-h-screen bg-gradient-mesh flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/5 px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            className="lg:hidden text-slate-300 hover:text-white"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </span>
            <span className="text-xl font-bold tracking-tight text-white hidden sm:inline-block">
              ApplyTrack <span className="text-amber-400">AI</span>
            </span>
          </Link>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSyncEmails}
            className="btn btn-sm btn-outline border-amber-500/40 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500 rounded-lg flex items-center gap-2 text-xs font-bold"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Sync Emails
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-neutral"
            >
              <Bell className="w-5 h-5" />
              {unprocessedCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center animate-pulse">
                  {unprocessedCount}
                </span>
              )}
            </button>

            {/* Notification Pane */}
            {notificationOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-panel border border-white/10 rounded-xl p-4 shadow-2xl z-50">
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <MailWarning className="w-4 h-4 text-amber-400" />
                    Review Synced Emails
                  </h3>
                  <button 
                    onClick={() => setNotificationOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-3">
                  {pendingEmails.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-sm">
                      No new job emails to review.
                    </div>
                  ) : (
                    pendingEmails.map((email) => (
                      <div key={email._id} className="p-3 bg-neutral/40 rounded-lg border border-white/5 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wide">
                              {email.extractedData.applicationStatus} Detected
                            </span>
                            <h4 className="font-semibold text-white text-sm">
                              {email.extractedData.jobTitle}
                            </h4>
                            <p className="text-xs text-slate-400">
                              {email.extractedData.company} • {email.sender}
                            </p>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {new Date(email.receivedAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <p className="text-xs text-slate-300 italic border-l-2 border-amber-500/40 pl-2 line-clamp-2">
                          "{email.bodyPreview}"
                        </p>

                        <div className="flex gap-2 pt-1">
                          <button 
                            onClick={() => handleProcessEmail(email._id, 'CREATE')}
                            className="btn btn-xs bg-amber-500 text-slate-950 font-bold rounded hover:bg-amber-600 border-none"
                          >
                            Add as New
                          </button>
                          <button 
                            onClick={() => handleProcessEmail(email._id, 'DISMISS')}
                            className="btn btn-xs btn-outline rounded text-slate-400 border-white/10 hover:border-amber-500 hover:text-amber-400"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Widget */}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
              <div className="bg-amber-500/20 text-amber-400 rounded-full w-9">
                <span className="text-sm font-semibold">{user?.name ? user.name[0].toUpperCase() : 'G'}</span>
              </div>
            </div>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow-2xl menu menu-sm dropdown-content bg-neutral border border-white/5 rounded-box w-52">
              <li className="px-4 py-2 border-b border-white/5">
                <p className="font-semibold text-white">{user?.name || 'Guest'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </li>
              <li><Link to="/dashboard/settings" className="py-2 text-slate-300 hover:text-white">Settings</Link></li>
              <li>
                <button onClick={handleLogout} className="py-2 text-error hover:bg-error/10">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 relative">
        {/* Sidebar Navigation */}
        <aside className={`
          fixed inset-y-0 left-0 z-30 w-64 glass-panel border-r border-white/5 p-4 flex flex-col justify-between transform transition-transform duration-300 lg:static lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="space-y-6">
            <div className="flex lg:hidden justify-between items-center pb-2 border-b border-white/5">
              <span className="font-bold text-white text-sm">Navigation</span>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeClass(item.path)}`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="pt-4 border-t border-white/5">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:bg-error/10 hover:text-error rounded-xl text-sm font-medium transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Log Out
            </button>
          </div>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 py-6 md:p-8 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 glass-panel border-t border-white/5 px-2 py-2 flex items-center justify-around">
        <Link to="/dashboard" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-amber-400">
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </Link>
        <Link to="/dashboard/applications" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-amber-400">
          <Briefcase className="w-5 h-5" />
          <span className="text-[10px]">Jobs</span>
        </Link>
        <Link to="/dashboard/calendar" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-amber-400">
          <CalendarIcon className="w-5 h-5" />
          <span className="text-[10px]">Calendar</span>
        </Link>
        <Link to="/dashboard/ai" className="flex flex-col items-center gap-0.5 text-amber-400">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] text-amber-400 font-semibold">AI Hub</span>
        </Link>
        
        <div className="dropdown dropdown-top dropdown-end">
          <div tabIndex={0} role="button" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-amber-400">
            <Menu className="w-5 h-5" />
            <span className="text-[10px]">More</span>
          </div>
          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-2xl bg-neutral border border-white/5 rounded-box w-40 mb-2">
            <li><Link to="/dashboard/analytics"><BarChart3 className="w-4 h-4" />Analytics</Link></li>
            <li><Link to="/dashboard/companies"><Building2 className="w-4 h-4" />Companies</Link></li>
            <li><Link to="/dashboard/settings"><SettingsIcon className="w-4 h-4" />Settings</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
};
export default Layout;
