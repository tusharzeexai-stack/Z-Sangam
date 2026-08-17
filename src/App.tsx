import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { QuickCreateModal } from './components/common/QuickCreateModal';
import { InviteMemberModal } from './components/common/InviteMemberModal';
import { CreateTeamModal } from './components/common/CreateTeamModal';

// Views
import { LoginView } from './components/views/LoginView';
import { DashboardView } from './components/views/DashboardView';
import { ProjectsView } from './components/views/ProjectsView';
import { ProjectDetailView } from './components/views/ProjectDetailView';
import { CreateProjectWizard } from './components/views/CreateProjectWizard';
import { DepartmentsView } from './components/views/DepartmentsView';
import { TeamsView } from './components/views/TeamsView';
import { MembersView } from './components/views/MembersView';
import { TasksView } from './components/views/TasksView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { SettingsView } from './components/views/SettingsView';

const AppContent: React.FC = () => {
  const { 
    isAuthenticated, 
    activeView, 
    isSidebarOpen,
    setIsSidebarOpen, 
    toast 
  } = useApp();

  // If not logged in, render authentication / login flow
  if (!isAuthenticated || activeView === 'login') {
    return <LoginView />;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'projects':
        return <ProjectsView />;
      case 'project-detail':
        return <ProjectDetailView />;
      case 'create-project':
        return <CreateProjectWizard />;
      case 'departments':
        return <DepartmentsView />;
      case 'teams':
        return <TeamsView />;
      case 'members':
        return <MembersView />;
      case 'tasks':
        return <TasksView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 selection:text-blue-200">
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Navigation */}
        <Sidebar />

        {/* Backdrop for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
          {/* Top Header */}
          <Header />

          {/* Page Body */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 w-full max-w-full">
            {renderActiveView()}
          </main>
        </div>
      </div>

      {/* Global Modals */}
      <QuickCreateModal />
      <InviteMemberModal />
      <CreateTeamModal />

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className={`p-4 rounded-xl shadow-2xl border flex items-start gap-3 max-w-sm ${
            toast.type === 'success'
              ? 'bg-slate-900 border-emerald-500/40 text-slate-100'
              : toast.type === 'warning'
                ? 'bg-slate-900 border-amber-500/40 text-slate-100'
                : 'bg-slate-900 border-blue-500/40 text-slate-100'
          }`}>
            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
              toast.type === 'success' ? 'bg-emerald-400' : toast.type === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
            }`} />
            <div>
              <div className="text-xs font-bold text-slate-100">{toast.title}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{toast.message}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
