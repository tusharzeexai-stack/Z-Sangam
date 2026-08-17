import React, { useState, useMemo } from 'react';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  FileCode2, 
  FileText,
  Copy, 
  Check, 
  SlidersHorizontal, 
  Eye, 
  Sparkles,
  Info,
  Layers,
  Database
} from 'lucide-react';
import { Task, Project, Department } from '../../types';
import { 
  exportTasksData, 
  exportAnalyticsReport, 
  exportProjectsData,
  exportDepartmentWorkloadCSV,
  exportDepartmentWorkloadPDF,
  convertToCSV,
  TASK_CSV_COLUMNS,
  PROJECT_CSV_COLUMNS,
  copyTextToClipboard
} from '../../utils/exportUtils';
import { useApp } from '../../context/AppContext';

export interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  itemType: 'analytics' | 'tasks' | 'projects' | 'project-tasks';
  tasks?: Task[];
  filteredTasks?: Task[];
  timeframe?: '1M' | '3M' | 'YTD';
  projects?: Project[];
  project?: Project;
  departments?: Department[];
  analytics?: any;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  itemType,
  tasks = [],
  filteredTasks,
  timeframe = '1M',
  projects = [],
  project,
  departments = [],
  analytics
}) => {
  const { showToast, teams } = useApp();
  const [format, setFormat] = useState<'csv' | 'pdf' | 'json'>('csv');
  const [taskScope, setTaskScope] = useState<'filtered' | 'all'>('filtered');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1M' | '3M' | 'YTD'>(timeframe);
  const [customFilename, setCustomFilename] = useState('');
  const [copied, setCopied] = useState(false);
  const [previewTab, setPreviewTab] = useState<'preview' | 'schema'>('preview');

  // Task filter checkboxes
  const [includeTags, setIncludeTags] = useState(true);
  const [includeEstimatedHours, setIncludeEstimatedHours] = useState(true);
  const [includeAssignees, setIncludeAssignees] = useState(true);

  // Analytics options
  const [includeKPIs, setIncludeKPIs] = useState(true);
  const [includeVelocity, setIncludeVelocity] = useState(true);
  const [includeDeptBenchmarks, setIncludeDeptBenchmarks] = useState(true);
  const [includePortfolioRollup, setIncludePortfolioRollup] = useState(true);

  // Determine active task set
  const activeTasks = useMemo(() => {
    if (itemType === 'project-tasks' && project) {
      return tasks.filter(t => t.projectCode === project.code);
    }
    if (taskScope === 'filtered' && filteredTasks) {
      return filteredTasks;
    }
    return tasks;
  }, [itemType, project, taskScope, filteredTasks, tasks]);

  // Generate preview content
  const previewData = useMemo(() => {
    if (itemType === 'tasks' || itemType === 'project-tasks') {
      const selectedCols = TASK_CSV_COLUMNS.filter(col => {
        if (col.key === 'tags' && !includeTags) return false;
        if (col.key === 'estimatedHours' && !includeEstimatedHours) return false;
        if (col.key === 'assigneeName' && !includeAssignees) return false;
        return true;
      });

      if (format === 'csv') {
        const slice = activeTasks.slice(0, 4);
        return convertToCSV(slice, selectedCols);
      } else {
        const sample = {
          reportType: 'Administrative Task Inventory Report',
          exportedAt: new Date().toISOString(),
          recordCount: activeTasks.length,
          scope: taskScope,
          sampleTasks: activeTasks.slice(0, 2).map(t => ({
            id: t.id,
            title: t.title,
            projectCode: t.projectCode,
            projectName: t.projectName,
            department: t.department,
            assignee: includeAssignees ? t.assigneeName : undefined,
            priority: t.priority,
            status: t.status,
            dueDate: t.dueDate,
            estimatedHours: includeEstimatedHours ? t.estimatedHours : undefined,
            tags: includeTags ? t.tags : undefined
          }))
        };
        return JSON.stringify(sample, null, 2);
      }
    } else if (itemType === 'analytics' && analytics) {
      if (format === 'csv') {
        return [
          '"--- ADMINISTRATIVE EXECUTIVE REPORT: Z-SANGAM TELEMETRY ---"',
          `"Generated: ${new Date().toLocaleDateString()}"`,
          `"Timeframe: ${selectedTimeframe}"`,
          '',
          '"=== KEY PERFORMANCE INDICATORS ==="',
          '"Metric","Value","Trend Variance"',
          `"Project Completion Rate","${analytics.kpis.projectCompletionRate.value}","${analytics.kpis.projectCompletionRate.change}"`,
          `"Team Productivity Score","${analytics.kpis.teamProductivityScore.value}","${analytics.kpis.teamProductivityScore.change}"`,
          `"Dept Performance Index","${analytics.kpis.deptPerformanceIndex.value}","${analytics.kpis.deptPerformanceIndex.change}"`,
          `"On-Time Delivery Rate","${analytics.kpis.onTimeDeliveryRate.value}","${analytics.kpis.onTimeDeliveryRate.change}"`,
          '...'
        ].join('\n');
      } else {
        return JSON.stringify({
          reportType: 'Administrative Analytics & Telemetry Report',
          timeframe: selectedTimeframe,
          generatedAt: new Date().toISOString(),
          kpis: includeKPIs ? analytics.kpis : undefined,
          velocityTrendsSample: includeVelocity ? (analytics[`trendData${selectedTimeframe}`] || analytics.trendData1M) : undefined,
          departmentBenchmarks: includeDeptBenchmarks ? analytics.deptPerformance : undefined,
          portfolioSummary: includePortfolioRollup ? { totalProjects: projects.length } : undefined
        }, null, 2);
      }
    } else if (itemType === 'projects') {
      if (format === 'csv') {
        const slice = projects.slice(0, 3);
        return convertToCSV(slice, PROJECT_CSV_COLUMNS);
      } else {
        return JSON.stringify({
          reportType: 'Project Portfolio Administrative Report',
          totalProjects: projects.length,
          sampleProjects: projects.slice(0, 2)
        }, null, 2);
      }
    }
    return '';
  }, [
    itemType, format, activeTasks, includeTags, includeEstimatedHours, includeAssignees,
    taskScope, selectedTimeframe, analytics, includeKPIs, includeVelocity, 
    includeDeptBenchmarks, includePortfolioRollup, projects
  ]);

  if (!isOpen) return null;

  const defaultBaseName = () => {
    const d = new Date().toISOString().split('T')[0];
    if (itemType === 'tasks') return `zsangam-tasks-${taskScope}-${d}`;
    if (itemType === 'project-tasks' && project) return `zsangam-tasks-${project.code.toLowerCase()}-${d}`;
    if (itemType === 'analytics') return `zsangam-analytics-${selectedTimeframe.toLowerCase()}-${d}`;
    if (itemType === 'projects') return `zsangam-projects-portfolio-${d}`;
    return `zsangam-report-${d}`;
  };

  const currentFilename = customFilename.trim() ? customFilename.trim() : defaultBaseName();
  const fullFilename = `${currentFilename}.${format}`;

  const handleDownload = () => {
    if (itemType === 'tasks' || itemType === 'project-tasks') {
      const selectedCols = TASK_CSV_COLUMNS.filter(col => {
        if (col.key === 'tags' && !includeTags) return false;
        if (col.key === 'estimatedHours' && !includeEstimatedHours) return false;
        if (col.key === 'assigneeName' && !includeAssignees) return false;
        return true;
      });

      if (format === 'csv') {
        const finalTasks = activeTasks.map(t => ({
          ...t,
          tags: includeTags ? t.tags : [],
          estimatedHours: includeEstimatedHours ? t.estimatedHours : 0,
          assigneeName: includeAssignees ? t.assigneeName : ''
        }));
        exportTasksData(finalTasks, 'csv', currentFilename);
      } else {
        exportTasksData(activeTasks, 'json', currentFilename, {
          scope: taskScope,
          projectCode: project?.code,
          filtersApplied: {
            includeTags,
            includeEstimatedHours,
            includeAssignees
          }
        });
      }
      showToast('Export Successful', `Downloaded ${activeTasks.length} tasks as ${format.toUpperCase()}.`, 'success');
    } else if (itemType === 'analytics' && analytics) {
      if (format === 'pdf') {
        exportDepartmentWorkloadPDF(departments, teams, tasks, projects, currentFilename);
        showToast('Department Workload Exported', 'Generated & downloaded executive Department Workload report as PDF.', 'success');
      } else {
        exportAnalyticsReport(analytics, selectedTimeframe, format, projects, departments, currentFilename);
        showToast('Analytics Exported', `Downloaded executive telemetry report as ${format.toUpperCase()}.`, 'success');
      }
    } else if (itemType === 'projects') {
      exportProjectsData(projects, format === 'json' ? 'json' : 'csv', currentFilename);
      showToast('Projects Exported', `Downloaded ${projects.length} projects portfolio as ${format.toUpperCase()}.`, 'success');
    }

    onClose();
  };

  const handleCopy = async () => {
    const success = await copyTextToClipboard(previewData);
    if (success) {
      setCopied(true);
      showToast('Copied to Clipboard', 'Export payload ready to paste into spreadsheet or reporting tool.', 'success');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const recordCount = () => {
    if (itemType === 'tasks' || itemType === 'project-tasks') return `${activeTasks.length} Tasks`;
    if (itemType === 'analytics') return `${selectedTimeframe} Telemetry Metrics & KPIs`;
    if (itemType === 'projects') return `${projects.length} Projects`;
    return '0 Records';
  };

  return (
    <div 
      id="export-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div 
        id="export-modal-container"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                {title}
              </h2>
              <p className="text-xs text-slate-400">
                {description || 'Generate administrative reports and structured datasets for downstream processing.'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Format Selection Cards */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
              Select Output Format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* CSV Option */}
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  format === 'csv'
                    ? 'bg-blue-600/10 border-blue-500 text-blue-400 ring-1 ring-blue-500/40'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${format === 'csv' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-200 flex items-center gap-1">
                    <span>CSV File</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">.csv</span>
                  </div>
                  <p className="text-[10.5px] text-slate-400 mt-0.5 leading-tight">
                    For spreadsheets, Excel & BI tools.
                  </p>
                </div>
              </button>

              {/* PDF Option */}
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  format === 'pdf'
                    ? 'bg-rose-600/10 border-rose-500 text-rose-400 ring-1 ring-rose-500/40'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${format === 'pdf' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-200 flex items-center gap-1">
                    <span>PDF Report</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">.pdf</span>
                  </div>
                  <p className="text-[10.5px] text-slate-400 mt-0.5 leading-tight">
                    Executive print-ready report tables.
                  </p>
                </div>
              </button>

              {/* JSON Option */}
              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  format === 'json'
                    ? 'bg-blue-600/10 border-blue-500 text-blue-400 ring-1 ring-blue-500/40'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${format === 'json' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
                  <FileCode2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-200 flex items-center gap-1">
                    <span>JSON Payload</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">.json</span>
                  </div>
                  <p className="text-[10.5px] text-slate-400 mt-0.5 leading-tight">
                    Hierarchical schema for APIs.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Configuration Options */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/70 pb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                <span>Export Configuration & Scope</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {recordCount()}
              </span>
            </div>

            {/* If task export: Scope selector */}
            {(itemType === 'tasks' && filteredTasks) && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400">Dataset Scope</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTaskScope('filtered')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium text-left border transition-all ${
                      taskScope === 'filtered'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-[11px]">Currently Filtered Tasks</div>
                    <div className="text-[10px] text-slate-400">{filteredTasks.length} active matching tasks</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskScope('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium text-left border transition-all ${
                      taskScope === 'all'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-[11px]">Entire Task Directory</div>
                    <div className="text-[10px] text-slate-400">{tasks.length} total organizational tasks</div>
                  </button>
                </div>
              </div>
            )}

            {/* If analytics export: Timeframe selector */}
            {itemType === 'analytics' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400">Analytics Telemetry Window</label>
                <div className="flex gap-2">
                  {(['1M', '3M', 'YTD'] as const).map(tf => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setSelectedTimeframe(tf)}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        selectedTimeframe === tf
                          ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tf === '1M' ? 'Last 30 Days' : tf === '3M' ? 'Quarter-to-Date' : 'Year-to-Date'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Field inclusions checkboxes */}
            {(itemType === 'tasks' || itemType === 'project-tasks') && (
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-400">Field Inclusions</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none bg-slate-900 p-2 rounded-lg border border-slate-800/60">
                    <input 
                      type="checkbox"
                      checked={includeAssignees}
                      onChange={(e) => setIncludeAssignees(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span>Assignee Data</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none bg-slate-900 p-2 rounded-lg border border-slate-800/60">
                    <input 
                      type="checkbox"
                      checked={includeEstimatedHours}
                      onChange={(e) => setIncludeEstimatedHours(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span>Sprint Hours</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none bg-slate-900 p-2 rounded-lg border border-slate-800/60">
                    <input 
                      type="checkbox"
                      checked={includeTags}
                      onChange={(e) => setIncludeTags(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span>Custom Tags</span>
                  </label>
                </div>
              </div>
            )}

            {itemType === 'analytics' && (
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-400">Report Inclusions</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none bg-slate-900 p-2 rounded-lg border border-slate-800/60">
                    <input 
                      type="checkbox"
                      checked={includeKPIs}
                      onChange={(e) => setIncludeKPIs(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-0"
                    />
                    <span>Executive KPI Telemetry</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none bg-slate-900 p-2 rounded-lg border border-slate-800/60">
                    <input 
                      type="checkbox"
                      checked={includeVelocity}
                      onChange={(e) => setIncludeVelocity(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-0"
                    />
                    <span>Velocity & Milestones</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none bg-slate-900 p-2 rounded-lg border border-slate-800/60">
                    <input 
                      type="checkbox"
                      checked={includeDeptBenchmarks}
                      onChange={(e) => setIncludeDeptBenchmarks(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-0"
                    />
                    <span>Dept Benchmarks</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none bg-slate-900 p-2 rounded-lg border border-slate-800/60">
                    <input 
                      type="checkbox"
                      checked={includePortfolioRollup}
                      onChange={(e) => setIncludePortfolioRollup(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-0"
                    />
                    <span>Project Portfolio Rollup</span>
                  </label>
                </div>
              </div>
            )}

            {/* Custom Filename */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Custom Filename (Optional)</label>
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200">
                <input
                  type="text"
                  placeholder={defaultBaseName()}
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value)}
                  className="bg-transparent flex-1 focus:outline-none placeholder-slate-500 text-xs"
                />
                <span className="text-slate-400 font-mono text-[11px]">.{format}</span>
              </div>
            </div>
          </div>

          {/* Live Data Sample Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>Live Data Preview ({format.toUpperCase()})</span>
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Sample'}</span>
              </button>
            </div>
            
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-300 max-h-36 overflow-y-auto whitespace-pre leading-relaxed select-all">
              {previewData}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>Target: <code className="text-slate-300 font-semibold">{fullFilename}</code></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              id="confirm-export-download-btn"
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              <Download className="w-4 h-4" />
              <span>Download {format.toUpperCase()}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
