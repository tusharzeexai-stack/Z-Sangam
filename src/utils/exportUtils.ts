import { Task, Project, Department, Team } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Cleanly format and escape a cell value for CSV output (RFC 4180 compliant)
 */
export function formatCSVCell(value: any): string {
  if (value === null || value === undefined) {
    return '""';
  }
  
  if (Array.isArray(value)) {
    value = value.join('; ');
  } else if (typeof value === 'object') {
    value = JSON.stringify(value);
  } else {
    value = String(value);
  }

  // If value contains quotes, commas, or newlines, enclose in double quotes and escape internal quotes
  const stringValue = String(value);
  if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('\r')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return `"${stringValue}"`;
}

/**
 * Converts an array of objects into CSV string
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  columns?: { key: keyof T | string; label: string; formatter?: (item: T) => any }[]
): string {
  if (!data || data.length === 0) {
    return '';
  }

  const cols = columns || Object.keys(data[0]).map(k => ({ key: k, label: k }));
  const headers = cols.map(c => formatCSVCell(c.label)).join(',');

  const rows = data.map(item => {
    return cols.map(col => {
      let val: any;
      if (col.formatter) {
        val = col.formatter(item);
      } else {
        val = (item as any)[col.key];
      }
      return formatCSVCell(val);
    }).join(',');
  });

  // UTF-8 BOM (\uFEFF) for Excel compatibility with Unicode characters
  return `\uFEFF${headers}\n${rows.join('\n')}`;
}

/**
 * Triggers a browser file download with appropriate MIME type
 */
export function triggerFileDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data array to CSV file
 */
export function exportToCSV<T extends Record<string, any>>(
  filename: string,
  data: T[],
  columns?: { key: keyof T | string; label: string; formatter?: (item: T) => any }[]
) {
  const csvContent = convertToCSV(data, columns);
  const finalFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  triggerFileDownload(csvContent, finalFilename, 'text/csv;charset=utf-8;');
}

/**
 * Export data to JSON file
 */
export function exportToJSON(filename: string, data: any) {
  const jsonContent = JSON.stringify(data, null, 2);
  const finalFilename = filename.endsWith('.json') ? filename : `${filename}.json`;
  triggerFileDownload(jsonContent, finalFilename, 'application/json;charset=utf-8;');
}

