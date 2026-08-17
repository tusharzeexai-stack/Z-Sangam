import React, { useState } from 'react';
import { 
  FolderKanban, 
  Search, 
  LayoutGrid, 
  ListFilter, 
  Plus, 
  Calendar, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  Sparkles, 
  CheckCircle2,
  Download,
  Activity,
  Target,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Project } from '../../types';
import { ExportModal } from '../common/ExportModal';
import { ExportDropdown } from '../common/ExportDropdown';
import { exportProjectsData } from '../../utils/exportUtils';
import { CircularProgress } from '../common/CircularProgress';

export const ProjectsView: React.FC = () => {
  const { 
    projects, 
    setActiveView, 
    setSelectedProjectId, 
    searchQuery,
    setSearchQuery,
    showToast
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'All' | 'Active' | 'Planning' | 'Completed' | 'On Hold'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [localSearch, setLocalSearch] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const filterTabs = [
    { id: 'All', label: 'All Projects', count: projects.length },
    { id: 'Active', label: 'Active', count: projects.filter(p => p.status === 'In Progress' || p.status === 'Active' || p.status === 'in_progress').length },
    { id: 'Planning', label: 'Planning', count: projects.filter(p => p.status === 'Planning' || p.status === 'planning').length },
    { id: 'Completed', label: 'Completed', count: projects.filter(p => p.status === 'Completed' || p.status === 'completed').length },
    { id: 'On Hold', label: 'On Hold', count: projects.filter(p => p.status === 'On Hold' || p.status === 'on_hold').length },
  ];

  const query = (localSearch || searchQuery).toLowerCase();

  const filteredProjects = projects.filter(p => {
    // Tab filter
    if (activeFilter === 'Active' && p.status !== 'In Progress' && p.status !== 'Active') return false;
    if (activeFilter === 'Planning' && p.status !== 'Planning') return false;
    if (activeFilter === 'Completed' && p.status !== 'Completed') return false;
    if (activeFilter === 'On Hold' && p.status !== 'On Hold') return false;

    // Search query
    if (query) {
      const matchName = p.name.toLowerCase().includes(query);
      const matchCode = p.code.toLowerCase().includes(query);
      const matchDept = p.department.toLowerCase().includes(query);
      const matchLead = p.leadName.toLowerCase().includes(query);
      return matchName || matchCode || matchDept || matchLead;
    }

    return true;
  });

  // Calculate aggregate metrics for top circular progress overview
  const totalTasksAll = filteredProjects.reduce((acc, p) => acc + p.totalTasks, 0);
  const completedTasksAll = filteredProjects.reduce((acc, p) => acc + p.completedTasks, 0);
  const avgProgress = filteredProjects.length > 0 
    ? Math.round(filteredProjects.reduce((acc, p) => acc + p.progressPct, 0) / filteredProjects.length)
    : 0;
  const milestoneCompletionPct = totalTasksAll > 0 ? Math.round((completedTasksAll / totalTasksAll) * 100) : 0;

  const handleQuickExportCSV = () => {
    exportProjectsData(filteredProjects, 'csv');
    showToast('Projects Exported', `Downloaded ${filteredProjects.length} projects portfolio as CSV.`, 'success');
  };

  const handleQuickExportJSON = () => {
    exportProjectsData(filteredProjects, 'json');
    showToast('Projects Exported', `Downloaded ${filteredProjects.length} projects portfolio as JSON.`, 'success');
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProjectId(project.id);
    setActiveView('project-detail');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Projects Portfolio
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time status, circular completion feedback, and milestone tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-48 sm:w-56"
            />
          </div>

          {/* Grid / Table switch */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              id="projects-view-grid-btn"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-blue-600/20 text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid View with Circular Progress"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="projects-view-table-btn"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-blue-600/20 text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table View"
            >
              <ListFilter className="w-4 h-4" />
            </button>
          </div>

          <ExportDropdown
            id="projects-export-dropdown"
            label="Export Portfolio"
            csvLabel={`Export ${filteredProjects.length} Projects (.csv)`}
            jsonLabel={`Export ${filteredProjects.length} Projects (.json)`}
            onExportCSV={handleQuickExportCSV}
            onExportJSON={handleQuickExportJSON}
            onOpenAdvanced={() => setIsExportModalOpen(true)}
          />

          {/* + Create Project Button */}
          <button
            id="create-project-btn"
            onClick={() => setActiveView('create-project')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Project</span>
          </button>
        </div>
      </div>

      {/* Circular Progress Executive Portfolio Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3.5 sm:border-r border-slate-800/80 pr-3">
          <CircularProgress 
            value={avgProgress} 
            size="md" 
            color="#3b82f6" 
            strokeWidth={3.8} 
          />
          <div>
            <div className="text-xs font-bold text-slate-100">Average Portfolio Velocity</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{filteredProjects.length} active workstreams</div>
            <div className="text-[10px] text-blue-400 font-medium mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+4.2% velocity this sprint</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 sm:border-r border-slate-800/80 px-0 sm:px-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800/60">
          <CircularProgress 
            value={milestoneCompletionPct} 
            size="md" 
            color="#10b981" 
            strokeWidth={3.8} 
          />
          <div>
            <div className="text-xs font-bold text-slate-100">Milestone Delivery Rate</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{completedTasksAll} of {totalTasksAll} checkpoints closed</div>
            <div className="text-[10px] text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>On schedule for Q3 launch</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 sm:pl-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800/60">
          <CircularProgress 
            value={84} 
            size="md" 
            color="#8b5cf6" 
            strokeWidth={3.8} 
          />
          <div>
            <div className="text-xs font-bold text-slate-100">Sprint Health Index</div>
            <div className="text-[11px] text-slate-400 mt-0.5">8 sprints executing concurrently</div>
            <div className="text-[10px] text-purple-400 font-medium mt-0.5 flex items-center gap-1">
              <Activity className="w-3 h-3" />
              <span>0 critical blockers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Project Portfolio"
        description="Download organizational projects list with status, lead, progress, milestone counts, and tags in CSV or JSON."
        itemType="projects"
        projects={filteredProjects}
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800/60'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-blue-700/80 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content: Table View */}
      {viewMode === 'table' ? (
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800 bg-slate-950/40 font-semibold">
                <tr>
                  <th className="py-3 px-4">PROJECT</th>
                  <th className="py-3 px-4">DEPARTMENT & TEAMS</th>
                  <th className="py-3 px-4">LEAD</th>
                  <th className="py-3 px-4">MEMBERS</th>
                  <th className="py-3 px-4">TIMELINE</th>
                  <th className="py-3 px-4">STATUS & PROGRESS</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredProjects.map((proj) => {
                  const statusColor = {
                    'In Progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    'Active': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    'Completed': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                    'Planning': 'bg-slate-500/10 text-slate-300 border-slate-500/20',
                    'On Hold': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    'Blocked': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                  }[proj.status] || 'bg-slate-500/10 text-slate-300';

                  return (
                    <tr
                      key={proj.id}
                      onClick={() => handleSelectProject(proj)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Project Name & Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <FolderKanban className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-100 text-xs group-hover:text-blue-300 transition-colors">
                              {proj.name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-mono font-semibold text-blue-400">
                                {proj.code}
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded border ${statusColor}`}>
                                {proj.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department & Teams */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="inline-block text-[11px] font-semibold text-slate-200">
                            {proj.department}
                          </span>
                          <div className="flex items-center gap-1 flex-wrap">
                            {proj.teams.slice(0, 2).map((t, idx) => (
                              <span key={idx} className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                                {t}
                              </span>
                            ))}
                            {proj.teams.length > 2 && (
                              <span className="text-[9px] text-slate-400">
                                +{proj.teams.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Lead */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={proj.leadAvatar}
                            alt={proj.leadName}
                            className="w-6 h-6 rounded-full object-cover ring-1 ring-blue-500/30"
                          />
                          <span className="text-xs text-slate-200 font-medium">{proj.leadName}</span>
                        </div>
                      </td>

                      {/* Members Stack */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center -space-x-1.5">
                          {proj.members.slice(0, 3).map((m, idx) => (
                            <img
                              key={idx}
                              src={m.avatar}
                              alt={m.name}
                              title={m.name}
                              className="w-6 h-6 rounded-full object-cover ring-2 ring-slate-900"
                            />
                          ))}
                          {proj.members.length > 3 && (
                            <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-[9px] font-bold text-slate-300 flex items-center justify-center">
                              +{proj.members.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Timeline */}
                      <td className="py-3.5 px-4">
                        <div className="text-[11px] text-slate-300">
                          <div className="font-mono">{proj.targetEndDate}</div>
                          <span className="text-[10px] text-blue-400 font-semibold">
                            {proj.sprintPhaseRemainingDays > 0 ? `${proj.sprintPhaseRemainingDays} Days Left` : 'Final Sprint'}
                          </span>
                        </div>
                      </td>

                      {/* Circular Progress & Tasks Metric */}
                      <td className="py-3.5 px-4 min-w-[160px]">
                        <div className="flex items-center gap-3">
                          <CircularProgress
                            value={proj.progressPct}
                            size="sm"
                            status={proj.status}
                            strokeWidth={4}
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-200 font-mono">
                              {proj.progressPct}%
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {proj.completedTasks}/{proj.totalTasks} Tasks
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-xs text-blue-400 group-hover:text-blue-300 font-semibold">
                          <span>Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/30 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing <strong className="text-slate-200 font-mono">{filteredProjects.length}</strong> of{' '}
              <strong className="text-slate-200 font-mono">{projects.length}</strong> total projects
            </div>

            <div className="flex items-center gap-1">
              <button className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold text-xs">
                1
              </button>
              <button className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs">
                2
              </button>
              <button className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Grid View with SVG Circular Progress Indicator on each Card */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((proj) => {
            const statusColor = {
              'In Progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
              'Active': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
              'Completed': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
              'Planning': 'bg-slate-500/10 text-slate-300 border-slate-500/20',
              'On Hold': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
              'Blocked': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
            }[proj.status] || 'bg-slate-500/10 text-slate-300';

            return (
              <div
                key={proj.id}
                onClick={() => handleSelectProject(proj)}
                className="bg-slate-900/80 border border-slate-800/80 hover:border-blue-500/50 rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition-all hover:shadow-xl hover:shadow-blue-950/20 group relative overflow-hidden"
              >
                <div>
                  {/* Card Header: Code & Status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {proj.code}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${statusColor}`}>
                      {proj.status}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-300 transition-colors line-clamp-1">
                    {proj.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>

                  {/* SVG-based Circular Progress Hero Section */}
                  <div className="my-4 p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/70 flex items-center justify-between gap-4 group-hover:border-blue-500/30 transition-colors">
                    {/* SVG Circular Ring */}
                    <div className="flex items-center gap-3">
                      <CircularProgress
                        value={proj.progressPct}
                        size="md"
                        status={proj.status}
                        strokeWidth={3.8}
                        showCheckOnComplete={true}
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-100">
                          {proj.completedTasks} / {proj.totalTasks} Tasks
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {proj.status === 'Completed' ? 'All milestones finalized' : 'Milestones completed'}
                        </div>
                      </div>
                    </div>

                    {/* Sprint & Target badge */}
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        TARGET
                      </div>
                      <div className="text-xs font-bold font-mono text-slate-200 mt-0.5">
                        {proj.targetEndDate}
                      </div>
                    </div>
                  </div>

                  {/* Teams & Department Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {proj.department}
                    </span>
                    {proj.teams.slice(0, 2).map((t, idx) => (
                      <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-400 border border-slate-700/50">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3.5 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <img 
                      src={proj.leadAvatar} 
                      alt={proj.leadName} 
                      className="w-5 h-5 rounded-full object-cover ring-1 ring-blue-500/30" 
                    />
                    <span className="text-slate-300 text-[11px] font-medium truncate max-w-[110px]">
                      {proj.leadName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-blue-400 group-hover:text-blue-300 font-semibold">
                    <span>{proj.sprintPhaseRemainingDays > 0 ? `${proj.sprintPhaseRemainingDays}d left` : 'Sprint done'}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

