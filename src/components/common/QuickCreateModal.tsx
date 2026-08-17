import React, { useState } from 'react';
import { 
  X, 
  FolderKanban, 
  CheckSquare, 
  Building2, 
  Users2, 
  UserPlus, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const QuickCreateModal: React.FC = () => {
  const { 
    isQuickCreateOpen, 
    setIsQuickCreateOpen, 
    addProject, 
    addTask, 
    addDepartment, 
    addTeam, 
    addMember, 
    departments, 
    teams, 
    projects,
    setActiveView 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'project' | 'task' | 'team' | 'department' | 'member'>('task');

  // Form states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskProject, setTaskProject] = useState(projects[0]?.code || 'ZS-PROJ-024');
  const [taskPriority, setTaskPriority] = useState<'High' | 'Medium' | 'Low'>('High');

  const [projName, setProjName] = useState('');
  const [projCode, setProjCode] = useState('');
  const [projDept, setProjDept] = useState(departments[0]?.name || 'Engineering');
  const [projDesc, setProjDesc] = useState('');

  const [teamName, setTeamName] = useState('');
  const [teamDept, setTeamDept] = useState(departments[0]?.name || 'Engineering');

  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');

  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('Senior Engineer');

  if (!isQuickCreateOpen) return null;

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    const proj = projects.find(p => p.code === taskProject);
    await addTask({
      title: taskTitle,
      projectCode: taskProject,
      projectName: proj?.name || 'Enterprise Project',
      priority: taskPriority,
      department: proj?.department || 'Engineering',
      status: 'To Do'
    });
    setTaskTitle('');
    setIsQuickCreateOpen(false);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;
    await addProject({
      name: projName,
      code: projCode || `ZS-PROJ-0${Math.floor(Math.random() * 80 + 20)}`,
      department: projDept,
      description: projDesc || 'Cross-functional enterprise priority initiative.'
    });
    setProjName('');
    setProjCode('');
    setProjDesc('');
    setIsQuickCreateOpen(false);
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    await addTeam({
      name: teamName,
      department: teamDept,
      code: `${teamDept.substring(0, 3).toUpperCase()}-${teamName.substring(0, 2).toUpperCase()}`,
      shortTag: teamName.substring(0, 2).toUpperCase(),
    });
    setTeamName('');
    setIsQuickCreateOpen(false);
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) return;
    await addDepartment({
      name: deptName,
      code: deptCode || deptName.substring(0, 3).toUpperCase(),
    });
    setDeptName('');
    setDeptCode('');
    setIsQuickCreateOpen(false);
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberEmail.trim()) return;
    await addMember({
      name: memberName,
      email: memberEmail,
      role: memberRole as any,
    });
    setMemberName('');
    setMemberEmail('');
    setIsQuickCreateOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Quick Create</h3>
              <p className="text-xs text-slate-400">Instantly provision entities into the enterprise sync registry</p>
            </div>
          </div>
          <button
            onClick={() => setIsQuickCreateOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 sm:px-6 pt-2 gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'task', label: 'Task', icon: CheckSquare },
            { id: 'project', label: 'Project', icon: FolderKanban },
            { id: 'member', label: 'Member', icon: UserPlus },
            { id: 'team', label: 'Team', icon: Users2 },
            { id: 'department', label: 'Department', icon: Building2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 whitespace-nowrap shrink-0 transition-all ${
                  active
                    ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-md'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <div className="p-6">
          {activeTab === 'task' && (
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Task Description / Objective *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement distributed tracing header propagation"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Project</label>
                  <select
                    value={taskProject}
                    onChange={(e) => setTaskProject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.code}>{p.code} - {p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsQuickCreateOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30"
                >
                  Dispatch Task
                </button>
              </div>
            </form>
          )}

          {activeTab === 'project' && (
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Project Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unified Data Lakehouse 3.0"
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Project Code</label>
                  <input
                    type="text"
                    placeholder="ZS-PROJ-088"
                    value={projCode}
                    onChange={(e) => setProjCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Lead Department</label>
                <select
                  value={projDept}
                  onChange={(e) => setProjDept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Executive Summary / Scope</label>
                <textarea
                  rows={2}
                  placeholder="Outline key deliverables, targets, and strategic alignment..."
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex justify-between items-center border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickCreateOpen(false);
                    setActiveView('create-project');
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                >
                  <span>Open Full 5-Step Project Wizard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsQuickCreateOpen(false)}
                    className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30"
                  >
                    Create Project
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'member' && (
            <form onSubmit={handleCreateMember} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Lin"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Corporate Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="maya.lin@zsangam.enterprise"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Designation / Role</label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="Senior Engineer">Senior Engineer</option>
                  <option value="AI Researcher">AI Researcher</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Department Head">Department Head</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="Designer">Designer</option>
                  <option value="Member">Member</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsQuickCreateOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
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
          )}

          {activeTab === 'team' && (
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Team Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Compute Fabric"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Department</label>
                <select
                  value={teamDept}
                  onChange={(e) => setTeamDept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsQuickCreateOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30"
                >
                  Initialize Team
                </button>
              </div>
            </form>
          )}

          {activeTab === 'department' && (
            <form onSubmit={handleCreateDept} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Department Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Strategic Global Partnerships"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Dept Code</label>
                  <input
                    type="text"
                    placeholder="SGP"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-400 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsQuickCreateOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30"
                >
                  Register Department
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
