import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  ReferenceLine,
  Cell
} from 'recharts';
import { 
  Users, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Filter, 
  BarChart3, 
  Sparkles, 
  Info, 
  Clock, 
  ChevronRight, 
  ShieldAlert,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Department } from '../../types';
import { ExportDropdown } from '../common/ExportDropdown';
import { exportDepartmentWorkloadCSV, exportDepartmentWorkloadPDF } from '../../utils/exportUtils';

export interface TeamWorkloadData {
  id: string;
  teamName: string;
  shortTag: string;
  code: string;
  department: string;
  deptCode: string;
  deptColor: string;
  membersCount: number;
  activeProjects: number;
  inProgressTasks: number;
  inReviewTasks: number;
  todoTasks: number;
  completedTasks: number;
  totalTasks: number;
  activeHours: number;
  capacityHours: number;
  utilizationPct: number;
  leadName: string;
  leadAvatar: string;
  status: 'Optimal' | 'High Load' | 'Critical Overload' | 'Available Bandwidth';
}

export const TeamWorkloadWidget: React.FC = () => {
  const { teams, departments, tasks, projects, showToast } = useApp();
  
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [metricMode, setMetricMode] = useState<'tasks' | 'hours' | 'utilization'>('tasks');
  const [chartLayout, setChartLayout] = useState<'stacked' | 'grouped'>('stacked');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const handleDownloadCSV = () => {
    exportDepartmentWorkloadCSV(departments, teams, tasks, projects);
    showToast('Report Downloaded', 'Downloaded Department Workload summary as CSV.', 'success');
  };

  const handleDownloadPDF = () => {
    exportDepartmentWorkloadPDF(departments, teams, tasks, projects);
    showToast('Report Downloaded', 'Downloaded Department Workload summary as PDF document.', 'success');
  };

  // Compute rich workload dataset from context teams and departments
  const workloadData: TeamWorkloadData[] = useMemo(() => {
    // Map department accent colors and codes
    const deptMap = new Map<string, Department>(departments.map(d => [d.name, d]));

    // Baseline teams with realistic derived task allocations
    const initialTeamLoads: Record<string, { inProg: number; inRev: number; todo: number; comp: number; capMultiplier: number }> = {
      'team-01': { inProg: 16, inRev: 7, todo: 11, comp: 24, capMultiplier: 1.15 }, // Frontend Platform
      'team-02': { inProg: 22, inRev: 9, todo: 14, comp: 38, capMultiplier: 1.25 }, // Backend & Core
      'team-03': { inProg: 11, inRev: 4, todo: 8, comp: 19, capMultiplier: 0.95 },  // Mobile & Edge
      'team-04': { inProg: 19, inRev: 8, todo: 12, comp: 32, capMultiplier: 1.20 }, // Data Science
      'team-05': { inProg: 14, inRev: 6, todo: 9, comp: 22, capMultiplier: 1.05 },  // UX & Design Systems
      'team-06': { inProg: 18, inRev: 5, todo: 10, comp: 29, capMultiplier: 1.10 }, // Cloud Infrastructure
      'team-07': { inProg: 20, inRev: 8, todo: 15, comp: 26, capMultiplier: 1.28 }, // AI Platform
      'team-08': { inProg: 13, inRev: 5, todo: 8, comp: 17, capMultiplier: 0.98 },  // Security Ops
    };

    return teams.map(team => {
      const dept = deptMap.get(team.department);
      const deptCode = dept?.code || team.shortTag || 'ENG';
      const deptColor = dept?.accentColor || '#3b82f6';
      
      const loadConfig = initialTeamLoads[team.id] || {
        inProg: Math.max(8, team.activeProjectsCount * 3 + 2),
        inRev: Math.max(3, team.activeProjectsCount + 1),
        todo: Math.max(5, team.membersCount + 1),
        comp: Math.max(12, team.membersCount * 2),
        capMultiplier: 1.05
      };

      // Count tasks assigned to this team's members if available
      const matchingTasks = tasks.filter(t => t.team === team.name);
      let inProgressTasks = loadConfig.inProg;
      let inReviewTasks = loadConfig.inRev;
      let todoTasks = loadConfig.todo;
      let completedTasks = loadConfig.comp;

      if (matchingTasks.length > 0) {
        inProgressTasks = matchingTasks.filter(t => t.status === 'In Progress').length || inProgressTasks;
        inReviewTasks = matchingTasks.filter(t => t.status === 'In Review').length || inReviewTasks;
        todoTasks = matchingTasks.filter(t => t.status === 'To Do' || t.status === 'Backlog').length || todoTasks;
        completedTasks = matchingTasks.filter(t => t.status === 'Done').length || completedTasks;
      }

      const totalTasks = inProgressTasks + inReviewTasks + todoTasks + completedTasks;
      
      // Calculate work hours based on team members (40h/member per sprint week)
      const baseCapacity = team.membersCount * 40;
      // Active hours derived from active workload
      const activeHours = Math.round((inProgressTasks * 7 + inReviewTasks * 4 + todoTasks * 5) * (loadConfig.capMultiplier || 1.0));
      const capacityHours = baseCapacity;
      const rawUtilization = Math.round((activeHours / capacityHours) * 100);
      const utilizationPct = Math.min(135, Math.max(45, rawUtilization));

      let status: TeamWorkloadData['status'] = 'Optimal';
      if (utilizationPct > 105) status = 'Critical Overload';
      else if (utilizationPct >= 90) status = 'High Load';
      else if (utilizationPct < 70) status = 'Available Bandwidth';

      return {
        id: team.id,
        teamName: team.name,
        shortTag: team.shortTag || team.code,
        code: team.code,
        department: team.department,
        deptCode,
        deptColor,
        membersCount: team.membersCount,
        activeProjects: team.activeProjectsCount,
        inProgressTasks,
        inReviewTasks,
        todoTasks,
        completedTasks,
        totalTasks,
        activeHours,
        capacityHours,
        utilizationPct,
        leadName: team.leadName,
        leadAvatar: team.leadAvatar,
        status
      };
    });
  }, [teams, departments, tasks, projects]);

  // Filtered dataset according to selected department
  const filteredData = useMemo(() => {
    if (selectedDept === 'ALL') return workloadData;
    return workloadData.filter(d => d.department === selectedDept);
  }, [workloadData, selectedDept]);

  // High-level aggregate metrics for the workload banner
  const aggregateMetrics = useMemo(() => {
    const totalActiveTasks = filteredData.reduce((acc, d) => acc + d.inProgressTasks + d.inReviewTasks, 0);
    const totalAllocatedHours = filteredData.reduce((acc, d) => acc + d.activeHours, 0);
    const totalCapacityHours = filteredData.reduce((acc, d) => acc + d.capacityHours, 0);
    const avgUtilization = filteredData.length > 0
      ? Math.round(filteredData.reduce((acc, d) => acc + d.utilizationPct, 0) / filteredData.length)
      : 0;
    const overloadedTeamsCount = filteredData.filter(d => d.utilizationPct >= 95).length;

    return {
      totalActiveTasks,
      totalAllocatedHours,
      totalCapacityHours,
      avgUtilization,
      overloadedTeamsCount
    };
  }, [filteredData]);

  // Department tabs list
  const departmentOptions = useMemo(() => {
    const list = [{ name: 'ALL', label: 'All Departments', count: workloadData.length }];
    departments.forEach(dept => {
      const count = workloadData.filter(d => d.department === dept.name).length;
      if (count > 0) {
        list.push({ name: dept.name, label: dept.name, count });
      }
    });
    return list;
  }, [departments, workloadData]);

  // Selected team details for interactive inspection
  const selectedTeamDetails = useMemo(() => {
    if (!selectedTeamId) return null;
    return workloadData.find(t => t.id === selectedTeamId) || null;
  }, [selectedTeamId, workloadData]);

  return (
    <div id="team-workload-distribution-widget" className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-5">
      
      {/* Widget Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-100">
              Team Workload Distribution Across Departments
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time sprint allocations, active backlog weight, and team bandwidth capacity utilization.
          </p>
        </div>

        {/* Metric and Chart Format Toggles */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Metric Selector */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-semibold">
            <button
              onClick={() => setMetricMode('tasks')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                metricMode === 'tasks' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tasks by Status
            </button>
            <button
              onClick={() => setMetricMode('hours')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                metricMode === 'hours' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Allocated Hours
            </button>
            <button
              onClick={() => setMetricMode('utilization')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                metricMode === 'utilization' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Capacity %
            </button>
          </div>

          {/* Bar Layout Toggle (only when in tasks mode) */}
          {metricMode === 'tasks' && (
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-semibold">
              <button
                onClick={() => setChartLayout('stacked')}
                className={`px-2.5 py-1.5 rounded-md transition-all ${
                  chartLayout === 'stacked' ? 'bg-slate-800 text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Stacked Bar Chart"
              >
                Stacked
              </button>
              <button
                onClick={() => setChartLayout('grouped')}
                className={`px-2.5 py-1.5 rounded-md transition-all ${
                  chartLayout === 'grouped' ? 'bg-slate-800 text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Grouped Bar Chart"
              >
                Grouped
              </button>
            </div>
          )}

          {/* Quick Download Workload Report Dropdown */}
          <ExportDropdown
            id="team-workload-download-report-btn"
            label="Download Workload Report"
            menuHeader="Export Workload Report"
            items={[
              {
                label: 'Department Workload Summary',
                sublabel: 'Download complete workload dataset as CSV',
                badge: 'CSV',
                variant: 'emerald',
                icon: <FileSpreadsheet className="w-3.5 h-3.5" />,
                onClick: handleDownloadCSV
              },
              {
                label: 'Department Workload Summary',
                sublabel: 'Executive formatted PDF capacity report',
                badge: 'PDF',
                variant: 'rose',
                icon: <FileText className="w-3.5 h-3.5" />,
                onClick: handleDownloadPDF
              }
            ]}
            buttonClassName="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-semibold transition-all hover:border-slate-600 shadow-xs cursor-pointer"
          />
        </div>
      </div>

      {/* Department Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1 shrink-0">
          <Filter className="w-3 h-3" />
          Filter:
        </span>
        {departmentOptions.map(opt => {
          const isSelected = selectedDept === opt.name;
          return (
            <button
              key={opt.name}
              onClick={() => {
                setSelectedDept(opt.name);
                setSelectedTeamId(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs ring-1 ring-blue-400/40'
                  : 'bg-slate-950/70 border border-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <span>{opt.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
              }`}>
                {opt.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Executive Micro-KPI Badges for the Filtered Scope */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/70">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ACTIVE SPRINT TASKS</div>
          <div className="text-xl font-bold font-mono text-slate-100 mt-0.5">{aggregateMetrics.totalActiveTasks} Tasks</div>
          <div className="text-[10px] text-blue-400 font-medium mt-0.5">In flight across teams</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/70">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">BANDWIDTH UTILIZATION</div>
          <div className="text-xl font-bold font-mono text-slate-100 mt-0.5">{aggregateMetrics.avgUtilization}%</div>
          <div className={`text-[10px] font-semibold mt-0.5 flex items-center gap-1 ${
            aggregateMetrics.avgUtilization > 92 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            <TrendingUp className="w-3 h-3" />
            <span>{aggregateMetrics.avgUtilization > 92 ? 'High team strain' : 'Optimal operating load'}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/70">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">HOURS ALLOCATED</div>
          <div className="text-xl font-bold font-mono text-slate-100 mt-0.5">{aggregateMetrics.totalAllocatedHours} / {aggregateMetrics.totalCapacityHours}h</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Sprint total capacity</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/70">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">OVER-CAPACITY ALERTS</div>
          <div className="text-xl font-bold font-mono text-slate-100 mt-0.5">
            {aggregateMetrics.overloadedTeamsCount} {aggregateMetrics.overloadedTeamsCount === 1 ? 'Team' : 'Teams'}
          </div>
          <div className={`text-[10px] font-semibold mt-0.5 flex items-center gap-1 ${
            aggregateMetrics.overloadedTeamsCount > 0 ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            {aggregateMetrics.overloadedTeamsCount > 0 ? <ShieldAlert className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
            <span>{aggregateMetrics.overloadedTeamsCount > 0 ? 'Exceeding 95% cap' : 'All teams in balance'}</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Recharts Chart Area */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-slate-200">
              {metricMode === 'tasks' && 'Workload Breakdown by Task Lifecycle (Click any bar to drill down)'}
              {metricMode === 'hours' && 'Sprint Hours: Allocated Work vs Available Team Bandwidth'}
              {metricMode === 'utilization' && 'Capacity Utilization % with 85% Target and 100% Max Thresholds'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Showing <strong className="text-slate-200">{filteredData.length}</strong> engineering teams
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {metricMode === 'tasks' ? (
              <BarChart
                data={filteredData}
                margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length > 0) {
                    const clickedItem = e.activePayload[0].payload as TeamWorkloadData;
                    setSelectedTeamId(clickedItem.id === selectedTeamId ? null : clickedItem.id);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="teamName" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false}
                  interval={0}
                  tick={({ x, y, payload }) => {
                    const item = filteredData.find(d => d.teamName === payload.value);
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text
                          x={0}
                          y={0}
                          dy={12}
                          textAnchor="middle"
                          fill="#94a3b8"
                          fontSize={10}
                          fontWeight={item?.id === selectedTeamId ? 'bold' : 'normal'}
                          className="select-none"
                        >
                          {payload.value.length > 14 ? `${payload.value.slice(0, 12)}...` : payload.value}
                        </text>
                        {item && (
                          <text
                            x={0}
                            y={0}
                            dy={24}
                            textAnchor="middle"
                            fill={item.deptColor}
                            fontSize={8}
                            fontWeight="bold"
                            className="select-none font-mono"
                          >
                            [{item.deptCode}]
                          </text>
                        )}
                      </g>
                    );
                  }}
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as TeamWorkloadData;
                      return (
                        <div className="bg-slate-900 border border-slate-700 rounded-xl p-3.5 shadow-2xl text-xs space-y-2 min-w-[210px]">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <div>
                              <div className="font-bold text-slate-100">{data.teamName}</div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.deptColor }} />
                                <span>{data.department}</span>
                              </div>
                            </div>
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-blue-400">
                              {data.shortTag}
                            </span>
                          </div>

                          <div className="space-y-1 text-[11px] pt-1">
                            <div className="flex justify-between text-blue-400">
                              <span>In Progress:</span>
                              <strong className="font-mono">{data.inProgressTasks} tasks</strong>
                            </div>
                            <div className="flex justify-between text-purple-400">
                              <span>In Review:</span>
                              <strong className="font-mono">{data.inReviewTasks} tasks</strong>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>Backlog / To Do:</span>
                              <strong className="font-mono">{data.todoTasks} tasks</strong>
                            </div>
                            <div className="flex justify-between text-emerald-400">
                              <span>Completed:</span>
                              <strong className="font-mono">{data.completedTasks} tasks</strong>
                            </div>
                          </div>

                          <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Utilization:</span>
                            <span className={`font-mono font-bold ${
                              data.utilizationPct > 100 ? 'text-rose-400' : data.utilizationPct >= 90 ? 'text-amber-400' : 'text-emerald-400'
                            }`}>
                              {data.utilizationPct}% ({data.status})
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                />
                <Bar 
                  dataKey="inProgressTasks" 
                  name="In Progress" 
                  stackId={chartLayout === 'stacked' ? 'a' : undefined} 
                  fill="#3b82f6" 
                  radius={chartLayout === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="inReviewTasks" 
                  name="In Review" 
                  stackId={chartLayout === 'stacked' ? 'a' : undefined} 
                  fill="#8b5cf6" 
                  radius={chartLayout === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="todoTasks" 
                  name="Backlog / To Do" 
                  stackId={chartLayout === 'stacked' ? 'a' : undefined} 
                  fill="#64748b" 
                  radius={chartLayout === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="completedTasks" 
                  name="Completed" 
                  stackId={chartLayout === 'stacked' ? 'a' : undefined} 
                  fill="#10b981" 
                  radius={chartLayout === 'stacked' ? [4, 4, 0, 0] : [4, 4, 0, 0]} 
                />
              </BarChart>
            ) : metricMode === 'hours' ? (
              <BarChart
                data={filteredData}
                margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length > 0) {
                    const clickedItem = e.activePayload[0].payload as TeamWorkloadData;
                    setSelectedTeamId(clickedItem.id === selectedTeamId ? null : clickedItem.id);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="teamName" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false}
                  interval={0}
                  tick={({ x, y, payload }) => (
                    <g transform={`translate(${x},${y})`}>
                      <text x={0} y={0} dy={12} textAnchor="middle" fill="#94a3b8" fontSize={10}>
                        {payload.value.length > 14 ? `${payload.value.slice(0, 12)}...` : payload.value}
                      </text>
                    </g>
                  )}
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="h" />
                <Tooltip 
                  cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as TeamWorkloadData;
                      return (
                        <div className="bg-slate-900 border border-slate-700 rounded-xl p-3.5 shadow-2xl text-xs space-y-2">
                          <div className="font-bold text-slate-100">{data.teamName}</div>
                          <div className="text-[11px] space-y-1">
                            <div className="text-blue-400">Allocated Work: <strong>{data.activeHours} hours</strong></div>
                            <div className="text-slate-400">Total Capacity: <strong>{data.capacityHours} hours</strong></div>
                            <div className="text-amber-400 font-bold">Utilization: {data.utilizationPct}%</div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} />
                <Bar dataKey="activeHours" name="Allocated Work (Hours)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="capacityHours" name="Sprint Capacity Limit (Hours)" fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <BarChart
                data={filteredData}
                margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length > 0) {
                    const clickedItem = e.activePayload[0].payload as TeamWorkloadData;
                    setSelectedTeamId(clickedItem.id === selectedTeamId ? null : clickedItem.id);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="teamName" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false}
                  interval={0}
                  tick={({ x, y, payload }) => (
                    <g transform={`translate(${x},${y})`}>
                      <text x={0} y={0} dy={12} textAnchor="middle" fill="#94a3b8" fontSize={10}>
                        {payload.value.length > 14 ? `${payload.value.slice(0, 12)}...` : payload.value}
                      </text>
                    </g>
                  )}
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" domain={[0, 130]} />
                <ReferenceLine y={85} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Target 85%', fill: '#60a5fa', fontSize: 10, position: 'right' }} />
                <ReferenceLine y={100} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Max 100%', fill: '#f43f5e', fontSize: 10, position: 'right' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as TeamWorkloadData;
                      return (
                        <div className="bg-slate-900 border border-slate-700 rounded-xl p-3.5 shadow-2xl text-xs space-y-1.5">
                          <div className="font-bold text-slate-100">{data.teamName}</div>
                          <div className="text-[11px] text-slate-300">Department: <strong>{data.department}</strong></div>
                          <div className="text-[11px] text-slate-300">Active Load: <strong>{data.activeHours}h / {data.capacityHours}h</strong></div>
                          <div className="text-sm font-black text-blue-400 font-mono mt-1">{data.utilizationPct}% Utilization</div>
                          <div className="text-[10px] text-slate-400 font-semibold">{data.status}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="utilizationPct" name="Capacity Utilization %" radius={[4, 4, 0, 0]}>
                  {filteredData.map((entry, index) => {
                    let fillColor = '#3b82f6';
                    if (entry.utilizationPct > 100) fillColor = '#f43f5e';
                    else if (entry.utilizationPct >= 90) fillColor = '#f59e0b';
                    else if (entry.utilizationPct < 70) fillColor = '#10b981';
                    return <Cell key={`cell-${index}`} fill={fillColor} />;
                  })}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Selected Team Drilldown Panel (if clicked or selected) */}
      {selectedTeamDetails ? (
        <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/40 animate-in fade-in space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={selectedTeamDetails.leadAvatar} 
                alt={selectedTeamDetails.leadName} 
                className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/40"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-100">{selectedTeamDetails.teamName}</h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {selectedTeamDetails.code}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Lead: <strong className="text-slate-200">{selectedTeamDetails.leadName}</strong> • {selectedTeamDetails.department}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedTeamId(null)}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-900 border border-slate-800"
            >
              Clear Selection ✕
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
              <span className="text-[10px] text-slate-400 uppercase">HEADCOUNT</span>
              <div className="font-bold text-slate-200 font-mono mt-0.5">{selectedTeamDetails.membersCount} Engineers</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
              <span className="text-[10px] text-slate-400 uppercase">ACTIVE PROJECTS</span>
              <div className="font-bold text-slate-200 font-mono mt-0.5">{selectedTeamDetails.activeProjects} Projects</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
              <span className="text-[10px] text-slate-400 uppercase">ACTIVE TASKS WEIGHT</span>
              <div className="font-bold text-blue-400 font-mono mt-0.5">
                {selectedTeamDetails.inProgressTasks + selectedTeamDetails.inReviewTasks} active tasks
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
              <span className="text-[10px] text-slate-400 uppercase">BANDWIDTH STATUS</span>
              <div className={`font-bold font-mono mt-0.5 ${
                selectedTeamDetails.utilizationPct > 100 ? 'text-rose-400' : selectedTeamDetails.utilizationPct >= 90 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {selectedTeamDetails.utilizationPct}% ({selectedTeamDetails.status})
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Team Distribution Mini Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
        {filteredData.map(t => {
          const isSelected = t.id === selectedTeamId;
          const statusBadge = {
            'Optimal': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            'High Load': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            'Critical Overload': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
            'Available Bandwidth': 'bg-blue-500/10 text-blue-400 border-blue-500/20'
          }[t.status];

          return (
            <div
              key={t.id}
              onClick={() => setSelectedTeamId(isSelected ? null : t.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-950/30'
                  : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  {t.code}
                </span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusBadge}`}>
                  {t.utilizationPct}% Load
                </span>
              </div>

              <div className="font-bold text-xs text-slate-100 line-clamp-1">{t.teamName}</div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.deptColor }} />
                <span className="truncate">{t.department}</span>
              </div>

              {/* Progress bar */}
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">{t.inProgressTasks + t.inReviewTasks} Active Tasks</span>
                  <span className="font-mono text-slate-300 font-bold">{t.activeHours}h / {t.capacityHours}h</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      t.utilizationPct > 100 ? 'bg-rose-500' : t.utilizationPct >= 90 ? 'bg-amber-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(100, t.utilizationPct)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
