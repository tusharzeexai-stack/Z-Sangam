import React, { useState } from 'react';
import { 
  CheckSquare, 
  Search, 
  Plus, 
  Calendar as CalendarIcon, 
  Kanban, 
  List, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles,
  ChevronRight,
  Filter,
  UserCheck,
  Tag,
  Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Task } from '../../types';
import { ExportModal } from '../common/ExportModal';
import { ExportDropdown } from '../common/ExportDropdown';
import { exportTasksData } from '../../utils/exportUtils';

export const TasksView: React.FC = () => {
  const { 
    tasks, 
    projects, 
    updateTaskStatus, 
    setIsQuickCreateOpen, 
    showToast 
  } = useApp();

  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar'>('list');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('All');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['To Do', 'In Progress', 'Review', 'Completed']);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(['High', 'Medium', 'Low']);
  const [search, setSearch] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const toggleStatusFilter = (st: string) => {
    if (selectedStatuses.includes(st)) {
      if (selectedStatuses.length > 1) {
        setSelectedStatuses(prev => prev.filter(s => s !== st));
      }
    } else {
      setSelectedStatuses(prev => [...prev, st]);
    }
  };

  const togglePriorityFilter = (pr: string) => {
    if (selectedPriorities.includes(pr)) {
      if (selectedPriorities.length > 1) {
        setSelectedPriorities(prev => prev.filter(p => p !== pr));
      }
    } else {
      setSelectedPriorities(prev => [...prev, pr]);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (selectedProjectFilter !== 'All' && t.projectCode !== selectedProjectFilter) return false;
    if (!selectedStatuses.includes(t.status)) return false;
    if (!selectedPriorities.includes(t.priority)) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.assigneeName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const totalCount = tasks.length;
  const completionPct = Math.round((completedCount / (totalCount || 1)) * 100);

  const handleQuickExportCSV = () => {
    exportTasksData(filteredTasks, 'csv', undefined, { filter: selectedProjectFilter });
    showToast('Tasks Exported', `Downloaded ${filteredTasks.length} tasks as CSV.`, 'success');
  };

  const handleQuickExportJSON = () => {
    exportTasksData(filteredTasks, 'json', undefined, { filter: selectedProjectFilter });
    showToast('Tasks Exported', `Downloaded ${filteredTasks.length} tasks as JSON.`, 'success');
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Task Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Oversee project execution, track individual milestones, and manage cross-departmental delivery.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Switch */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === 'list' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === 'kanban' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === 'calendar' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          </div>

          <ExportDropdown
            id="tasks-export-dropdown"
            label="Export Tasks"
            csvLabel={`Export ${filteredTasks.length} Tasks (.csv)`}
            jsonLabel={`Export ${filteredTasks.length} Tasks (.json)`}
            onExportCSV={handleQuickExportCSV}
            onExportJSON={handleQuickExportJSON}
            onOpenAdvanced={() => setIsExportModalOpen(true)}
          />

          <button
            id="create-task-btn"
            onClick={() => setIsQuickCreateOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Advanced Task Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Task Directory & Worklogs"
        description="Extract administrative task records with assignees, sprint hours, project associations, and status metadata in CSV or JSON."
        itemType="tasks"
        tasks={tasks}
        filteredTasks={filteredTasks}
      />

      {/* Main Grid: Left Filter Sidebar + Right Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Filter & Sprint Progress Panel (3.5 cols) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Filter Panel */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-blue-400" />
                <span>Task Filters</span>
              </span>
              <button
                onClick={() => {
                  setSelectedProjectFilter('All');
                  setSelectedStatuses(['To Do', 'In Progress', 'Review', 'Completed']);
                  setSelectedPriorities(['High', 'Medium', 'Low']);
                  setSearch('');
                }}
                className="text-[11px] text-blue-400 hover:underline font-semibold"
              >
                Reset
              </button>
            </div>

            {/* Search */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Search Title</label>
              <input
                type="text"
                placeholder="Filter by keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Projects Dropdown */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Project Context</label>
              <select
                value={selectedProjectFilter}
                onChange={(e) => setSelectedProjectFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Projects ({projects.length})</option>
                {projects.map(p => (
                  <option key={p.id} value={p.code}>{p.code} - {p.name}</option>
                ))}
              </select>
            </div>

            {/* Status checkboxes */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">Status</label>
              <div className="space-y-1">
                {(['To Do', 'In Progress', 'Review', 'Completed'] as const).map(st => (
                  <label key={st} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/40 cursor-pointer text-xs">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(st)}
                        onChange={() => toggleStatusFilter(st)}
                        className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0"
                      />
                      <span className="text-slate-300 font-medium">{st}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {tasks.filter(t => t.status === st).length}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Priority pills */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">Priority</label>
              <div className="flex gap-1.5">
                {(['High', 'Medium', 'Low'] as const).map(pr => {
                  const isChecked = selectedPriorities.includes(pr);
                  return (
                    <button
                      key={pr}
                      type="button"
                      onClick={() => togglePriorityFilter(pr)}
                      className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold border transition-all ${
                        isChecked
                          ? 'bg-blue-600/20 text-blue-300 border-blue-500/50'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {pr}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sprint Progress Widget */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Sprint Execution Velocity
            </h3>

            <div className="flex items-center gap-4">
              <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-400"
                    strokeDasharray={`${completionPct}, 100`}
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-black text-slate-100 font-mono">{completionPct}%</span>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <div className="text-slate-200 font-bold">{completedCount} Completed</div>
                <div className="text-slate-400">{tasks.length - completedCount} Remaining in sprint</div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-1">
                  On schedule for Sprint delivery
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Work Content Area (8.5 cols) */}
        <div className="lg:col-span-8">
          
          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  {filteredTasks.length} Work Items Found
                </span>
                <span className="text-[11px] text-slate-400">
                  Click checkmark to toggle completed
                </span>
              </div>

              <div className="divide-y divide-slate-800/60">
                {filteredTasks.length === 0 && (
                  <div className="p-12 text-center text-slate-400">
                    <CheckSquare className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                    <p className="text-sm font-semibold text-slate-300">No tasks created yet</p>
                    <p className="text-xs text-slate-400 mt-1 mb-4">Click "Dispatch Task" to assign actionable deliverables.</p>
                    <button
                      onClick={() => setIsQuickCreateOpen(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
                    >
                      + Dispatch Task
                    </button>
                  </div>
                )}
                {filteredTasks.map((task) => {
                  const isDone = task.status === 'Completed';

                  return (
                    <div
                      key={task.id}
                      className={`p-4 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 ${
                        isDone ? 'bg-slate-950/40 opacity-75' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => updateTaskStatus(task.id, isDone ? 'In Progress' : 'Completed')}
                          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                            isDone
                              ? 'bg-emerald-500 border-emerald-400 text-slate-900'
                              : 'border-slate-700 hover:border-blue-500 bg-slate-950'
                          }`}
                        >
                          {isDone && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                        </button>

                        <div className="space-y-1.5 min-w-0 flex-1">
                          <h4 className={`text-xs font-bold text-slate-100 ${isDone ? 'line-through text-slate-400' : ''}`}>
                            {task.title}
                          </h4>

                          <div className="flex items-center gap-2 flex-wrap text-[10px]">
                            <span className="font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {task.projectCode}
                            </span>
                            <span className="text-slate-400 font-medium">
                              {task.projectName}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-400">{task.team}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right metadata / controls on mobile */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/50 w-full sm:w-auto shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          task.priority === 'High'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : task.priority === 'Medium'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {task.priority}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <img
                            src={task.assigneeAvatar}
                            alt={task.assigneeName}
                            title={task.assigneeName}
                            className="w-6 h-6 rounded-full object-cover ring-1 ring-blue-500/30"
                          />
                        </div>

                        {/* Status Select dropdown */}
                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                          className="bg-slate-950 border border-slate-800 text-slate-200 text-[10px] rounded-lg px-2 py-1 focus:outline-none"
                        >
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Review">Review</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Kanban View */}
          {viewMode === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {(['To Do', 'In Progress', 'Review', 'Completed'] as const).map((colStatus) => {
                const colTasks = filteredTasks.filter(t => t.status === colStatus);

                const colColors = {
                  'To Do': 'border-slate-700 text-slate-300',
                  'In Progress': 'border-blue-500 text-blue-400',
                  'Review': 'border-purple-500 text-purple-400',
                  'Completed': 'border-emerald-500 text-emerald-400',
                }[colStatus];

                return (
                  <div key={colStatus} className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col min-h-[500px]">
                    <div className={`flex items-center justify-between pb-3 border-b border-slate-800 font-bold text-xs ${colColors}`}>
                      <span>{colStatus}</span>
                      <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {colTasks.length}
                      </span>
                    </div>

                    <div className="space-y-3 mt-3 flex-1 overflow-y-auto">
                      {colTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 hover:border-blue-500/40 transition-colors shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-blue-400">
                              {task.projectCode}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              task.priority === 'High' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {task.priority}
                            </span>
                          </div>

                          <p className="text-xs font-semibold text-slate-200 line-clamp-2">
                            {task.title}
                          </p>

                          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <img src={task.assigneeAvatar} alt={task.assigneeName} className="w-5 h-5 rounded-full object-cover" />
                              <span className="truncate max-w-[80px]">{task.assigneeName.split(' ')[0]}</span>
                            </div>

                            <select
                              value={task.status}
                              onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                              className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-1 text-[9px]"
                            >
                              <option value="To Do">To Do</option>
                              <option value="In Progress">In Prog</option>
                              <option value="Review">Review</option>
                              <option value="Completed">Done</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-sm font-bold text-slate-100">Sprint Delivery Calendar • Q3 2023</span>
                <span className="text-xs text-blue-400 font-mono font-bold">14 Working Days Remaining</span>
              </div>

              <div className="grid grid-cols-5 gap-3 text-center text-xs">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, idx) => (
                  <div key={idx} className="font-bold text-slate-400 uppercase tracking-wider py-2 bg-slate-950/60 rounded-lg">
                    {day}
                  </div>
                ))}

                {Array.from({ length: 15 }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dayTasks = filteredTasks.slice(idx % filteredTasks.length, (idx % filteredTasks.length) + 1);

                  return (
                    <div
                      key={idx}
                      className="min-h-[90px] p-2 bg-slate-950/40 border border-slate-800/60 rounded-xl text-left flex flex-col justify-between hover:border-slate-700"
                    >
                      <div className="text-[10px] font-mono font-bold text-slate-400">Sep {dayNum}</div>
                      {dayTasks.map(t => (
                        <div key={t.id} className="p-1 rounded bg-blue-600/15 border border-blue-500/30 text-[10px] text-blue-300 font-medium truncate">
                          {t.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