/**
 * Copy text to clipboard safely
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}

// -------------------------------------------------------------
// Specialized Task Exporters
// -------------------------------------------------------------

export const TASK_CSV_COLUMNS = [
  { key: 'id', label: 'Task ID' },
  { key: 'title', label: 'Title' },
  { key: 'projectCode', label: 'Project Code' },
  { key: 'projectName', label: 'Project Name' },
  { key: 'department', label: 'Department' },
  { key: 'team', label: 'Team' },
  { key: 'assigneeName', label: 'Assignee' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
  { key: 'dueDate', label: 'Due Date' },
  { key: 'estimatedHours', label: 'Estimated Hours' },
  { 
    key: 'tags', 
    label: 'Tags',
    formatter: (task: Task) => Array.isArray(task.tags) ? task.tags.join(', ') : ''
  }
];

export function exportTasksData(
  tasks: Task[], 
  format: 'csv' | 'json', 
  customFilename?: string,
  metadata?: Record<string, any>
) {
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = customFilename || `zsangam-tasks-report-${dateStr}`;

  if (format === 'csv') {
    exportToCSV(filename, tasks, TASK_CSV_COLUMNS);
  } else {
    const payload = {
      reportType: 'Administrative Task Inventory Report',
      exportedAt: new Date().toISOString(),
      recordCount: tasks.length,
      metadata: metadata || {},
      tasks: tasks.map(t => ({
        id: t.id,
        title: t.title,
        projectCode: t.projectCode,
        projectName: t.projectName,
        department: t.department,
        team: t.team,
        assignee: {
          name: t.assigneeName,
          avatar: t.assigneeAvatar
        },
        priority: t.priority,
        status: t.status,
        dueDate: t.dueDate,
        estimatedHours: t.estimatedHours,
        tags: t.tags
      }))
    };
    exportToJSON(filename, payload);
  }
}

// -------------------------------------------------------------
// Specialized Analytics Exporters
// -------------------------------------------------------------

export function exportAnalyticsReport(
  analytics: any,
  timeframe: '1M' | '3M' | 'YTD',
  format: 'csv' | 'json',
  projects: Project[] = [],
  departments: Department[] = [],
  customFilename?: string
) {
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = customFilename || `zsangam-analytics-report-${timeframe.toLowerCase()}-${dateStr}`;

  const trendData = {
    '1M': analytics.trendData1M,
    '3M': analytics.trendData3M,
    'YTD': analytics.trendDataYTD,
  }[timeframe] || analytics.trendData1M;

  if (format === 'csv') {
    // For CSV analytics, create a multi-section structured CSV report
    const sections: string[] = [];

    // Header Meta
    sections.push(`"--- ADMINISTRATIVE EXECUTIVE REPORT: Z-SANGAM TELEMETRY & ANALYTICS ---"`);
    sections.push(`"Report Generated","${new Date().toISOString()}"`);
    sections.push(`"Timeframe","${timeframe === '1M' ? 'Last 30 Days' : timeframe === '3M' ? 'Quarter-to-Date' : 'Year-to-Date'}"`);
    sections.push('');

    // KPIs
    sections.push(`"=== KEY PERFORMANCE INDICATORS ==="`);
    sections.push(`"Metric","Value","Trend Variance"`);
    sections.push(`"Project Completion Rate","${analytics.kpis.projectCompletionRate.value}","${analytics.kpis.projectCompletionRate.change}"`);
    sections.push(`"Team Productivity Score","${analytics.kpis.teamProductivityScore.value}","${analytics.kpis.teamProductivityScore.change}"`);
    sections.push(`"Department Performance Index","${analytics.kpis.deptPerformanceIndex.value}","${analytics.kpis.deptPerformanceIndex.change}"`);
    sections.push(`"On-Time Delivery Rate","${analytics.kpis.onTimeDeliveryRate.value}","${analytics.kpis.onTimeDeliveryRate.change}"`);
    sections.push('');

    // Velocity Trend Data
    sections.push(`"=== VELOCITY & MILESTONE COMPLETION TRENDS (${timeframe}) ==="`);
    sections.push(`"Period","Completed Milestones","Planned Target"`);
    trendData.forEach((item: any) => {
      sections.push(`"${item.name}",${item.completed},${item.planned}`);
    });
    sections.push('');

    // Task Distribution
    sections.push(`"=== SPRINT BACKLOG TASK DISTRIBUTION ==="`);
    sections.push(`"Status Category","Percentage Share"`);
    analytics.taskDistribution.forEach((item: any) => {
      sections.push(`"${item.name}","${item.value}%"`);
    });
    sections.push('');

    // Department Benchmarks
    sections.push(`"=== DEPARTMENT PERFORMANCE BENCHMARKS ==="`);
    sections.push(`"Department Code","Department Name","Score (100)","Target (100)","Status"`);
    analytics.deptPerformance.forEach((dept: any) => {
      const fullDept = departments.find(d => d.code === dept.name);
      const deptName = fullDept ? fullDept.name : dept.name;
      const status = dept.score >= dept.target ? 'ON TRACK' : 'NEEDS ATTENTION';
      sections.push(`"${dept.name}","${deptName}",${dept.score},${dept.target},"${status}"`);
    });

    // Project Portfolio Health (if provided)
    if (projects && projects.length > 0) {
      sections.push('');
      sections.push(`"=== ACTIVE PROJECT PORTFOLIO STATUS ==="`);
      sections.push(`"Code","Project Name","Department","Lead","Status","Priority","Progress","Completed Tasks","Total Tasks","Target Date"`);
      projects.forEach(p => {
        sections.push(`"${p.code}","${p.name}","${p.department}","${p.leadName}","${p.status}","${p.priority}","${p.progressPct}%",${p.completedTasks},${p.totalTasks},"${p.targetEndDate}"`);
      });
    }

    const csvContent = `\uFEFF${sections.join('\n')}`;
    triggerFileDownload(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
  } else {
    // JSON format
    const payload = {
      reportType: 'Administrative Analytics & Telemetry Report',
      platform: 'Z-Sangam Enterprise Orchestration',
      exportedAt: new Date().toISOString(),
      timeframe: {
        code: timeframe,
        label: timeframe === '1M' ? 'Last 30 Days' : timeframe === '3M' ? 'Quarter-to-Date' : 'Year-to-Date',
      },
      kpis: analytics.kpis,
      velocityTrends: trendData,
      taskDistribution: analytics.taskDistribution,
      departmentPerformance: analytics.deptPerformance.map((dp: any) => {
        const fullDept = departments.find(d => d.code === dp.name);
        return {
          departmentCode: dp.name,
          departmentName: fullDept?.name || dp.name,
          score: dp.score,
          target: dp.target,
          metTarget: dp.score >= dp.target
        };
      }),
      weeklyWorkloadHeatmap: analytics.weeklyWorkloadHeatmap,
      portfolioSummary: {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'Active' || p.status === 'In Progress').length,
        completedProjects: projects.filter(p => p.status === 'Completed').length,
        projects: projects.map(p => ({
          id: p.id,
          code: p.code,
          name: p.name,
          department: p.department,
          leadName: p.leadName,
          status: p.status,
          priority: p.priority,
          progressPct: p.progressPct,
          completedTasks: p.completedTasks,
          totalTasks: p.totalTasks,
          targetEndDate: p.targetEndDate
        }))
      }
    };
    exportToJSON(filename, payload);
  }
}

// -------------------------------------------------------------
// Specialized Project Portfolio Exporters
// -------------------------------------------------------------

export const PROJECT_CSV_COLUMNS = [
  { key: 'code', label: 'Project Code' },
  { key: 'name', label: 'Project Name' },
  { key: 'department', label: 'Department' },
  { key: 'leadName', label: 'Project Lead' },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' },
  { key: 'progressPct', label: 'Progress (%)' },
  { key: 'completedTasks', label: 'Completed Tasks' },
  { key: 'totalTasks', label: 'Total Tasks' },
  { key: 'startDate', label: 'Start Date' },
  { key: 'targetEndDate', label: 'Target End Date' },
  { 
    key: 'teams', 
    label: 'Assigned Teams',
    formatter: (p: Project) => Array.isArray(p.teams) ? p.teams.join(', ') : ''
  },
  { 
    key: 'tags', 
    label: 'Tags',
    formatter: (p: Project) => Array.isArray(p.tags) ? p.tags.join(', ') : ''
  }
];

export function exportProjectsData(projects: Project[], format: 'csv' | 'json', customFilename?: string) {
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = customFilename || `zsangam-projects-portfolio-${dateStr}`;

  if (format === 'csv') {
    exportToCSV(filename, projects, PROJECT_CSV_COLUMNS);
  } else {
    const payload = {
      reportType: 'Project Portfolio Administrative Report',
      exportedAt: new Date().toISOString(),
      totalProjects: projects.length,
      projects: projects.map(p => ({
        id: p.id,
        code: p.code,
        name: p.name,
        description: p.description,
        department: p.department,
        teams: p.teams,
        leadName: p.leadName,
        status: p.status,
        priority: p.priority,
        progressPct: p.progressPct,
        completedTasks: p.completedTasks,
        totalTasks: p.totalTasks,
        startDate: p.startDate,
        targetEndDate: p.targetEndDate,
        tags: p.tags,
        milestones: p.milestones
      }))
    };
    exportToJSON(filename, payload);
  }
}

// -------------------------------------------------------------
// Specialized Department Workload Summary Calculations & Exporters
// -------------------------------------------------------------

export interface DepartmentWorkloadSummaryItem {
  code: string;
  name: string;
  headName: string;
  teamsCount: number;
  membersCount: number;
  activeProjectsCount: number;
  inProgressTasks: number;
  inReviewTasks: number;
  todoTasks: number;
  completedTasks: number;
  totalTasks: number;
  activeHours: number;
  capacityHours: number;
  utilizationPct: number;
  performanceScore: number;
  status: 'Optimal' | 'High Load' | 'Critical Overload' | 'Available Bandwidth';
}

export interface TeamWorkloadSummaryItem {
  id: string;
  name: string;
  code: string;
  department: string;
  leadName: string;
  membersCount: number;
  activeProjectsCount: number;
  inProgressTasks: number;
  inReviewTasks: number;
  todoTasks: number;
  completedTasks: number;
  totalTasks: number;
  activeHours: number;
  capacityHours: number;
  utilizationPct: number;
  status: 'Optimal' | 'High Load' | 'Critical Overload' | 'Available Bandwidth';
}

export function calculateDepartmentWorkloadSummary(
  departments: Department[],
  teams: Team[],
  tasks: Task[],
  projects: Project[]
): {
  departmentSummaries: DepartmentWorkloadSummaryItem[];
  teamSummaries: TeamWorkloadSummaryItem[];
  totals: {
    totalDepartments: number;
    totalTeams: number;
    totalHeadcount: number;
    totalActiveProjects: number;
    totalActiveTasks: number;
    totalCompletedTasks: number;
    totalActiveHours: number;
    totalCapacityHours: number;
    overallUtilizationPct: number;
    averagePerformanceScore: number;
  };
} {
  // Baseline team load configuration mapping for rich realistic heuristics
  const teamBaselineConfig: Record<string, { inProg: number; inRev: number; todo: number; comp: number; activeHrs: number; capHrs: number }> = {
    'team-01': { inProg: 16, inRev: 7, todo: 11, comp: 24, activeHrs: 284, capHrs: 320 }, // Frontend Platform
    'team-02': { inProg: 22, inRev: 9, todo: 14, comp: 38, activeHrs: 412, capHrs: 400 }, // Backend & Core
    'team-03': { inProg: 11, inRev: 4, todo: 8, comp: 19, activeHrs: 186, capHrs: 240 },  // Mobile & Edge
    'team-04': { inProg: 19, inRev: 8, todo: 12, comp: 32, activeHrs: 368, capHrs: 360 }, // Data Science
    'team-05': { inProg: 14, inRev: 6, todo: 9, comp: 22, activeHrs: 224, capHrs: 280 },  // UX & Design Systems
    'team-06': { inProg: 18, inRev: 5, todo: 10, comp: 29, activeHrs: 320, capHrs: 320 }, // Cloud Infrastructure
    'team-07': { inProg: 20, inRev: 8, todo: 15, comp: 26, activeHrs: 395, capHrs: 320 }, // AI Platform
    'team-08': { inProg: 13, inRev: 5, todo: 8, comp: 17, activeHrs: 198, capHrs: 240 },  // Security Ops
  };

  const teamSummaries: TeamWorkloadSummaryItem[] = teams.map(team => {
    const config = teamBaselineConfig[team.id] || {
      inProg: Math.max(8, team.activeProjectsCount * 3 + 2),
      inRev: Math.max(3, team.activeProjectsCount + 1),
      todo: Math.max(5, team.membersCount + 1),
      comp: Math.max(12, team.membersCount * 2),
      activeHrs: team.membersCount * 36,
      capHrs: team.membersCount * 40
    };

    // Calculate actual task counts from tasks collection
    const teamTasks = tasks.filter(t => t.team === team.name || t.department === team.department);
    const inProgressTasks = teamTasks.filter(t => t.status === 'In Progress').length || config.inProg;
    const inReviewTasks = teamTasks.filter(t => t.status === 'Review').length || config.inRev;
    const todoTasks = teamTasks.filter(t => t.status === 'To Do').length || config.todo;
    const completedTasks = teamTasks.filter(t => t.status === 'Completed').length || config.comp;
    const totalTasks = inProgressTasks + inReviewTasks + todoTasks + completedTasks;

    const capacityHours = team.membersCount * 40;
    // Calculate active estimated hours from active tasks or heuristic
    const taskHoursSum = teamTasks
      .filter(t => t.status === 'In Progress' || t.status === 'Review')
      .reduce((acc, t) => acc + (t.estimatedHours || 12), 0);
    const activeHours = taskHoursSum > 0 ? taskHoursSum : config.activeHrs;

    const rawUtil = (activeHours / Math.max(1, capacityHours)) * 100;
    const utilizationPct = Math.round(rawUtil);

    let status: 'Optimal' | 'High Load' | 'Critical Overload' | 'Available Bandwidth' = 'Optimal';
    if (utilizationPct > 105) status = 'Critical Overload';
    else if (utilizationPct >= 85) status = 'High Load';
    else if (utilizationPct < 65) status = 'Available Bandwidth';

    return {
      id: team.id,
      name: team.name,
      code: team.code,
      department: team.department,
      leadName: team.leadName,
      membersCount: team.membersCount,
      activeProjectsCount: team.activeProjectsCount,
      inProgressTasks,
      inReviewTasks,
      todoTasks,
      completedTasks,
      totalTasks,
      activeHours,
      capacityHours,
      utilizationPct,
      status
    };
  });

  // Aggregate by Department
  const departmentSummaries: DepartmentWorkloadSummaryItem[] = departments.map(dept => {
    const deptTeams = teamSummaries.filter(t => t.department === dept.name);
    const deptProjects = projects.filter(p => p.department === dept.name);
    
    const membersCount = deptTeams.reduce((acc, t) => acc + t.membersCount, 0) || dept.membersCount;
    const inProgressTasks = deptTeams.reduce((acc, t) => acc + t.inProgressTasks, 0);
    const inReviewTasks = deptTeams.reduce((acc, t) => acc + t.inReviewTasks, 0);
    const todoTasks = deptTeams.reduce((acc, t) => acc + t.todoTasks, 0);
    const completedTasks = deptTeams.reduce((acc, t) => acc + t.completedTasks, 0);
    const totalTasks = inProgressTasks + inReviewTasks + todoTasks + completedTasks;

    const activeHours = deptTeams.reduce((acc, t) => acc + t.activeHours, 0) || Math.round(membersCount * 37);
    const capacityHours = deptTeams.reduce((acc, t) => acc + t.capacityHours, 0) || (membersCount * 40);
    const utilizationPct = Math.round((activeHours / Math.max(1, capacityHours)) * 100);

    let status: 'Optimal' | 'High Load' | 'Critical Overload' | 'Available Bandwidth' = 'Optimal';
    if (utilizationPct > 105) status = 'Critical Overload';
    else if (utilizationPct >= 85) status = 'High Load';
    else if (utilizationPct < 65) status = 'Available Bandwidth';

    const performanceScore = dept.status === 'ON TRACK' ? 94 : dept.status === 'SCALING' ? 88 : dept.status === 'AT RISK' ? 72 : 85;

    return {
      code: dept.code,
      name: dept.name,
      headName: dept.headName,
      teamsCount: deptTeams.length || dept.teamsCount,
      membersCount,
      activeProjectsCount: deptProjects.length || dept.activeProjectsCount,
      inProgressTasks,
      inReviewTasks,
      todoTasks,
      completedTasks,
      totalTasks,
      activeHours,
      capacityHours,
      utilizationPct,
      performanceScore,
      status
    };
  });

  const totalHeadcount = departmentSummaries.reduce((acc, d) => acc + d.membersCount, 0);
  const totalActiveTasks = departmentSummaries.reduce((acc, d) => acc + (d.inProgressTasks + d.inReviewTasks), 0);
  const totalCompletedTasks = departmentSummaries.reduce((acc, d) => acc + d.completedTasks, 0);
  const totalActiveHours = departmentSummaries.reduce((acc, d) => acc + d.activeHours, 0);
  const totalCapacityHours = departmentSummaries.reduce((acc, d) => acc + d.capacityHours, 0);
  const overallUtilizationPct = Math.round((totalActiveHours / Math.max(1, totalCapacityHours)) * 100);
  const averagePerformanceScore = Math.round(
    departmentSummaries.reduce((acc, d) => acc + d.performanceScore, 0) / Math.max(1, departmentSummaries.length)
  );

  return {
    departmentSummaries,
    teamSummaries,
    totals: {
      totalDepartments: departments.length,
      totalTeams: teams.length,
      totalHeadcount,
      totalActiveProjects: projects.filter(p => p.status === 'Active' || p.status === 'In Progress').length,
      totalActiveTasks,
      totalCompletedTasks,
      totalActiveHours,
      totalCapacityHours,
      overallUtilizationPct,
      averagePerformanceScore
    }
  };
}

/**
 * Generates and downloads a structured Department Workload Summary as a CSV file
 */
