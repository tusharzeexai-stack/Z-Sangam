import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { MOCK_ANALYTICS } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { ExportModal } from '../common/ExportModal';
import { ExportDropdown } from '../common/ExportDropdown';
import { 
  exportAnalyticsReport, 
  exportDepartmentWorkloadCSV, 
  exportDepartmentWorkloadPDF 
} from '../../utils/exportUtils';
import { TeamWorkloadWidget } from './TeamWorkloadWidget';
import { FileSpreadsheet, FileText, FileCode2, BarChart2, Users } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { showToast, projects, departments, teams, tasks } = useApp();
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | 'YTD'>('1M');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const chartData = {
    '1M': MOCK_ANALYTICS.trendData1M,
    '3M': MOCK_ANALYTICS.trendData3M,
    'YTD': MOCK_ANALYTICS.trendDataYTD,
  }[timeframe];

  // Workload summary exports
  const handleExportWorkloadCSV = () => {
    exportDepartmentWorkloadCSV(departments, teams, tasks, projects);
    showToast('Report Downloaded', 'Downloaded Department Workload summary as CSV.', 'success');
  };

  const handleExportWorkloadPDF = () => {
    exportDepartmentWorkloadPDF(departments, teams, tasks, projects);
    showToast('Report Downloaded', 'Generated & downloaded executive Department Workload report as PDF.', 'success');
  };

  const handleQuickExportCSV = () => {
    exportAnalyticsReport(MOCK_ANALYTICS, timeframe, 'csv', projects, departments);
    showToast('Analytics Exported', `Downloaded ${timeframe} executive telemetry report as CSV.`, 'success');
  };

  const handleQuickExportJSON = () => {
    exportAnalyticsReport(MOCK_ANALYTICS, timeframe, 'json', projects, departments);
    showToast('Analytics Exported', `Downloaded ${timeframe} executive telemetry report as JSON.`, 'success');
  };

  // Dedicated menu items for the Download Report button
  const downloadReportItems = [
    {
      label: 'Department Workload Summary',
      sublabel: 'Spreadsheet of department & team capacity, utilization & tasks',
      badge: 'CSV',
      variant: 'emerald' as const,
      icon: <FileSpreadsheet className="w-3.5 h-3.5" />,
      onClick: handleExportWorkloadCSV
    },
    {
      label: 'Department Workload Summary',
      sublabel: 'Print-ready executive PDF scorecard with capacity charts',
      badge: 'PDF',
      variant: 'rose' as const,
      icon: <FileText className="w-3.5 h-3.5" />,
      onClick: handleExportWorkloadPDF
    },
    {
      isDivider: true,
      label: '',
      onClick: () => {}
    },
    {
      label: `Executive Telemetry & KPIs (${timeframe})`,
      sublabel: 'Full sprint velocity, task distribution & department benchmarks',
      badge: 'CSV',
      variant: 'blue' as const,
      icon: <BarChart2 className="w-3.5 h-3.5" />,
      onClick: handleQuickExportCSV
    },
    {
      label: `Executive Telemetry & KPIs (${timeframe})`,
      sublabel: 'Hierarchical analytics payload for downstream auditing',
      badge: 'JSON',
      variant: 'purple' as const,
      icon: <FileCode2 className="w-3.5 h-3.5" />,
      onClick: handleQuickExportJSON
    }
  ];

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Analytics & Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Deep telemetry, cross-departmental delivery benchmarks and real-time execution analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-semibold">
            {(['1M', '3M', 'YTD'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  timeframe === tf ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf === '1M' ? 'Last 30 Days' : tf === '3M' ? 'Quarter-to-Date' : 'Year-to-Date'}
              </button>
            ))}
          </div>

          {/* Prominent Download Report Button */}
          <ExportDropdown
            id="analytics-download-report-btn"
            label="Download Report"
            menuHeader="Download Workload & Analytics Reports"
            items={downloadReportItems}
            onOpenAdvanced={() => setIsExportModalOpen(true)}
            buttonClassName="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-900/20 hover:shadow-blue-900/40 active:scale-98 cursor-pointer"
          />
        </div>
      </div>

      {/* Advanced Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Administrative Analytics Report"
        description="Compile organizational KPIs, sprint velocity trends, department scorecards, and project health into CSV or JSON format."
        itemType="analytics"
        timeframe={timeframe}
        analytics={MOCK_ANALYTICS}
        projects={projects}
        departments={departments}
      />

      {/* 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">PROJECT COMPLETION RATE</span>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-1">{MOCK_ANALYTICS.kpis.projectCompletionRate.value}</div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>{MOCK_ANALYTICS.kpis.projectCompletionRate.change} vs baseline</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">TEAM PRODUCTIVITY SCORE</span>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-1">{MOCK_ANALYTICS.kpis.teamProductivityScore.value}</div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>{MOCK_ANALYTICS.kpis.teamProductivityScore.change} sprint velocity</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">DEPT. PERFORMANCE INDEX</span>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-1">{MOCK_ANALYTICS.kpis.deptPerformanceIndex.value}</div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>{MOCK_ANALYTICS.kpis.deptPerformanceIndex.change} rating</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ON-TIME DELIVERY RATE</span>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-1">{MOCK_ANALYTICS.kpis.onTimeDeliveryRate.value}</div>
          <div className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold mt-1">
            <ArrowDownRight className="w-3 h-3" />
            <span>{MOCK_ANALYTICS.kpis.onTimeDeliveryRate.change} buffer shift</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Area Chart + Donut Task Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Project Completion Trends (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Project Completion Velocity Trends</h3>
              <p className="text-xs text-slate-400">Planned vs Actual completed milestones over timeframe</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-300">Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                <span className="text-slate-400">Planned Target</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="completed" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#completedGrad)" />
                <Area type="monotone" dataKey="planned" stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Distribution Donut (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100">Task Distribution</h3>
            <p className="text-xs text-slate-400">Status breakdown across sprint backlog</p>
          </div>

          <div className="h-44 relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_ANALYTICS.taskDistribution}
                  innerRadius={46}
                  outerRadius={68}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {MOCK_ANALYTICS.taskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-100 font-mono">100%</span>
              <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">SPRINT</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {MOCK_ANALYTICS.taskDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-100 font-mono">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Cross-Departmental Team Workload Distribution Widget (Recharts) */}
      <TeamWorkloadWidget />

      {/* Bottom Row: Dept Performance Bars + Workload Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Dept Performance (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100">Department Performance Benchmarks</h3>
            <p className="text-xs text-slate-400">Score vs Target Goal (100 Pt Scale)</p>
          </div>

          <div className="space-y-3 pt-2">
            {MOCK_ANALYTICS.deptPerformance.map((dept, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{dept.name}</span>
                  <span className="font-mono text-slate-300 font-bold">{dept.score}% (Target: {dept.target}%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${dept.score >= dept.target ? 'bg-blue-500' : 'bg-rose-500'}`}
                    style={{ width: `${dept.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GitHub-style Workload Heatmap (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Organizational Workload Heatmap</h3>
              <p className="text-xs text-slate-400">Commit frequency and PR review density across 10 weeks</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span>Less</span>
              <span className="w-2.5 h-2.5 rounded bg-slate-800" />
              <span className="w-2.5 h-2.5 rounded bg-blue-900/60" />
              <span className="w-2.5 h-2.5 rounded bg-blue-600/70" />
              <span className="w-2.5 h-2.5 rounded bg-blue-500" />
              <span className="w-2.5 h-2.5 rounded bg-blue-400" />
              <span>More</span>
            </div>
          </div>

          <div className="pt-2 overflow-x-auto">
            <div className="grid grid-flow-col grid-rows-5 gap-2 min-w-[340px]">
              {MOCK_ANALYTICS.weeklyWorkloadHeatmap.flatMap((week, wIdx) => 
                week.map((intensity, dIdx) => {
                  const intensityBg = [
                    'bg-slate-800/50',
                    'bg-blue-950/80 border border-blue-900/40',
                    'bg-blue-800/70 border border-blue-700/50',
                    'bg-blue-600/80',
                    'bg-blue-500',
                    'bg-blue-400'
                  ][intensity];

                  return (
                    <div
                      key={`${wIdx}-${dIdx}`}
                      title={`Week ${wIdx + 1}, Day ${dIdx + 1}: ${intensity * 12} commits`}
                      className={`w-6 h-6 rounded-md ${intensityBg} transition-transform hover:scale-125 cursor-pointer`}
                    />
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Peak velocity detected on mid-sprint Wednesdays</span>
            <span className="text-emerald-400 font-semibold font-mono">1,240 Total Activity Signals</span>
          </div>
        </div>

      </div>
    </div>
  );
};
