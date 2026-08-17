import React from 'react';
import { 
  FolderKanban, 
  PlayCircle, 
  Building2, 
  Users2, 
  UserCheck, 
  CheckSquare, 
  TrendingUp, 
  ArrowUpRight, 
  Download, 
  ChevronRight, 
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useApp } from '../../context/AppContext';

export const DashboardView: React.FC = () => {
  const { 
    currentUser, 
    projects, 
    departments, 
    teams, 
    users, 
    tasks, 
    setActiveView, 
    setSelectedProjectId,
    showToast 
  } = useApp();

  const activeProjectsCount = projects.filter(p => p.status === 'In Progress' || p.status === 'Active' || p.status === 'in_progress').length;
  const completedTasksCount = tasks.filter(t => t.status === 'Completed' || t.status === 'completed').length;

  const topStats = [
    { label: 'TOTAL PROJECTS', value: projects.length, change: `+${projects.length} Active`, icon: FolderKanban, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'ACTIVE', value: activeProjectsCount, change: 'Running', icon: PlayCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'DEPARTMENTS', value: departments.length, change: `${departments.length} Units`, icon: Building2, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'TEAMS', value: teams.length, change: `${teams.length} Squads`, icon: Users2, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'MEMBERS', value: users.length, change: 'Synced', icon: UserCheck, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { label: 'TASKS DONE', value: completedTasksCount, change: 'Velocity ^', icon: CheckSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  const inProgressCount = projects.filter(p => p.status === 'In Progress' || p.status === 'Active' || p.status === 'in_progress').length;
  const planningCount = projects.filter(p => p.status === 'Planning' || p.status === 'planning').length;
  const completedProjCount = projects.filter(p => p.status === 'Completed' || p.status === 'completed').length;
  const blockedCount = projects.filter(p => p.status === 'Blocked' || p.status === 'On Hold' || p.status === 'at_risk').length;

  const portfolioData = [
    { name: 'In Progress', value: inProgressCount, color: '#3b82f6' },
    { name: 'Planning', value: planningCount, color: '#94a3b8' },
    { name: 'Completed', value: completedProjCount, color: '#10b981' },
    { name: 'Blocked / At Risk', value: blockedCount, color: '#ef4444' },
  ];

  const handleExportReport = () => {
    showToast('Report Generated', 'Executive Portfolio PDF & CSV export downloaded successfully.', 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <span>Good morning, {currentUser.name.split(' ')[0]}.</span>
            <span className="text-sm font-normal text-slate-400 hidden md:inline">
              Here&apos;s what&apos;s happening across your organization today.
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 md:hidden">
            Here&apos;s what&apos;s happening across your organization today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="export-dashboard-report-btn"
            onClick={handleExportReport}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all hover:scale-[1.02]"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 6 Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {topStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition-all hover:shadow-lg hover:shadow-blue-950/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className={`p-1.5 rounded-md ${stat.bg} ${stat.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-100 tracking-tight">
                  {stat.value}
                </span>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Row: Key Project Velocity & Portfolio Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Key Project Velocity (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <h2 className="text-sm font-bold text-slate-100 tracking-tight">
                Key Project Velocity
              </h2>
              <p className="text-xs text-slate-400">High-priority organizational initiatives</p>
            </div>
            <button
              onClick={() => setActiveView('projects')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4 my-4">
            {projects.slice(0, 3).map((proj) => {
              const isWarning = proj.progressPct < 50 && proj.blockersCount > 0;
              const isHigh = proj.progressPct >= 75;

              return (
                <div
                  key={proj.id}
                  onClick={() => {
                    setSelectedProjectId(proj.id);
                    setActiveView('project-detail');
                  }}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/70 hover:border-blue-500/40 cursor-pointer transition-all hover:bg-slate-950/90 group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {proj.code}
                      </span>
                      <span className="text-xs font-bold text-slate-200 group-hover:text-blue-300 transition-colors">
                        {proj.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {proj.blockersCount > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          <AlertCircle className="w-3 h-3" />
                          <span>{proj.blockersCount} Blockers</span>
                        </span>
                      )}
                      <span className="text-xs font-bold text-slate-200 font-mono">
                        {proj.progressPct}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Meter */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isWarning 
                          ? 'bg-amber-500' 
                          : isHigh 
                            ? 'bg-gradient-to-r from-blue-500 to-emerald-400' 
                            : 'bg-blue-500'
                      }`}
                      style={{ width: `${proj.progressPct}%` }}
                    />
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <img src={proj.leadAvatar} alt={proj.leadName} className="w-4 h-4 rounded-full object-cover" />
                      <span>Lead: <strong className="text-slate-300 font-medium">{proj.leadName}</strong></span>
                    </div>
                    <div>
                      Target: <span className="text-slate-300 font-mono">{proj.targetEndDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>3 Initiatives on track for Q3 release</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Avg Cycle: 4.2 weeks</span>
          </div>
        </div>

        {/* Portfolio Health (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-100 tracking-tight">
                Portfolio Health
              </h2>
              <p className="text-xs text-slate-400">Overall initiative distribution & risk</p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              92% HEALTHY
            </span>
          </div>

          {/* Donut Chart & Legend */}
          <div className="my-3 grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
            <div className="h-40 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioData}
                    innerRadius={46}
                    outerRadius={66}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-100 font-mono">{projects.length}</span>
                <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">TOTAL</span>
              </div>
            </div>

            {/* Breakdown legend */}
            <div className="space-y-2 text-xs">
              {portfolioData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/40 border border-slate-800/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-300 font-medium text-xs">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-100 font-mono text-xs">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>2 Blocked initiatives require resource allocation</span>
            <button 
              onClick={() => setActiveView('projects')} 
              className="text-blue-400 hover:underline font-semibold"
            >
              Resolve
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Row: Department Performance Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div>
            <h2 className="text-sm font-bold text-slate-100 tracking-tight">
              Department Performance
            </h2>
            <p className="text-xs text-slate-400">Cross-departmental capacity, members & execution benchmarks</p>
          </div>
          <button
            onClick={() => setActiveView('departments')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Departments</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Teams</th>
                <th className="py-3 px-3">Members</th>
                <th className="py-3 px-3">Active Proj.</th>
                <th className="py-3 px-3">Avg Completion</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {departments.slice(0, 5).map((dept) => {
                const statusStyles = {
                  'ON TRACK': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                  'SCALING': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                  'AT RISK': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                  'STABLE': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                  'REVIEW': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                }[dept.status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';

                return (
                  <tr 
                    key={dept.id} 
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => setActiveView('departments')}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                          style={{ backgroundColor: dept.accentColor }}
                        >
                          {dept.code}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 text-xs">{dept.name}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{dept.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-200">{dept.teamsCount}</td>
                    <td className="py-3 px-3 font-mono text-slate-200">{dept.membersCount}</td>
                    <td className="py-3 px-3 font-mono text-slate-200">{dept.activeProjectsCount}</td>
                    <td className="py-3 px-3 min-w-[140px]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full"
                            style={{ width: `${dept.resourceAllocationPct}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-slate-200 font-semibold">
                          {dept.resourceAllocationPct}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-md border ${statusStyles}`}>
                        {dept.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
