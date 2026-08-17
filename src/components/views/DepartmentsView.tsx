import React, { useState } from 'react';
import { 
  Building2, 
  Users2, 
  UserCheck, 
  FolderKanban, 
  TrendingUp, 
  Plus, 
  Search, 
  LayoutGrid, 
  ListFilter,
  MoreVertical,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Department } from '../../types';

export const DepartmentsView: React.FC = () => {
  const { 
    departments, 
    users,
    projects,
    setIsQuickCreateOpen, 
    setActiveView, 
    showToast 
  } = useApp();

  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.code.toLowerCase().includes(search.toLowerCase()) ||
    d.headName.toLowerCase().includes(search.toLowerCase())
  );

  const coreDepts = filteredDepts.filter(d => d.category !== 'Corporate Functions');
  const corporateDepts = filteredDepts.filter(d => d.category === 'Corporate Functions');

  const activeProjCount = projects.filter(p => p.status === 'In Progress' || p.status === 'in_progress').length;
  const avgHealthPct = departments.length 
    ? Math.round(departments.reduce((acc, d) => acc + (d.resourceAllocationPct || 85), 0) / departments.length)
    : 100;

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Departments
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Organizational hierarchy, resource utilization and leadership overview.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search departments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-48 sm:w-56"
            />
          </div>

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListFilter className="w-4 h-4" />
            </button>
          </div>

          <button
            id="create-department-btn"
            onClick={() => setIsQuickCreateOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Department</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">TOTAL DEPARTMENTS</span>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-1">{departments.length}</div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-1">+{departments.length} Units</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">TOTAL PERSONNEL</span>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-1">{users.length}</div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-1">Active Members</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ACTIVE PROJECTS</span>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-1">{activeProjCount}</div>
          <div className="text-[10px] text-blue-400 font-semibold mt-1">Across all departments</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">AVG. HEALTH SCORE</span>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-1">{avgHealthPct}%</div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-1">{avgHealthPct >= 80 ? 'High efficiency' : 'Moderate'}</div>
        </div>
      </div>

      {/* Core Engineering & Operational Units Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Strategic & Engineering Divisions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {coreDepts.map((dept) => {
            const statusBadge = {
              'ON TRACK': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
              'SCALING': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
              'AT RISK': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
              'STABLE': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
              'REVIEW': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            }[dept.status];

            return (
              <div
                key={dept.id}
                className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-md"
                        style={{ backgroundColor: dept.accentColor }}
                      >
                        {dept.code}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-100">{dept.name}</h3>
                        <span className="text-[11px] text-slate-400">{dept.category}</span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${statusBadge}`}>
                      {dept.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 my-3 leading-relaxed">
                    {dept.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center my-4">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">TEAMS</div>
                      <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">{dept.teamsCount}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">MEMBERS</div>
                      <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">{dept.membersCount}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">PROJECTS</div>
                      <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">{dept.activeProjectsCount}</div>
                    </div>
                  </div>

                  {/* Resource Utilization */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Resource Utilization</span>
                      <span className="font-bold text-slate-200 font-mono">{dept.resourceAllocationPct}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${dept.resourceAllocationPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs mt-4">
                  <div className="flex items-center gap-2">
                    <img src={dept.headAvatar} alt={dept.headName} className="w-6 h-6 rounded-full object-cover ring-1 ring-blue-500/30" />
                    <div>
                      <span className="text-slate-400 text-[11px]">Head: </span>
                      <span className="text-slate-200 font-semibold">{dept.headName}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveView('teams');
                      showToast('Teams Filtered', `Filtered by ${dept.name}`, 'info');
                    }}
                    className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                  >
                    <span>View Teams</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Corporate Functions Section */}
      <div className="space-y-3 pt-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Corporate & Administrative Functions
        </h2>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800 bg-slate-950/40 font-semibold">
              <tr>
                <th className="py-3 px-4">DEPARTMENT</th>
                <th className="py-3 px-4">LEADERSHIP</th>
                <th className="py-3 px-4">MEMBERS</th>
                <th className="py-3 px-4">TEAMS</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {corporateDepts.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-slate-200">
                        {dept.code}
                      </div>
                      <div>
                        <div className="font-bold text-slate-100">{dept.name}</div>
                        <div className="text-[11px] text-slate-400">{dept.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <img src={dept.headAvatar} alt={dept.headName} className="w-5 h-5 rounded-full object-cover" />
                      <span className="text-slate-200">{dept.headName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono">{dept.membersCount} Specialists</td>
                  <td className="py-3 px-4 font-mono">{dept.teamsCount} Squads</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                      {dept.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setActiveView('members')}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      Directory →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
