import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  ChevronRight, 
  RefreshCw, 
  Command, 
  Sparkles,
  CheckCircle2,
  ChevronDown,
  UserCheck,
  Building2,
  FolderKanban,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MOCK_USERS } from '../../data/mockData';

export const Header: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    currentUser, 
    setCurrentUser,
    selectedProject, 
    setIsQuickCreateOpen,
    searchQuery,
    setSearchQuery,
    theme,
    toggleTheme,
    showToast,
    isSidebarOpen,
    setIsSidebarOpen
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const getBreadcrumbs = () => {
    switch (activeView) {
      case 'dashboard':
        return ['OVERVIEW', 'DASHBOARD'];
      case 'projects':
        return ['WORK MANAGEMENT', 'PROJECTS'];
      case 'project-detail':
        return ['WORK MANAGEMENT', 'PROJECTS', selectedProject ? selectedProject.code : 'PROJECT DETAILS'];
      case 'create-project':
        return ['WORK MANAGEMENT', 'PROJECTS', 'CREATE NEW PROJECT'];
      case 'departments':
        return ['ORGANIZATION', 'DEPARTMENTS'];
      case 'teams':
        return ['ORGANIZATION', 'TEAMS'];
      case 'members':
        return ['ORGANIZATION', 'MEMBERS'];
      case 'tasks':
        return ['WORK MANAGEMENT', 'TASKS'];
      case 'analytics':
        return ['INSIGHTS', 'ANALYTICS'];
      case 'reports':
        return ['INSIGHTS', 'REPORTS'];
      case 'activity':
        return ['ADMINISTRATION', 'REAL-TIME ACTIVITY'];
      case 'settings':
        return ['ADMINISTRATION', 'SETTINGS & PERMISSIONS'];
      default:
        return ['Z-SANGAM', 'PORTAL'];
    }
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header 
      id="main-header"
      className="h-16 bg-[#090f1f]/95 backdrop-blur border-b border-slate-800/80 px-3 sm:px-6 flex items-center justify-between z-20 shrink-0 select-none text-slate-200"
    >
      {/* Left Area: Mobile Hamburger + Breadcrumb Path */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Hamburger Toggle (Mobile/Tablet) */}
        <button
          id="mobile-sidebar-toggle-btn"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden p-2 -ml-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Path */}
        <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-400 truncate">
          {/* Desktop full breadcrumb */}
          <div className="hidden sm:flex items-center gap-1.5 truncate">
            <button 
              onClick={() => setActiveView('dashboard')}
              className="hover:text-slate-200 transition-colors uppercase shrink-0"
            >
              {breadcrumbs[0]}
            </button>
            {breadcrumbs.slice(1).map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className={`uppercase font-medium truncate ${idx === breadcrumbs.length - 2 ? 'text-blue-400 font-bold' : 'text-slate-400'}`}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* Mobile concise active title */}
          <div className="sm:hidden flex items-center gap-1 text-xs font-bold text-blue-400 uppercase tracking-wide truncate">
            <span>{breadcrumbs[breadcrumbs.length - 1]}</span>
          </div>
        </div>
      </div>

      {/* Center Search Bar (Desktop) */}
      <div className="flex-1 max-w-md mx-4 lg:mx-6 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, teams, members, tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 focus:border-blue-500/80 rounded-lg pl-9 pr-14 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] bg-slate-800 border border-slate-700 text-slate-400 px-1.5 py-0.5 rounded">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Action Strip */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Mobile Search Toggle */}
        <div className="md:hidden relative">
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className={`p-2 rounded-lg transition-colors ${
              isMobileSearchOpen ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Search"
            aria-label="Toggle search"
          >
            <Search className="w-4 h-4" />
          </button>

          {isMobileSearchOpen && (
            <div className="absolute right-0 top-12 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search everything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-200 focus:outline-none"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Live Data Sync Badge (Desktop only) */}
        <div 
          onClick={() => showToast('Data Synchronized', 'Real-time telemetry and state synchronized with global nodes.', 'info')}
          className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 cursor-pointer hover:border-slate-700 transition-colors"
          title="Click to manually refresh data"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
          <span className="text-slate-400 font-medium">DATA SYNC</span>
          <span className="text-slate-200 font-semibold">Live</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            id="header-notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent hover:border-slate-700 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-slate-900 animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-slate-900" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-semibold text-slate-200">
                <span>Notifications (3 unread)</span>
                <span className="text-[10px] text-blue-400 cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="py-2 space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-slate-200">
                  <div className="font-medium text-blue-300">Sprint Milestone Completed</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Z-Analytics V2 completed Core Model Development milestone.</div>
                  <div className="text-[9px] text-slate-400 mt-1">10 mins ago</div>
                </div>
                <div className="p-2 rounded-lg hover:bg-slate-800/60 text-slate-300">
                  <div className="font-medium text-slate-200">New Task Assigned</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Rahul Sharma assigned you to &ldquo;TensorRT video pipeline&rdquo;.</div>
                  <div className="text-[9px] text-slate-400 mt-1">1 hour ago</div>
                </div>
                <div className="p-2 rounded-lg hover:bg-slate-800/60 text-slate-300">
                  <div className="font-medium text-slate-200">Security Audit Passed</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Enterprise SSO & IAM passed SOC2 Type II certification.</div>
                  <div className="text-[9px] text-slate-400 mt-1">3 hours ago</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Light / Dark Theme Toggle Button */}
        <button
          id="theme-toggle-btn"
          onClick={() => {
            toggleTheme();
            showToast(
              theme === 'dark' ? 'Light Mode Activated' : 'Dark Mode Activated',
              theme === 'dark' ? 'Switched to Executive Navy Blue & Pure White palette.' : 'Switched to Deep Void Slate palette.',
              'info'
            );
          }}
          className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all text-xs font-semibold shadow-xs group"
          title={theme === 'dark' ? 'Switch to Light Theme (Navy Blue & White)' : 'Switch to Dark Theme'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
              <span className="hidden md:inline text-[11px] font-medium text-slate-300">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-blue-400 group-hover:-rotate-12 transition-transform duration-300" />
              <span className="hidden md:inline text-[11px] font-medium text-slate-300">Dark</span>
            </>
          )}
        </button>

        {/* Quick Create Button */}
        <button
          id="header-quick-create-btn"
          onClick={() => setIsQuickCreateOpen(true)}
          className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Quick Create</span>
          <span className="sm:hidden">New</span>
        </button>

        {/* User Persona Switcher & Menu */}
        <div className="relative">
          <button
            id="user-persona-menu-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1 sm:gap-2 p-1 sm:pl-2 sm:pr-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors text-left"
            aria-label="User profile menu"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <div className="hidden lg:block">
              <div className="text-xs font-semibold text-slate-200 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[9px] text-blue-400 font-medium">
                {currentUser.role}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-slate-800 text-xs">
                <div className="font-semibold text-slate-200">{currentUser.name}</div>
                <div className="text-[11px] text-slate-400">{currentUser.email}</div>
                <div className="mt-1.5 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {currentUser.role}
                </div>
              </div>

              <div className="py-2">
                <div className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Switch Demo Persona
                </div>
                {MOCK_USERS.slice(0, 4).map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUser(u);
                      setShowUserMenu(false);
                      showToast('Switched Persona', `Active user is now ${u.name} (${u.role})`, 'info');
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors text-left ${
                      currentUser.id === u.id 
                        ? 'bg-blue-600/20 text-blue-300 font-semibold' 
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover" />
                    <div className="truncate">
                      <div className="truncate text-xs">{u.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{u.role}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 flex flex-col gap-0.5">
                <button
                  onClick={() => {
                    toggleTheme();
                    setShowUserMenu(false);
                    showToast('Theme Changed', `Switched to ${theme === 'dark' ? 'Light Theme (Navy Blue & White)' : 'Dark Theme (Void Slate)'}`, 'info');
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-md flex items-center justify-between"
                >
                  <span>Interface Theme</span>
                  <span className="text-[10px] font-semibold text-blue-400">
                    {theme === 'dark' ? 'Dark Mode' : 'Light (Navy & White)'}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setActiveView('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-md"
                >
                  Settings & Permissions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