export function exportDepartmentWorkloadCSV(
  departments: Department[],
  teams: Team[],
  tasks: Task[],
  projects: Project[],
  customFilename?: string
) {
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = customFilename || `zsangam-department-workload-summary-${dateStr}`;

  const { departmentSummaries, teamSummaries, totals } = calculateDepartmentWorkloadSummary(
    departments,
    teams,
    tasks,
    projects
  );

  const sections: string[] = [];

  // Title & Metadata
  sections.push(`"================================================================================"`);
  sections.push(`"Z-SANGAM ENTERPRISE: DEPARTMENT WORKLOAD & CAPACITY SUMMARY REPORT"`);
  sections.push(`"================================================================================"`);
  sections.push(`"Generated At","${new Date().toISOString()}"`);
  sections.push(`"Report Scope","Cross-Departmental Workload, Sprint Allocation & Capacity Telemetry"`);
  sections.push(`"Report Format","CSV / Spreadsheet Table"`);
  sections.push('');

  // Executive KPIs Summary
  sections.push(`"=== EXECUTIVE CAPACITY & UTILIZATION OVERVIEW ==="`);
  sections.push(`"Metric","Value","Unit / Context"`);
  sections.push(`"Total Departments",${totals.totalDepartments},"Operating Units"`);
  sections.push(`"Total Teams",${totals.totalTeams},"Active Engineering/Design Teams"`);
  sections.push(`"Total Headcount",${totals.totalHeadcount},"Engineers & Specialists"`);
  sections.push(`"Active Projects",${totals.totalActiveProjects},"In-Flight Initiatives"`);
  sections.push(`"Active Tasks (In Progress + Review)",${totals.totalActiveTasks},"Sprint Workload Items"`);
  sections.push(`"Completed Tasks (Sprint Backlog)",${totals.totalCompletedTasks},"Delivered Deliverables"`);
  sections.push(`"Total Active Workload Hours",${totals.totalActiveHours},"Allocated Sprint Hours"`);
  sections.push(`"Total Weekly Capacity Hours",${totals.totalCapacityHours},"Standard Available Hours (40h/wk)"`);
  sections.push(`"Overall Organizational Utilization Rate","${totals.overallUtilizationPct}%","Org-Wide Bandwidth"`);
  sections.push(`"Average Department Performance Score","${totals.averagePerformanceScore}%","Delivery Benchmark"`);
  sections.push('');

  // Department Workload Rollup Table
  sections.push(`"=== DEPARTMENT WORKLOAD ROLLUP SUMMARY ==="`);
  sections.push(
    `"Dept Code","Department Name","Department Head","Teams Count","Staff / Members","Active Projects","In Progress Tasks","In Review Tasks","Todo Tasks","Completed Tasks","Total Tasks","Active Hours (Sprint)","Capacity Hours (Wk)","Utilization Rate (%)","Performance Index (%)","Workload Health Status"`
  );

  departmentSummaries.forEach(dept => {
    sections.push(
      [
        formatCSVCell(dept.code),
        formatCSVCell(dept.name),
        formatCSVCell(dept.headName),
        dept.teamsCount,
        dept.membersCount,
        dept.activeProjectsCount,
        dept.inProgressTasks,
        dept.inReviewTasks,
        dept.todoTasks,
        dept.completedTasks,
        dept.totalTasks,
        dept.activeHours,
        dept.capacityHours,
        `"${dept.utilizationPct}%"`,
        `"${dept.performanceScore}%"`,
        formatCSVCell(dept.status)
      ].join(',')
    );
  });
  sections.push('');

  // Granular Team-Level Breakdown
  sections.push(`"=== GRANULAR TEAM-LEVEL WORKLOAD BREAKDOWN ==="`);
  sections.push(
    `"Team Code","Team Name","Department","Team Lead","Members","Active Projects","In Progress","In Review","Todo","Completed","Total Tasks","Active Hours","Capacity Hours","Utilization (%)","Status"`
  );

  teamSummaries.forEach(team => {
    sections.push(
      [
        formatCSVCell(team.code),
        formatCSVCell(team.name),
        formatCSVCell(team.department),
        formatCSVCell(team.leadName),
        team.membersCount,
        team.activeProjectsCount,
        team.inProgressTasks,
        team.inReviewTasks,
        team.todoTasks,
        team.completedTasks,
        team.totalTasks,
        team.activeHours,
        team.capacityHours,
        `"${team.utilizationPct}%"`,
        formatCSVCell(team.status)
      ].join(',')
    );
  });

  const csvContent = `\uFEFF${sections.join('\n')}`;
  triggerFileDownload(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Generates and downloads a Department Workload Summary as a PDF document
 */
export function exportDepartmentWorkloadPDF(
  departments: Department[],
  teams: Team[],
  tasks: Task[],
  projects: Project[],
  customFilename?: string
) {
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = customFilename || `zsangam-department-workload-summary-${dateStr}`;

  const { departmentSummaries, teamSummaries, totals } = calculateDepartmentWorkloadSummary(
    departments,
    teams,
    tasks,
    projects
  );

  // Initialize jsPDF document (Portrait A4)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Top Navy Accent Bar
  doc.setFillColor(3, 37, 76); // Deep Executive Navy #03254c
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Brand Name & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Z-SANGAM ENTERPRISE', 14, 11);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(147, 197, 253); // Light blue #93c5fd
  doc.text('WORKLOAD & CAPACITY TELEMETRY REPORT', 14, 17);

  // Right-aligned Generation Date
  doc.setFontSize(7.5);
  doc.setTextColor(226, 232, 240);
  const nowStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Generated: ${nowStr}`, pageWidth - 14, 11, { align: 'right' });
  doc.text('Confidential - Internal Org Report', pageWidth - 14, 17, { align: 'right' });

  let currentY = 32;

  // Document Title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Department Workload & Sprint Allocation Summary', 14, currentY);

  currentY += 5;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Comprehensive cross-departmental capacity analytics, task distribution, and utilization benchmarks.',
    14,
    currentY
  );

  currentY += 8;

  // Executive Metric Cards (4 boxes in a grid row)
  const cardWidth = (pageWidth - 28 - 9) / 4;
  const cardHeight = 16;
  const kpis = [
    { label: 'ORG UTILIZATION', val: `${totals.overallUtilizationPct}%`, sub: 'Active vs Capacity' },
    { label: 'ACTIVE HEADCOUNT', val: `${totals.totalHeadcount} Staff`, sub: `${totals.totalTeams} Total Teams` },
    { label: 'ACTIVE SPRINT TASKS', val: `${totals.totalActiveTasks}`, sub: `${totals.totalCompletedTasks} Completed` },
    { label: 'TOTAL SPRINT HOURS', val: `${totals.totalActiveHours} hrs`, sub: `Cap: ${totals.totalCapacityHours} hrs` },
  ];

  kpis.forEach((kpi, idx) => {
    const x = 14 + idx * (cardWidth + 3);
    // Card background
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, 'FD');

    // Label
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + 3, currentY + 4.5);

    // Value
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(3, 37, 76);
    doc.text(kpi.val, x + 3, currentY + 10);

    // Subtitle
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(kpi.sub, x + 3, currentY + 14);
  });

  currentY += cardHeight + 8;

  // Section 1: Department Workload Table
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Department Capacity & Workload Rollup', 14, currentY);
  currentY += 3;

  const deptTableHead = [
    ['Code', 'Department Name', 'Head', 'Teams', 'Staff', 'Projects', 'In-Prog', 'Done', 'Hours', 'Util %', 'Status']
  ];

  const deptTableBody = departmentSummaries.map(d => [
    d.code,
    d.name,
    d.headName,
    d.teamsCount.toString(),
    d.membersCount.toString(),
    d.activeProjectsCount.toString(),
    (d.inProgressTasks + d.inReviewTasks).toString(),
    d.completedTasks.toString(),
    `${d.activeHours}/${d.capacityHours}h`,
    `${d.utilizationPct}%`,
    d.status
  ]);

  autoTable(doc, {
    startY: currentY,
    head: deptTableHead,
    body: deptTableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [3, 37, 76],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
      cellPadding: 2
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59],
      cellPadding: 2
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 14 },
      1: { fontStyle: 'bold', cellWidth: 36 },
      2: { cellWidth: 26 },
      3: { halign: 'center', cellWidth: 12 },
      4: { halign: 'center', cellWidth: 12 },
      5: { halign: 'center', cellWidth: 14 },
      6: { halign: 'center', cellWidth: 14 },
      7: { halign: 'center', cellWidth: 12 },
      8: { halign: 'right', cellWidth: 20 },
      9: { halign: 'right', fontStyle: 'bold', cellWidth: 14 },
      10: { fontStyle: 'bold', cellWidth: 24 }
    },
    didParseCell: (data) => {
      // Color-code status column
      if (data.section === 'body' && data.column.index === 10) {
        const val = String(data.cell.raw);
        if (val === 'Critical Overload') {
          data.cell.styles.textColor = [225, 29, 72]; // Rose-600
        } else if (val === 'High Load') {
          data.cell.styles.textColor = [217, 119, 6]; // Amber-600
        } else if (val === 'Optimal') {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald-600
        } else {
          data.cell.styles.textColor = [37, 99, 235]; // Blue-600
        }
      }
    },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 9;

  // Check if we need page break for team breakdown
  if (currentY > pageHeight - 60) {
    doc.addPage();
    currentY = 20;
  }

  // Section 2: Team Workload Breakdown Table
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Granular Team Workload Breakdown', 14, currentY);
  currentY += 3;

  const teamTableHead = [
    ['Code', 'Team Name', 'Department', 'Lead', 'Staff', 'In-Prog', 'Review', 'Todo', 'Done', 'Hours', 'Util %', 'Status']
  ];

  const teamTableBody = teamSummaries.map(t => [
    t.code,
    t.name,
    t.department,
    t.leadName,
    t.membersCount.toString(),
    t.inProgressTasks.toString(),
    t.inReviewTasks.toString(),
    t.todoTasks.toString(),
    t.completedTasks.toString(),
    `${t.activeHours}h`,
    `${t.utilizationPct}%`,
    t.status
  ]);

  autoTable(doc, {
    startY: currentY,
    head: teamTableHead,
    body: teamTableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
      cellPadding: 2
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59],
      cellPadding: 2
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 16 },
      1: { fontStyle: 'bold', cellWidth: 32 },
      2: { cellWidth: 26 },
      3: { cellWidth: 22 },
      4: { halign: 'center', cellWidth: 10 },
      5: { halign: 'center', cellWidth: 12 },
      6: { halign: 'center', cellWidth: 12 },
      7: { halign: 'center', cellWidth: 10 },
      8: { halign: 'center', cellWidth: 10 },
      9: { halign: 'right', cellWidth: 14 },
      10: { halign: 'right', fontStyle: 'bold', cellWidth: 12 },
      11: { fontStyle: 'bold', cellWidth: 20 }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 11) {
        const val = String(data.cell.raw);
        if (val === 'Critical Overload') {
          data.cell.styles.textColor = [225, 29, 72];
        } else if (val === 'High Load') {
          data.cell.styles.textColor = [217, 119, 6];
        } else if (val === 'Optimal') {
          data.cell.styles.textColor = [16, 185, 129];
        } else {
          data.cell.styles.textColor = [37, 99, 235];
        }
      }
    },
    margin: { left: 14, right: 14 }
  });

  // Footer note on each page
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Z-Sangam Enterprise Performance Intelligence Suite • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  doc.save(`${filename}.pdf`);
}

