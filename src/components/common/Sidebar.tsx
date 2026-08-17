import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Users2, 
  UserCheck, 
  FolderKanban, 
  CheckSquare, 
  BarChart3, 
  FileText, 
  Activity, 
  Settings, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  ShieldAlert,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ZSangamLogo } from './ZSangamLogo';
import { ViewType } from '../../types';

export const Sidebar: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    currentUser, 
    logout, 
    projects,
    isSidebarOpen,
    setIsSidebarOpen
  } = useApp();

  const handleNavClick = (view: ViewType) => {
    setActiveView(view);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: 'ORGANIZATION',
      items: [
        { id: 'departments' as ViewType, label: 'Departments', icon: Building2, count: 8 },
        { id: 'teams' as ViewType, label: 'Teams', icon: Users2, count: 24 },
        { id: 'members' as ViewType, label: 'Members', icon: UserCheck, count: 126 },
      ]
    },
    {
      title: 'WORK MANAGEMENT',
      items: [
        { id: 'projects' as ViewType, label: 'Projects', icon: FolderKanban, count: projects.length },
        { id: 'tasks' as ViewType, label: 'Tasks', icon: CheckSquare, count: 384 },
      ]
    },
    {
      title: 'INSIGHTS',
      items: [
        { id: 'analytics' as ViewType, label: 'Analytics', icon: BarChart3 },
        { id: 'reports' as ViewType, label: 'Reports', icon: FileText },
      ]
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { id: 'activity' as ViewType, label: 'Activity', icon: Activity, badge: 'Live' },
        { id: 'settings' as ViewType, label: 'Settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside 
      id="main-sidebar"
      className={`w-64 bg-[#090f1f] border-r border-slate-800/80 flex flex-col h-screen shrink-0 select-none text-slate-300 font-sans z-40 fixed lg:static inset-y-0 left-0 transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 px-5 border-b border-slate-800/80 flex items-center justify-between">
        <button 
          onClick={() => handleNavClick('dashboard')}
          className="text-left focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
        >
          <ZSangamLogo size="md" />
        </button>

        {/* Close button on mobile */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Link Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              {section.title}
            </div>
            <div className="space-y-0.5 mt-1.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
                          {item.badge}
                        </span>
                      )}
                      {item.count !== undefined && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800/80 text-slate-400'}`}>
                          {item.count}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Support & User Profile */}
      <div className="p-3 border-t border-slate-800/80 space-y-2 bg-[#060b17]">
        <button
          onClick={() => handleNavClick('settings')}
          className="w-full flex items-center gap-3 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-md transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Help & Documentation</span>
        </button>

        {/* User Card */}
        <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-blue-500/40"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
            </div>
            <div className="truncate">
              <div className="text-xs font-medium text-slate-200 truncate leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-blue-400/90 font-medium truncate flex items-center gap-1">
                <span>{currentUser.role}</span>
              </div>
            </div>
          </div>

          <button
            id="sidebar-logout-btn"
            onClick={logout}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
