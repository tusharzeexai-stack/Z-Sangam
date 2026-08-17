import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Edit3, 
  UserPlus, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Circle, 
  AlertCircle, 
  GitCommit, 
  Layers, 
  FileText, 
  Activity, 
  BarChart3, 
  ShieldCheck, 
  Share2,
  Users,
  Calendar,
  ExternalLink,
  Sparkles,
  ChevronRight,
  Code2,
  Download,
  Search,
  Filter,
  CheckSquare,
  X,
  UploadCloud,
  FilePlus,
  BarChart2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ExportModal } from '../common/ExportModal';
import { ExportDropdown } from '../common/ExportDropdown';
import { exportTasksData, exportProjectsData } from '../../utils/exportUtils';
import { Task, Project, Milestone } from '../../types';

export interface ProjectFile {
  id: string;
  name: string;
  size: string;
  updated: string;
  category: string;
}

export interface CustomActivity {
  id: string;
  text: string;
  time: string;
  user: string;
}

export const ProjectDetailView: React.FC = () => {
  const { 
    selectedProject, 
    projects, 
    setActiveView, 
    tasks, 
    addTask,
    updateTaskStatus,
    setIsInviteMemberOpen,
    showToast,
    updateProject,
    teams: globalTeams,
    users: globalUsers
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'teams' | 'activity' | 'files' | 'analytics'>('overview');
  
  // Modals state
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false);
  const [showUploadFileModal, setShowUploadFileModal] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportModalType, setExportModalType] = useState<'project-tasks' | 'projects'>('project-tasks');
  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState('All');

  // Form inputs
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState(selectedProject?.leadName || 'Sarah Jenkins');

  // Edit project form
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState<Project['status']>('In Progress');
  const [editPriority, setEditPriority] = useState<Project['priority']>('High');

  // Add Team form
  const [selectedTeamName, setSelectedTeamName] = useState('');
  const [customTeamName, setCustomTeamName] = useState('');

  // Add Member form
  const [selectedUserId, setSelectedUserId] = useState('');
  const [customMemberName, setCustomMemberName] = useState('');
  const [customMemberRole, setCustomMemberRole] = useState('Contributor');

  // Add Milestone form
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDate, setMilestoneDate] = useState('');
  const [milestoneStatus, setMilestoneStatus] = useState<'Pending' | 'In Progress' | 'Completed'>('In Progress');

  // Upload File form
  const [fileName, setFileName] = useState('');
  const [fileCategory, setFileCategory] = useState('Architecture Spec');

  // Custom Activity form
  const [activityText, setActivityText] = useState('');
  const [activityUser, setActivityUser] = useState('Lead Architect');

  // Local state for dynamic files & custom activities
  const [localFiles, setLocalFiles] = useState<ProjectFile[]>([
    { id: 'f-1', name: 'Architecture-Whitepaper-v2.pdf', size: '2.4 MB', updated: '2 days ago', category: 'Documentation' },
    { id: 'f-2', name: 'API-Specification-OpenAPI3.yaml', size: '480 KB', updated: 'Yesterday', category: 'API Spec' },
    { id: 'f-3', name: 'Security-Compliance-Audit.pdf', size: '1.8 MB', updated: 'Last week', category: 'Security' },
  ]);

  const [localActivities, setLocalActivities] = useState<CustomActivity[]>([
    { id: 'a-1', text: 'Sprint milestone checkpoint validated by Lead Architect', time: '2 hours ago', user: 'Lead Architect' },
    { id: 'a-2', text: 'Pull Request #204 merged into main branch with 100% test coverage', time: '5 hours ago', user: 'Alex Chen' },
    { id: 'a-3', text: 'Automated performance telemetry benchmarks passed (94.2/100 score)', time: 'Yesterday', user: 'CI/CD Pipeline' },
  ]);

  const project = selectedProject || projects[0];

  // Guard: if no project exists yet, show empty state instead of crashing
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
          <Layers className="w-7 h-7 text-slate-500" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-200">No Project Selected</h2>
          <p className="text-xs text-slate-400 mt-1">Create your first project to see its details here.</p>
        </div>
        <button
          onClick={() => setActiveView('projects')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Projects
        </button>
      </div>
    );
  }

  const projectTasks = tasks.filter(t => t.projectCode === project.code);

  const filteredProjectTasks = projectTasks.filter(t => {
    if (taskStatusFilter !== 'All' && t.status !== taskStatusFilter) return false;
    if (taskSearch && !t.title.toLowerCase().includes(taskSearch.toLowerCase()) && !t.assigneeName.toLowerCase().includes(taskSearch.toLowerCase())) return false;
    return true;
  });

  // Handlers
  const handleOpenEditModal = () => {
    setEditName(project.name);
    setEditCode(project.code);
    setEditDesc(project.description);
    setEditStatus(project.status);
    setEditPriority(project.priority);
    setShowEditProjectModal(true);
  };

  const handleSaveProjectEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProject(project.id, {
      name: editName,
      code: editCode,
      description: editDesc,
      status: editStatus,
      priority: editPriority
    });
    setShowEditProjectModal(false);
    showToast('Project Updated', `${editCode} details saved successfully.`, 'success');
  };

  const handleAssignTeam = (e: React.FormEvent) => {
    e.preventDefault();
    const teamToAdd = selectedTeamName || customTeamName.trim();
    if (!teamToAdd) return;

    const updatedTeams = [...(project.teams || [])];
    if (!updatedTeams.includes(teamToAdd)) {
      updatedTeams.push(teamToAdd);
      updateProject(project.id, { teams: updatedTeams });
      showToast('Team Assigned', `Assigned ${teamToAdd} to ${project.code}`, 'success');
    } else {
      showToast('Already Assigned', `${teamToAdd} is already attached to this project.`, 'warning');
    }
    setSelectedTeamName('');
    setCustomTeamName('');
    setShowAddTeamModal(false);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    let memberName = customMemberName.trim();
    let memberRole = customMemberRole;
    let memberAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    if (selectedUserId) {
      const foundUser = globalUsers.find(u => u.id === selectedUserId);
      if (foundUser) {
        memberName = foundUser.name;
        memberRole = foundUser.role;
        memberAvatar = foundUser.avatar;
      }
    }

    if (!memberName) return;

    const newMemberObj = {
      id: `pm-${Date.now()}`,
      name: memberName,
      role: memberRole,
      avatar: memberAvatar
    };

    const updatedMembers = [...(project.members || []), newMemberObj];
    updateProject(project.id, { members: updatedMembers });
    showToast('Member Added', `Added ${memberName} (${memberRole}) to project personnel.`, 'success');
    
    setSelectedUserId('');
    setCustomMemberName('');
    setShowAddMemberModal(false);
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim()) return;

    const newMilestone: Milestone = {
      id: `m-${Date.now()}`,
      title: milestoneTitle,
      targetDate: milestoneDate || '2026-10-15',
      status: milestoneStatus
    };

    const updatedMilestones = [...(project.milestones || []), newMilestone];
    updateProject(project.id, { milestones: updatedMilestones });
    showToast('Milestone Created', `Milestone "${milestoneTitle}" added to roadmap.`, 'success');

    setMilestoneTitle('');
    setMilestoneDate('');
    setShowAddMilestoneModal(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask({
      title: newTaskTitle,
      projectCode: project.code,
      projectName: project.name,
      department: project.department,
      assigneeName: newTaskAssignee,
      status: 'To Do',
      priority: 'High'
    });
    setNewTaskTitle('');
    setShowAddTaskModal(false);
    showToast('Task Added', `Task assigned to ${newTaskAssignee}`, 'success');
  };

  const handleUploadFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    const newFile: ProjectFile = {
      id: `f-${Date.now()}`,
      name: fileName.endsWith('.pdf') || fileName.endsWith('.yaml') || fileName.endsWith('.docx') ? fileName : `${fileName}.pdf`,
      size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
      updated: 'Just now',
      category: fileCategory
    };

    setLocalFiles(prev => [newFile, ...prev]);
    showToast('Document Uploaded', `File ${newFile.name} attached to project repository.`, 'success');
    setFileName('');
    setShowUploadFileModal(false);
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityText.trim()) return;

    const newAct: CustomActivity = {
      id: `a-${Date.now()}`,
      text: activityText,
      time: 'Just now',
      user: activityUser
    };

    setLocalActivities(prev => [newAct, ...prev]);
    showToast('Activity Logged', 'Entry recorded in project execution audit log.', 'success');
    setActivityText('');
    setShowAddActivityModal(false);
  };

  const handleExportProjectTasksCSV = () => {
    exportTasksData(projectTasks, 'csv', `zsangam-tasks-${project.code.toLowerCase()}`);
    showToast('Tasks Exported', `Exported ${projectTasks.length} tasks for ${project.code} as CSV.`, 'success');
  };

  const handleExportProjectTasksJSON = () => {
    exportTasksData(projectTasks, 'json', `zsangam-tasks-${project.code.toLowerCase()}`, {
      projectCode: project.code,
      projectName: project.name
    });
    showToast('Tasks Exported', `Exported ${projectTasks.length} tasks for ${project.code} as JSON.`, 'success');
  };

  const handleExportProjectDossierCSV = () => {
    exportProjectsData([project], 'csv', `zsangam-project-${project.code.toLowerCase()}`);
    showToast('Project Exported', `Exported dossier for ${project.code} as CSV.`, 'success');
  };

  const handleExportProjectDossierJSON = () => {
    exportProjectsData([project], 'json', `zsangam-project-${project.code.toLowerCase()}`);
    showToast('Project Exported', `Exported dossier for ${project.code} as JSON.`, 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <button
          onClick={() => setActiveView('projects')}
          className="flex items-center gap-1 hover:text-slate-200 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>
        <span>/</span>
        <span className="text-blue-400 font-mono font-semibold">{project.code}</span>
      </div>

      {/* Project Hero Header Card */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-blue-500/15 text-blue-400 border border-blue-500/30">
                {project.code}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{project.status}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              {project.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <ExportDropdown
              id="project-dossier-export-dropdown"
              label="Export Dossier"
              csvLabel="Export Dossier (.csv)"
              jsonLabel="Export Dossier (.json)"
              onExportCSV={handleExportProjectDossierCSV}
              onExportJSON={handleExportProjectDossierJSON}
              onOpenAdvanced={() => {
                setExportModalType('projects');
                setIsExportModalOpen(true);
              }}
            />

            <button
              onClick={handleOpenEditModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-300" />
              <span>Edit Project</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('teams');
                setShowAddMemberModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-slate-300" />
              <span>Members</span>
            </button>
            <button
              id="detail-add-task-btn"
              onClick={() => setShowAddTaskModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Add Task</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-t border-slate-800/80 mt-6 pt-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'OVERVIEW' },
            { id: 'tasks', label: `TASKS (${projectTasks.length})` },
            { id: 'teams', label: `TEAMS & MEMBERS (${project.teams?.length || 0}/${project.members?.length || 0})` },
            { id: 'activity', label: 'ACTIVITY' },
            { id: 'files', label: 'FILES' },
            { id: 'analytics', label: 'ANALYTICS' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-bold tracking-wider rounded-lg transition-colors shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title={exportModalType === 'project-tasks' ? `Export Tasks for ${project.code}` : `Export Dossier for ${project.name}`}
        description="Extract formatted administrative task lists and milestone data in CSV or JSON."
        itemType={exportModalType}
        project={project}
        projects={[project]}
        tasks={projectTasks}
        filteredTasks={filteredProjectTasks}
      />

      {/* TAB 1: OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <>
          {/* Progress & Milestone Overview Banner */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5">
            {/* Progress Ring / Meter (4 cols) */}
            <div className="md:col-span-4 flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-800/80 pb-4 md:pb-0 md:pr-4">
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-500"
                    strokeDasharray={`${project.progressPct}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-base font-black text-slate-100 font-mono">{project.progressPct}%</span>
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100">Overall Execution Progress</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{project.completedTasks || 0} of {project.totalTasks || 0} milestones finalized</div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Velocity on track for delivery</span>
                </div>
              </div>
            </div>

            {/* Timeline Specs (4 cols) */}
            <div className="md:col-span-4 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-800/80 pb-4 md:pb-0 md:px-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">START DATE</span>
                  <div className="text-xs font-bold text-slate-100 font-mono mt-1">{project.startDate || '2026-01-01'}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TARGET END</span>
                  <div className="text-xs font-bold text-slate-100 font-mono mt-1">{project.targetEndDate || '2026-12-31'}</div>
                </div>
              </div>
            </div>

            {/* Current Sprint Phase (4 cols) */}
            <div className="md:col-span-4 flex flex-col justify-center md:pl-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400 font-medium">Current Sprint Phase</span>
                <span className="font-mono font-bold text-blue-400">{project.sprintPhaseRemainingDays || 30} Days Remaining</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full w-3/4" />
              </div>
            </div>
          </div>

          {/* Main Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Milestones Card */}
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Milestones & Phase Delivery</h3>
                    <p className="text-xs text-slate-400">Sequential checkpoints towards production delivery</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowAddMilestoneModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>+ Add Milestone</span>
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {(!project.milestones || project.milestones.length === 0) ? (
                    <div className="p-8 text-center text-slate-400 space-y-3">
                      <Layers className="w-8 h-8 mx-auto text-slate-600" />
                      <div className="text-xs font-semibold text-slate-300">No milestones defined yet</div>
                      <p className="text-[11px] text-slate-500">Create key phase deliverables and delivery checkpoints.</p>
                      <button
                        onClick={() => setShowAddMilestoneModal(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 text-xs font-semibold transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add Milestone</span>
                      </button>
                    </div>
                  ) : (
                    project.milestones.map((m) => {
                      const isCompleted = m.status === 'Completed';
                      const isInProgress = m.status === 'In Progress';

                      return (
                        <div
                          key={m.id}
                          className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                            isCompleted
                              ? 'bg-slate-950/40 border-slate-800/60 text-slate-300'
                              : isInProgress
                                ? 'bg-blue-500/10 border-blue-500/30 text-slate-100'
                                : 'bg-slate-950/20 border-slate-800/40 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            ) : isInProgress ? (
                              <div className="w-5 h-5 rounded-full border-2 border-blue-400 flex items-center justify-center shrink-0">
                                <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                              </div>
                            ) : (
                              <Circle className="w-5 h-5 text-slate-400 shrink-0" />
                            )}
                            <div>
                              <div className={`text-xs font-bold ${isInProgress ? 'text-blue-300' : 'text-slate-200'}`}>
                                {m.title}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                Target: <span className="font-mono">{m.targetDate}</span>
                                {m.completionDate && <span className="text-emerald-400 ml-2 font-medium">✓ Completed on {m.completionDate}</span>}
                              </div>
                            </div>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            isCompleted
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : isInProgress
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {m.status}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Project Scope & Architecture Spec */}
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <div className="pb-3 border-b border-slate-800/80 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100">Project Scope & Technical Architecture</h3>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Code2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Architecture Spec</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {project.description || 'Enterprise project synchronized across cross-functional units.'}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {(project.tags || ['Enterprise']).map((tag, idx) => (
                    <span key={idx} className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-md bg-slate-800/90 text-blue-300 border border-slate-700">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Lead Department & Involved Teams */}
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Department & Teams
                  </h3>
                  <button
                    onClick={() => setShowAddTeamModal(true)}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Assign Team</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs">
                    {project.code.slice(0, 3)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100">{project.department || 'Engineering'}</div>
                    <div className="text-[10px] text-slate-400">Lead Organization Unit</div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">COLLABORATING TEAMS</div>
                  {(!project.teams || project.teams.length === 0) ? (
                    <div className="text-[11px] text-slate-500 italic py-1">No teams assigned yet.</div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {project.teams.map((t, idx) => (
                        <span key={idx} className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700/80 font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Key Personnel */}
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    KEY PERSONNEL ({project.members?.length || 0})
                  </h3>
                  <button
                    onClick={() => setShowAddMemberModal(true)}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>+ Add Member</span>
                  </button>
                </div>

                {(!project.members || project.members.length === 0) ? (
                  <div className="py-6 text-center text-slate-500 text-xs">
                    No personnel assigned yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/60 my-2">
                    {project.members.map((m) => (
                      <div key={m.id} className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-blue-500/30" />
                          <div>
                            <div className="text-xs font-bold text-slate-200">{m.name}</div>
                            <div className="text-[10px] text-blue-400 font-medium">{m.role}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Blockers & Commit Metrics */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold">
                    <AlertCircle className="w-4 h-4" />
                    <span>BLOCKERS</span>
                  </div>
                  <div className="text-2xl font-black text-slate-100 font-mono mt-2">{project.blockersCount || 0}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Critical blockers open</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                    <GitCommit className="w-4 h-4" />
                    <span>COMMITS</span>
                  </div>
                  <div className="text-2xl font-black text-slate-100 font-mono mt-2">{(project.commits7dCount || 0).toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Last 7 days velocity</div>
                </div>
              </div>

            </div>

          </div>
        </>
      )}

      {/* TAB 2: TASKS TAB */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search project tasks..."
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-52"
                />
              </div>

              <select
                value={taskStatusFilter}
                onChange={(e) => setTaskStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Statuses ({projectTasks.length})</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <ExportDropdown
                id="project-tasks-export-dropdown"
                label="Export Tasks"
                csvLabel={`Export ${filteredProjectTasks.length} Tasks (.csv)`}
                jsonLabel={`Export ${filteredProjectTasks.length} Tasks (.json)`}
                onExportCSV={handleExportProjectTasksCSV}
                onExportJSON={handleExportProjectTasksJSON}
                onOpenAdvanced={() => {
                  setExportModalType('project-tasks');
                  setIsExportModalOpen(true);
                }}
              />

              <button
                onClick={() => setShowAddTaskModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Add Task</span>
              </button>
            </div>
          </div>

          {/* Project Task List Table */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden">
            {filteredProjectTasks.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <CheckSquare className="w-8 h-8 mx-auto text-slate-600" />
                <div className="text-sm font-semibold text-slate-300">No tasks created for this project</div>
                <p className="text-xs text-slate-500">Dispatch work items and assign key deliverables to contributors.</p>
                <button
                  onClick={() => setShowAddTaskModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold shadow-sm hover:bg-blue-500 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>+ Add First Task</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Task Details</th>
                      <th className="py-3 px-4">Assignee</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Est. Hours</th>
                      <th className="py-3 px-4">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300 font-sans">
                    {filteredProjectTasks.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-100">{t.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono text-blue-400">{t.id}</span>
                            {t.tags && t.tags.length > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                {t.tags[0]}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <img src={t.assigneeAvatar} alt={t.assigneeName} className="w-5 h-5 rounded-full object-cover" />
                            <span className="text-xs text-slate-200">{t.assigneeName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            t.priority === 'High' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            t.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={t.status}
                            onChange={(e) => updateTaskStatus(t.id, e.target.value as any)}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-blue-500"
                          >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Review">Review</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          {t.estimatedHours || 12}h
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          {t.dueDate || '2026-08-30'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TEAMS & MEMBERS */}
      {activeTab === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Assigned Delivery Teams Box */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100">Assigned Delivery Teams</h3>
              <button
                onClick={() => setShowAddTeamModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Assign Team</span>
              </button>
            </div>

            {(!project.teams || project.teams.length === 0) ? (
              <div className="p-8 text-center text-slate-400 space-y-3">
                <Users className="w-8 h-8 mx-auto text-slate-600" />
                <div className="text-xs font-semibold text-slate-300">No teams assigned yet</div>
                <p className="text-[11px] text-slate-500">Assign engineering, design, or product units to collaborate on this project.</p>
                <button
                  onClick={() => setShowAddTeamModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Assign Team</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {project.teams.map((t, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                        T{idx + 1}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">{t}</div>
                        <div className="text-[10px] text-slate-400">Core Contributor Unit</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">Active</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assigned Key Personnel Box */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100">Assigned Key Personnel ({project.members?.length || 0})</h3>
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add Member</span>
              </button>
            </div>

            {(!project.members || project.members.length === 0) ? (
              <div className="p-8 text-center text-slate-400 space-y-3">
                <UserPlus className="w-8 h-8 mx-auto text-slate-600" />
                <div className="text-xs font-semibold text-slate-300">No personnel assigned yet</div>
                <p className="text-[11px] text-slate-500">Assign project managers, tech leads, or core developers.</p>
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 text-xs font-semibold transition-all cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Add Member</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {project.members.map((m) => (
                  <div key={m.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-blue-500/30" />
                      <div>
                        <div className="text-xs font-bold text-slate-200">{m.name}</div>
                        <div className="text-[10px] text-blue-400">{m.role}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Assigned</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ACTIVITY */}
      {activeTab === 'activity' && (
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Project Audit & Execution Log</h3>
              <p className="text-xs text-slate-400">Real-time audit telemetry for {project.code}</p>
            </div>
            <button
              onClick={() => setShowAddActivityModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Log Activity</span>
            </button>
          </div>

          <div className="space-y-3">
            {localActivities.map((act) => (
              <div key={act.id} className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <span className="text-slate-200">{act.text}</span>
                    <span className="text-[10px] text-slate-400 ml-2">by {act.user}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{act.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: FILES */}
      {activeTab === 'files' && (
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Project Documentation & Architecture Files</h3>
              <p className="text-xs text-slate-400">Central file repository for specifications and compliance</p>
            </div>
            <button
              onClick={() => setShowUploadFileModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>+ Upload Document</span>
            </button>
          </div>

          {localFiles.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-3">
              <FilePlus className="w-8 h-8 mx-auto text-slate-600" />
              <div className="text-xs font-semibold text-slate-300">No documents uploaded</div>
              <button
                onClick={() => setShowUploadFileModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Document</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {localFiles.map((f) => (
                <div key={f.id} className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="font-semibold text-slate-200">{f.name}</div>
                      <div className="text-[10px] text-slate-400">{f.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
                    <span>{f.size}</span>
                    <span>{f.updated}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Project Velocity & Milestone Burnup</h3>
                <p className="text-xs text-slate-400">Execution pacing for {project.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportProjectDossierCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Metrics CSV</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">COMPLETION RATE</span>
                <div className="text-2xl font-bold text-slate-100 font-mono mt-1">{project.progressPct}%</div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">On target for release</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TASKS CLOSED</span>
                <div className="text-2xl font-bold text-slate-100 font-mono mt-1">{project.completedTasks || 0} / {project.totalTasks || 0}</div>
                <div className="text-[10px] text-blue-400 font-semibold mt-0.5">Active sprint items</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WEEKLY COMMITS</span>
                <div className="text-2xl font-bold text-slate-100 font-mono mt-1">{project.commits7dCount || 0}</div>
                <div className="text-[10px] text-purple-400 font-semibold mt-0.5">7-day engineering velocity</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* MODALS */}
      {/* ============================================================================== */}

      {/* MODAL 1: Edit Project Modal */}
      {showEditProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-100">Edit Project: {project.code}</h3>
              <button onClick={() => setShowEditProjectModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProjectEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Project Code *</label>
                  <input
                    type="text"
                    required
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Planning">Planning</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditProjectModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Assign Team Modal */}
      {showAddTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-100">Assign Delivery Team</h3>
              <button onClick={() => setShowAddTeamModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignTeam} className="space-y-4">
              {globalTeams && globalTeams.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Select Existing Team</label>
                  <select
                    value={selectedTeamName}
                    onChange={(e) => {
                      setSelectedTeamName(e.target.value);
                      if (e.target.value) setCustomTeamName('');
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Choose from active teams --</option>
                    {globalTeams.map(t => (
                      <option key={t.id} value={t.name}>{t.name} ({t.department})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {globalTeams && globalTeams.length > 0 ? 'Or Type New Team Name' : 'Team Name *'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Frontend Engineering, Platform Security"
                  value={customTeamName}
                  onChange={(e) => {
                    setCustomTeamName(e.target.value);
                    if (e.target.value) setSelectedTeamName('');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTeamModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30"
                >
                  Assign Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-100">Add Key Personnel</h3>
              <button onClick={() => setShowAddMemberModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              {globalUsers && globalUsers.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Select Directory Member</label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => {
                      setSelectedUserId(e.target.value);
                      if (e.target.value) setCustomMemberName('');
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Choose from organization directory --</option>
                    {globalUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {globalUsers && globalUsers.length > 0 ? 'Or Type Member Name' : 'Member Name *'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan, Sarah Jenkins"
                  value={customMemberName}
                  onChange={(e) => {
                    setCustomMemberName(e.target.value);
                    if (e.target.value) setSelectedUserId('');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Project Role</label>
                <input
                  type="text"
                  placeholder="e.g. Lead Architect, Tech Lead, Senior Developer"
                  value={customMemberRole}
                  onChange={(e) => setCustomMemberRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Add Milestone Modal */}
      {showAddMilestoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-100">Add Milestone</h3>
              <button onClick={() => setShowAddMilestoneModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMilestone} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Milestone Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phase 1 Architecture Freeze & Security Audit"
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={milestoneDate}
                    onChange={(e) => setMilestoneDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Initial Status</label>
                  <select
                    value={milestoneStatus}
                    onChange={(e) => setMilestoneStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddMilestoneModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30"
                >
                  Create Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Add Task Modal Dialog */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-100">Add Task to {project.code}</h3>
              <button onClick={() => setShowAddTaskModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Calibrate precision matrix for vector search"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Assignee</label>
                <select
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  {project.members && project.members.length > 0 ? (
                    project.members.map(m => (
                      <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
                    ))
                  ) : (
                    <option value="Enterprise Lead">Enterprise Lead</option>
                  )}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: Upload Document Modal */}
      {showUploadFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-100">Upload Project Document</h3>
              <button onClick={() => setShowUploadFileModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadFile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Document Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. System-Architecture-v2.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={fileCategory}
                  onChange={(e) => setFileCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="Architecture Spec">Architecture Spec</option>
                  <option value="API Documentation">API Documentation</option>
                  <option value="Security Compliance">Security Compliance</option>
                  <option value="Release Notes">Release Notes</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadFileModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30"
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: Log Activity Modal */}
      {showAddActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-100">Log Execution Activity</h3>
              <button onClick={() => setShowAddActivityModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Activity Log Event *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Infrastructure failover configuration passed stress test benchmarking."
                  value={activityText}
                  onChange={(e) => setActivityText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Logged By</label>
                <input
                  type="text"
                  value={activityUser}
                  onChange={(e) => setActivityUser(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddActivityModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30"
                >
                  Log Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
