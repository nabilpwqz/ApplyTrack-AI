import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  LayoutDashboard, 
  Briefcase, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Building2, 
  Sparkles, 
  Settings as SettingsIcon, 
  LogOut, 
  Search, 
  Plus, 
  Zap, 
  ChevronRight,
  X,
  Menu,
  UserCheck
} from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Global hotkey listener (Ctrl+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      } else if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Applications', path: '/dashboard/applications', icon: Briefcase },
    { label: 'Calendar', path: '/dashboard/calendar', icon: CalendarIcon },
    { label: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Companies', path: '/dashboard/companies', icon: Building2 },
    { label: 'AI Command Hub', path: '/dashboard/ai-hub', icon: Sparkles, badge: 'AI' },
    { label: 'Settings', path: '/dashboard/settings', icon: SettingsIcon },
  ];

  const handleCommandNavigate = (path: string) => {
    setCommandPaletteOpen(false);
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Background Ambient Spotlights */}
      <div className="fixed top-0 left-1/4 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-0 right-1/4 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-orange-500/5 rounded-full blur-[140px] pointer-events-none -z-10"></div>

      {/* Top Banner Status Bar */}
      <div className="bg-neutral-900/90 border-b border-white/5 px-3 sm:px-4 py-1.5 text-[11px] text-slate-400 flex justify-between items-center z-20 backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider text-[10px]">
            <Zap className="w-3 h-3 text-amber-400 animate-pulse" /> ApplyTrack AI Engine
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-slate-300">
            <UserCheck className="w-3 h-3 text-amber-500" /> User: <strong className="text-white">{user?.name || 'Guest'}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCommandPaletteOpen(true)}
            className="inline-flex md:hidden items-center gap-1 text-amber-400 text-[10px] font-bold"
          >
            <Search className="w-3 h-3" /> Search
          </button>
          <span className="hidden md:inline-flex items-center gap-1.5 text-slate-400">
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-neutral-800 border border-white/10 rounded text-amber-400">Ctrl+K</kbd> Quick Search
          </span>
          <span className="badge badge-warning badge-xs font-bold text-slate-950 uppercase px-2 py-0.5">Standalone Mode</span>
        </div>
      </div>

      {/* Mobile Top Header */}
      <div className="md:hidden bg-neutral-950 border-b border-white/5 px-4 py-3 flex items-center justify-between z-20">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black text-sm">
            A
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">
            ApplyTrack<span className="text-amber-400">.AI</span>
          </span>
        </Link>

        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white rounded-xl bg-neutral-900 border border-white/10"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Desktop Sidebar Navigation */}
        <aside className="w-64 bg-neutral-950/70 border-r border-white/5 flex-col justify-between hidden md:flex z-10 backdrop-blur-md">
          <div className="p-5 space-y-6">
            
            {/* App Logo */}
            <Link to="/dashboard" className="flex items-center gap-3 px-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                A
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block leading-none">
                  ApplyTrack<span className="text-amber-400">.AI</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Job Tracker</span>
              </div>
            </Link>

            {/* Quick Action Button */}
            <button 
              onClick={() => navigate('/dashboard/applications')}
              className="btn btn-sm btn-primary text-slate-950 font-bold w-full rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-transform"
            >
              <Plus className="w-4 h-4" /> Track New Application
            </button>

            {/* Nav List */}
            <nav className="space-y-1">
              <span className="px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block mb-2">Main Menu</span>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200
                      ${isActive 
                        ? 'nav-link-active' 
                        : 'text-slate-400 hover:text-white hover:bg-neutral-900/60'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="badge badge-warning badge-xs font-bold text-slate-950 px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

          </div>

          {/* User Footer Profile Card */}
          <div className="p-4 border-t border-white/5 bg-neutral-900/40">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'G'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">{user?.name || 'Guest'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email || 'guest@applytrack.ai'}</p>
                </div>
              </div>
              
              <button 
                onClick={logout}
                title="Log Out"
                className="p-1.5 text-slate-500 hover:text-amber-400 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Slide-Out Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)}></div>
            <div className="relative w-4/5 max-w-xs bg-neutral-950 border-r border-white/10 p-5 flex flex-col justify-between z-50 h-full">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black text-sm">
                      A
                    </div>
                    <span className="font-extrabold text-base text-white">ApplyTrack<span className="text-amber-400">.AI</span></span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`
                          flex items-center justify-between px-3 py-3 rounded-xl text-xs font-semibold transition-all
                          ${isActive ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-neutral-900'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'G'}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">{user?.name || 'Guest'}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email || 'guest@applytrack.ai'}</p>
                  </div>
                </div>
                <button 
                  onClick={logout}
                  className="btn btn-xs btn-outline border-error/30 text-error hover:bg-error/10 w-full rounded-lg text-xs"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto custom-scroll p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

      </div>

      {/* Global Command Palette Modal (Ctrl+K) */}
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-20 p-4">
          <div className="w-full max-w-lg bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden space-y-3 p-4 relative animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
                <Search className="w-4 h-4" />
                <span>Command Launcher & Navigation</span>
              </div>
              <button 
                onClick={() => setCommandPaletteOpen(false)}
                className="text-slate-500 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input 
              type="text" 
              placeholder="Type to filter pages or actions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-sm w-full bg-neutral-950 border-white/10 text-white rounded-xl text-xs focus:outline-none focus:border-amber-500"
              autoFocus
            />

            <div className="space-y-1 max-h-60 overflow-y-auto pt-1 custom-scroll">
              {navItems
                .filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleCommandNavigate(item.path)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-neutral-800 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-amber-400" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                  );
                })}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Layout;
