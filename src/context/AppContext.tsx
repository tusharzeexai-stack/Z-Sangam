import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  ViewType, 
  User, 
  Department, 
  Team, 
  Project, 
  Task, 
  ActivityEvent, 
  RolePermission 
} from '../types';
import { 
  CURRENT_USER, 
  MOCK_USERS, 
  MOCK_DEPARTMENTS, 
  MOCK_TEAMS, 
  MOCK_PROJECTS, 
  MOCK_TASKS, 
  MOCK_ACTIVITIES, 
  MOCK_ROLES 
} from '../data/mockData';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { AuthService } from '../services/auth.service';
import { ProjectService } from '../services/project.service';
import { DepartmentService } from '../services/department.service';
import { TeamService } from '../services/team.service';
import { MemberService } from '../services/member.service';
import { TaskService } from '../services/task.service';
import { ActivityService } from '../services/activity.service';
import { NotificationService, NotificationItem } from '../services/notification.service';
import { OrganizationService, DashboardMetrics } from '../services/organization.service';

interface NotificationToast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface AppContextType {
  // Navigation & Authentication
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  isAuthenticated: boolean;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  login: (email: string, pass?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isBackendConnected: boolean;

  // Selected Items
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  selectedProject: Project | undefined;
  
  // Data Collections
  users: User[];
  departments: Department[];
  teams: Team[];
  projects: Project[];
  tasks: Task[];
  activities: ActivityEvent[];
  roles: RolePermission[];
  notifications: NotificationItem[];
  dashboardMetrics: DashboardMetrics | null;

  // Mutations
  addProject: (projectData: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  addTask: (taskData: Partial<Task>) => Promise<Task>;
  updateTaskStatus: (taskId: string, newStatus: Task['status']) => Promise<void>;
  addMember: (memberData: Partial<User>) => Promise<User>;
  updateMember: (userId: string, updates: Partial<User>) => Promise<void>;
  deleteMember: (userId: string) => Promise<void>;
  addDepartment: (deptData: Partial<Department>) => Promise<Department>;
  addTeam: (teamData: Partial<Team>, deptId?: string, leadId?: string) => Promise<Team>;
  updateTeam: (teamId: string, updates: Partial<Team>, leadId?: string, deptId?: string) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  updateRolePermission: (roleId: string, section: 'userManagement' | 'workManagement', permKey: string, val: boolean) => void;
  refreshData: () => Promise<void>;
  
  // UI Theme & Modals
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isQuickCreateOpen: boolean;
  setIsQuickCreateOpen: (open: boolean) => void;
  isInviteMemberOpen: boolean;
  setIsInviteMemberOpen: (open: boolean) => void;
  isTeamModalOpen: boolean;
  setIsTeamModalOpen: (open: boolean) => void;
  editingUser: User | null;
  setEditingUser: (user: User | null) => void;
  editingTeam: Team | null;
  setEditingTeam: (team: Team | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Toasts
  toast: NotificationToast | null;
  toasts: NotificationToast[];
  showToast: (title: string, message: string, type?: NotificationToast['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('zsangam_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  const [activeView, setActiveViewState] = useState<ViewType>(() => {
    const saved = localStorage.getItem('zsangam_active_view');
    return (saved as ViewType) || 'dashboard';
  });

  const setActiveView = (view: ViewType) => {
    setActiveViewState(view);
    localStorage.setItem('zsangam_active_view', view);
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('zsangam_auth') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<User>({
    ...CURRENT_USER,
    id: '00000000-0000-0000-0000-000000000099',
  });

  const [selectedProjectId, setSelectedProjectIdState] = useState<string>(() => {
    return localStorage.getItem('zsangam_selected_project_id') || '';
  });

  const setSelectedProjectId = (id: string) => {
    setSelectedProjectIdState(id);
    if (id) localStorage.setItem('zsangam_selected_project_id', id);
  };
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(isSupabaseConfigured());

  // Collections (Pure live database state from Supabase)
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [roles, setRoles] = useState<RolePermission[]>(MOCK_ROLES);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState<boolean>(false);
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState<boolean>(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState<boolean>(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toasts, setToasts] = useState<NotificationToast[]>([]);

  // Apply theme to html / body element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    localStorage.setItem('zsangam_theme', theme);
  }, [theme]);

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const showToast = useCallback((title: string, message: string, type: NotificationToast['type'] = 'success') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Fetch real data from Supabase backend if configured
  const loadData = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setIsBackendConnected(false);
      return;
    }

    setIsLoading(true);
    try {
      const [
        deptsRes,
        teamsRes,
        membersRes,
        projectsRes,
        tasksRes,
        actsRes,
        notifsRes,
        metricsRes
      ] = await Promise.all([
        DepartmentService.getAll(),
        TeamService.getAll(),
        MemberService.getAll(),
        ProjectService.getAll(),
        TaskService.getAll(),
        ActivityService.getAll(),
        Promise.resolve([]),  // notifications skipped — admin user has no DB row
        OrganizationService.getDashboardMetrics()
      ]);

      // Calculate real dynamic member & project counts and resolve Team Lead for teams
      const processedTeams = teamsRes.map(t => {
        const foundLead = t.teamLeadId ? membersRes.find(m => m.id === t.teamLeadId) : null;
        const teamMembersCount = membersRes.filter(m => m.team === t.name || m.department === t.department).length;
        const teamProjectsCount = projectsRes.filter(p => p.teams?.includes(t.name) || p.department === t.department).length;
        return {
          ...t,
          leadName: foundLead ? foundLead.name : (t.leadName && t.leadName !== 'Unassigned' ? t.leadName : 'Unassigned'),
          leadAvatar: foundLead ? foundLead.avatar : t.leadAvatar,
          membersCount: t.membersCount > 0 ? t.membersCount : teamMembersCount,
          activeProjectsCount: t.activeProjectsCount > 0 ? t.activeProjectsCount : teamProjectsCount,
        };
      });

      const processedDepts = deptsRes.map(d => {
        const deptTeamsCount = teamsRes.filter(t => t.department === d.name).length;
        const deptMembersCount = membersRes.filter(m => m.department === d.name).length;
        const deptProjectsCount = projectsRes.filter(p => p.department === d.name).length;
        return {
          ...d,
          teamsCount: d.teamsCount > 0 ? d.teamsCount : deptTeamsCount,
          membersCount: d.membersCount > 0 ? d.membersCount : deptMembersCount,
          activeProjectsCount: d.activeProjectsCount > 0 ? d.activeProjectsCount : deptProjectsCount,
        };
      });

      setDepartments(processedDepts);
      setTeams(processedTeams);
      setUsers(membersRes);
      setProjects(projectsRes);
      if (projectsRes.length > 0) {
        const savedId = localStorage.getItem('zsangam_selected_project_id');
        if (savedId && projectsRes.some(p => p.id === savedId)) {
          setSelectedProjectIdState(savedId);
        } else if (!selectedProjectId) {
          setSelectedProjectId(projectsRes[0].id);
        }
      }
      setTasks(tasksRes);
      setActivities(actsRes);
      setNotifications(notifsRes);
      if (metricsRes) setDashboardMetrics(metricsRes);

      setIsBackendConnected(true);
    } catch (err) {
      console.error('Error fetching data from Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser.id, selectedProjectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Supabase Realtime channel subscriptions for live multi-user sync
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const channel = supabase
      .channel('zsangam_realtime_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, async () => {
        const freshMembers = await MemberService.getAll();
        setUsers(freshMembers);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'departments' }, async () => {
        const freshDepts = await DepartmentService.getAll();
        if (freshDepts.length) setDepartments(freshDepts);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, async () => {
        const freshTeams = await TeamService.getAll();
        if (freshTeams.length) setTeams(freshTeams);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, async () => {
        const freshTasks = await TaskService.getAll();
        if (freshTasks.length) setTasks(freshTasks);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, async () => {
        const freshProjects = await ProjectService.getAll();
        if (freshProjects.length) setProjects(freshProjects);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, async () => {
        const freshActs = await ActivityService.getAll();
        if (freshActs.length) setActivities(freshActs);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const login = async (usernameOrEmail: string, pass?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const inputId = usernameOrEmail.trim();
      const inputPass = pass ? pass.trim() : '';

      // Default credentials check: Z-Sangam / Admin@Sangam
      const isDefaultCreds = (inputId === 'Z-Sangam' || inputId.toLowerCase() === 'admin@zsangam.enterprise') && inputPass === 'Admin@Sangam';
      const isLegacyDemoCreds = (inputId.toLowerCase() === 'admin@zsangam.com' || inputId === 'Z-Sangam') && (inputPass === 'Admin@123' || inputPass === 'Admin@Sangam');

      if (isDefaultCreds || isLegacyDemoCreds) {
        const authedUser: User = {
          ...CURRENT_USER,
          name: 'Z-Sangam Admin',
          email: 'admin@zsangam.enterprise',
          role: 'Super Admin'
        };
        setCurrentUser(authedUser);
        setIsAuthenticated(true);
        sessionStorage.setItem('zsangam_auth', 'true');
        setActiveView('dashboard');
        showToast('Welcome to Z-Sangam', 'Signed in as Z-Sangam Super Admin', 'success');
        if (isSupabaseConfigured()) loadData();
        return true;
      }

      if (isSupabaseConfigured() && pass) {
        const { user: authedUser, error } = await AuthService.signIn(usernameOrEmail, pass);
        if (!error && authedUser) {
          setCurrentUser(authedUser);
          setIsAuthenticated(true);
          sessionStorage.setItem('zsangam_auth', 'true');
          setActiveView('dashboard');
          showToast('Welcome to Z-Sangam', `Signed in as ${authedUser.name} (${authedUser.role})`, 'success');
          loadData();
          return true;
        }
      }

      // Check existing profiles / mock users
      const foundUser = users.find(
        u => u.email.toLowerCase() === inputId.toLowerCase() || u.name.toLowerCase() === inputId.toLowerCase()
      );

      if (foundUser && (inputPass === 'Admin@Sangam' || inputPass === 'Admin@123')) {
        setCurrentUser(foundUser);
        setIsAuthenticated(true);
        sessionStorage.setItem('zsangam_auth', 'true');
        setActiveView('dashboard');
        showToast('Welcome to Z-Sangam', `Signed in as ${foundUser.name} (${foundUser.role})`, 'success');
        return true;
      }

      showToast('Authentication Failed', 'Invalid username or password.', 'error');
      return false;
    } catch (err: any) {
      showToast('Authentication Failed', err?.message || 'Invalid credentials.', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await AuthService.signOut();
    }
    setIsAuthenticated(false);
    sessionStorage.removeItem('zsangam_auth');
    setActiveView('login');
    showToast('Signed Out', 'You have been securely disconnected.', 'info');
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId) ?? projects[0] ?? undefined;

  const addProject = async (projectData: Partial<Project>): Promise<Project> => {
    if (isSupabaseConfigured()) {
      try {
        const created = await ProjectService.create(projectData);
        if (created) {
          setProjects(prev => [created, ...prev.filter(p => p.id !== created.id)]);
          setSelectedProjectId(created.id);
          showToast('Project Created', `Project ${created.code} saved to Supabase database.`, 'success');
          return created;
        }
      } catch (err: any) {
        console.error('Supabase project creation error:', err);
        showToast('Supabase Error', err?.message || 'Failed to save project in Supabase.', 'error');
      }
    }

    // Local / Offline Fallback
    const codeNum = projects.length + 25;
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      code: projectData.code || `ZS-PROJ-0${codeNum}`,
      name: projectData.name || 'Untitled Enterprise Initiative',
      description: projectData.description || 'Enterprise project synchronized across cross-functional units.',
      status: projectData.status || 'In Progress',
      priority: projectData.priority || 'High',
      department: projectData.department || 'Engineering',
      teams: projectData.teams?.length ? projectData.teams : ['Frontend Engineering', 'Backend Systems'],
      leadName: projectData.leadName || currentUser.name,
      leadAvatar: projectData.leadAvatar || currentUser.avatar,
      members: projectData.members?.length ? projectData.members : [
        { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar, role: currentUser.role }
      ],
      startDate: projectData.startDate || 'Aug 20, 2023',
      targetEndDate: projectData.targetEndDate || 'Nov 30, 2023',
      progressPct: projectData.progressPct || 0,
      completedTasks: 0,
      totalTasks: 12,
      tags: projectData.tags?.length ? projectData.tags : ['Enterprise', 'Q3_Initiative'],
      blockersCount: 0,
      commits7dCount: 14,
      sprintPhaseRemainingDays: 30,
      milestones: projectData.milestones || [
        { id: `m-${Date.now()}-1`, title: 'Project Scoping & Requirement Freeze', targetDate: 'Sep 01, 2023', status: 'Completed', completionDate: 'Aug 25, 2023' },
        { id: `m-${Date.now()}-2`, title: 'Architecture Specification & Milestone 1', targetDate: 'Sep 20, 2023', status: 'In Progress' },
        { id: `m-${Date.now()}-3`, title: 'System Validation & Production Deployment', targetDate: 'Nov 30, 2023', status: 'Pending' },
      ]
    };

    setProjects(prev => [newProject, ...prev]);
    setSelectedProjectId(newProject.id);

    const newActivity: ActivityEvent = {
      id: `act-${Date.now()}`,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      userRole: currentUser.role,
      action: 'created a new project',
      target: newProject.name,
      targetType: 'project',
      timestamp: new Date().toISOString(),
      relativeTime: 'Just now',
      dateGroup: 'TODAY',
      details: `Project code ${newProject.code} registered under ${newProject.department} department.`
    };
    setActivities(prev => [newActivity, ...prev]);

    showToast('Project Created', `Project ${newProject.code} was successfully deployed.`, 'success');
    return newProject;
  };


  const updateProject = async (id: string, updates: Partial<Project>) => {
    // Handle team assignment to Supabase project_teams
    if (isSupabaseConfigured() && updates.teams !== undefined) {
      const currentProject = projects.find(p => p.id === id);
      const currentTeams = currentProject?.teams || [];
      const newTeams = updates.teams || [];

      // Add newly assigned teams
      const added = newTeams.filter(t => !currentTeams.includes(t));
      for (const teamName of added) {
        await ProjectService.assignTeam(id, teamName);
      }
      // Remove deassigned teams
      const removed = currentTeams.filter(t => !newTeams.includes(t));
      for (const teamName of removed) {
        await ProjectService.removeTeam(id, teamName);
      }
    }

    // Handle member assignment to Supabase project_members
    if (isSupabaseConfigured() && updates.members !== undefined) {
      const currentProject = projects.find(p => p.id === id);
      const currentMemberIds = (currentProject?.members || []).map(m => m.id);
      const newMembers = updates.members || [];
      const newMemberIds = newMembers.map(m => m.id);

      // Add new members
      const added = newMembers.filter(m => !currentMemberIds.includes(m.id));
      for (const member of added) {
        // Only assign if it's a real Supabase profile UUID (not pm-timestamp format)
        if (member.id && !member.id.startsWith('pm-')) {
          await ProjectService.assignMember(id, member.id, member.role);
        }
      }
      // Remove removed members
      const removedIds = currentMemberIds.filter(mid => !newMemberIds.includes(mid));
      for (const userId of removedIds) {
        if (userId && !userId.startsWith('pm-')) {
          await ProjectService.removeMember(id, userId);
        }
      }
    }

    // Update core project fields in Supabase
    const coreUpdates: Partial<Project> = {};
    if (updates.name !== undefined) coreUpdates.name = updates.name;
    if (updates.description !== undefined) coreUpdates.description = updates.description;
    if (updates.status !== undefined) coreUpdates.status = updates.status;
    if (updates.priority !== undefined) coreUpdates.priority = updates.priority;
    if (updates.progressPct !== undefined) coreUpdates.progressPct = updates.progressPct;
    if (updates.targetEndDate !== undefined) coreUpdates.targetEndDate = updates.targetEndDate;
    if (Object.keys(coreUpdates).length > 0 && isSupabaseConfigured()) {
      await ProjectService.update(id, coreUpdates);
    }

    // Always update local in-memory state
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    showToast('Project Updated', 'Changes synchronized with Supabase.', 'info');
  };


  const addTask = async (taskData: Partial<Task>): Promise<Task> => {
    try {
      if (isSupabaseConfigured()) {
        const created = await TaskService.create(taskData, selectedProject?.id);
        if (created) {
          setTasks(prev => [created, ...prev]);
          showToast('Task Dispatched', `Task ${created.title} created in Supabase.`, 'success');
          return created;
        }
      }
    } catch (err: any) {
      console.warn('Supabase task creation failed, saving locally:', err);
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskData.title || 'New Work Assignment',
      projectCode: taskData.projectCode || selectedProject?.code || 'ZS-PROJ',
      projectName: taskData.projectName || selectedProject?.name || 'Enterprise Project',
      department: taskData.department || selectedProject?.department || 'Engineering',
      team: taskData.team || 'Backend Systems',
      assigneeName: taskData.assigneeName || currentUser.name,
      assigneeAvatar: taskData.assigneeAvatar || currentUser.avatar,
      priority: taskData.priority || 'Medium',
      status: taskData.status || 'To Do',
      dueDate: taskData.dueDate || 'Sep 15, 2023',
      estimatedHours: taskData.estimatedHours || 12,
      tags: taskData.tags || ['Task', 'Workload']
    };

    setTasks(prev => [newTask, ...prev]);

    const newAct: ActivityEvent = {
      id: `act-${Date.now()}`,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      userRole: currentUser.role,
      action: 'assigned new task',
      target: newTask.title,
      targetType: 'task',
      timestamp: new Date().toISOString(),
      relativeTime: 'Just now',
      dateGroup: 'TODAY',
      details: `Target project ${newTask.projectCode} assigned to ${newTask.assigneeName}.`
    };
    setActivities(prev => [newAct, ...prev]);

    showToast('Task Dispatched', `Task was assigned to ${newTask.assigneeName}.`, 'success');
    return newTask;
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    if (isSupabaseConfigured()) {
      await TaskService.updateStatus(taskId, newStatus);
    }

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        if (newStatus === 'Completed' && t.status !== 'Completed') {
          const act: ActivityEvent = {
            id: `act-${Date.now()}`,
            userName: currentUser.name,
            userAvatar: currentUser.avatar,
            userRole: currentUser.role,
            action: 'completed task',
            target: t.title,
            targetType: 'task',
            timestamp: new Date().toISOString(),
            relativeTime: 'Just now',
            dateGroup: 'TODAY',
            details: `Task on project ${t.projectCode} marked as completed.`
          };
          setActivities(a => [act, ...a]);
        }
        return { ...t, status: newStatus };
      }
      return t;
    }));
  };

  const addMember = async (memberData: Partial<User>): Promise<User> => {
    if (isSupabaseConfigured()) {
      try {
        const created = await MemberService.invite(memberData);
        if (created) {
          setUsers(prev => [created, ...prev.filter(u => u.id !== created.id)]);
          showToast('Member Saved to Supabase', `${created.name} was successfully stored in Supabase database.`, 'success');
          return created;
        }
      } catch (err: any) {
        console.error('Supabase member creation error:', err);
        showToast('Supabase Error', err?.message || 'Failed to insert profile into Supabase. Run migration 006 in SQL editor.', 'error');
      }
    }

    const newMember: User = {
      id: `usr-${Date.now()}`,
      name: memberData.name || 'New Specialist',
      email: memberData.email || 'specialist@zsangam.enterprise',
      role: memberData.role || 'Senior Engineer',
      avatar: memberData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      department: memberData.department || 'Engineering & Technology',
      team: memberData.team || 'Frontend Engineering',
      status: 'Active',
      skills: memberData.skills || ['TypeScript', 'Cloud', 'Architecture'],
      projectsCount: 1,
      lastActive: 'Just now',
      location: memberData.location || 'San Francisco, CA',
    };

    setUsers(prev => [newMember, ...prev]);

    const act: ActivityEvent = {
      id: `act-${Date.now()}`,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      userRole: currentUser.role,
      action: 'onboarded new member',
      target: newMember.name,
      targetType: 'member',
      timestamp: new Date().toISOString(),
      relativeTime: 'Just now',
      dateGroup: 'TODAY',
      details: `Added to ${newMember.department} (${newMember.team}).`
    };
    setActivities(prev => [act, ...prev]);

    showToast('Member Onboarded (Local)', `${newMember.name} joined workspace in local state.`, 'info');
    return newMember;
  };

  const [editingUser, setEditingUser] = useState<User | null>(null);

  const updateMember = async (userId: string, updates: Partial<User>) => {
    if (isSupabaseConfigured()) {
      try {
        await MemberService.update(userId, updates);
      } catch (err: any) {
        console.error('Error updating member profile in Supabase:', err);
        showToast('Supabase Update Error', err?.message || 'Failed to update profile in Supabase.', 'error');
      }
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    showToast('Member Profile Updated', `Changes saved successfully.`, 'success');
  };

  const deleteMember = async (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (isSupabaseConfigured()) {
      try {
        await MemberService.delete(userId);
      } catch (err: any) {
        console.error('Error deleting member profile in Supabase:', err);
        showToast('Supabase Delete Error', err?.message || 'Failed to delete profile from Supabase.', 'error');
      }
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    showToast('Member Removed', `${targetUser?.name || 'Member'} was removed from the organization.`, 'info');
  };

  const addDepartment = async (deptData: Partial<Department>): Promise<Department> => {
    if (isSupabaseConfigured()) {
      try {
        const created = await DepartmentService.create(deptData);
        if (created) {
          setDepartments(prev => [created, ...prev.filter(d => d.id !== created.id)]);
          showToast('Department Provisioned', `Department ${created.name} saved to Supabase.`, 'success');
          return created;
        }
      } catch (err: any) {
        console.error('Supabase dept create error:', err);
        showToast('Supabase Error', err?.message || 'Failed to save department in Supabase.', 'error');
      }
    }

    const newDept: Department = {
      id: `dept-${Date.now()}`,
      name: deptData.name || 'Strategic Operations',
      code: deptData.code || 'OPS-2',
      description: deptData.description || 'Department aligned on corporate strategic goals.',
      headName: deptData.headName || currentUser.name,
      headAvatar: deptData.headAvatar || currentUser.avatar,
      teamsCount: 0,
      membersCount: 0,
      activeProjectsCount: 0,
      resourceAllocationPct: 0,
      status: (deptData.status as any) || 'ON TRACK',
      leadEmail: currentUser.email,
      accentColor: deptData.accentColor || '#3b82f6',
      category: deptData.category || 'Strategic Innovation'
    };

    setDepartments(prev => [newDept, ...prev]);
    showToast('Department Provisioned', `Department ${newDept.name} initialized.`, 'success');
    return newDept;
  };

  const addTeam = async (teamData: Partial<Team>, deptId?: string, leadId?: string): Promise<Team> => {
    if (isSupabaseConfigured()) {
      try {
        const created = await TeamService.create(teamData, deptId, leadId);
        if (created) {
          setTeams(prev => [created, ...prev.filter(t => t.id !== created.id)]);
          showToast('Team Created', `Team ${created.name} saved to Supabase.`, 'success');
          return created;
        }
      } catch (err: any) {
        console.error('Supabase team create error:', err);
        showToast('Supabase Error', err?.message || 'Failed to save team in Supabase.', 'error');
      }
    }

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: teamData.name || 'Emerging Technologies',
      code: teamData.code || 'ENG-ET',
      shortTag: teamData.shortTag || 'ET',
      department: teamData.department || 'Engineering',
      leadName: teamData.leadName || currentUser.name,
      leadAvatar: teamData.leadAvatar || currentUser.avatar,
      membersCount: 0,
      activeProjectsCount: 0,
      completionRatePct: 0,
      status: teamData.status || 'Active',
      focusArea: teamData.focusArea || 'Rapid prototyping & production acceleration'
    };

    setTeams(prev => [newTeam, ...prev]);
    showToast('Team Created', `Team ${newTeam.name} is now active.`, 'success');
    return newTeam;
  };

  const updateTeam = async (teamId: string, updates: Partial<Team>, leadId?: string, deptId?: string) => {
    if (isSupabaseConfigured()) {
      try {
        await TeamService.update(teamId, updates, leadId, deptId);
      } catch (err: any) {
        console.error('Error updating team in Supabase:', err);
        showToast('Supabase Update Error', err?.message || 'Failed to update team in Supabase.', 'error');
      }
    }
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, ...updates, teamLeadId: leadId !== undefined ? leadId : t.teamLeadId } : t));
    showToast('Team Updated', 'Changes saved successfully.', 'success');
  };

  const deleteTeam = async (teamId: string) => {
    const targetTeam = teams.find(t => t.id === teamId);
    if (isSupabaseConfigured()) {
      try {
        await TeamService.delete(teamId);
      } catch (err: any) {
        console.error('Error deleting team in Supabase:', err);
        showToast('Supabase Delete Error', err?.message || 'Failed to delete team from Supabase.', 'error');
      }
    }
    setTeams(prev => prev.filter(t => t.id !== teamId));
    showToast('Team Removed', `${targetTeam?.name || 'Team'} was removed successfully.`, 'info');
  };

  const updateRolePermission = (
    roleId: string, 
    section: 'userManagement' | 'workManagement', 
    permKey: string, 
    val: boolean
  ) => {
    setRoles(prev => prev.map(r => {
      if (r.id === roleId) {
        return {
          ...r,
          permissions: {
            ...r.permissions,
            [section]: {
              ...r.permissions[section],
              [permKey]: val
            }
          }
        };
      }
      return r;
    }));
    showToast('Permissions Updated', 'Role security matrix saved.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        isAuthenticated,
        currentUser,
        setCurrentUser,
        login,
        logout,
        isLoading,
        isBackendConnected,
        selectedProjectId,
        setSelectedProjectId,
        selectedProject,
        users,
        departments,
        teams,
        projects,
        tasks,
        activities,
        roles,
        notifications,
        dashboardMetrics,
        addProject,
        updateProject,
        addTask,
        updateTaskStatus,
        addMember,
        updateMember,
        deleteMember,
        addDepartment,
        addTeam,
        updateTeam,
        deleteTeam,
        updateRolePermission,
        refreshData: loadData,
        theme,
        setTheme,
        toggleTheme,
        isSidebarOpen,
        setIsSidebarOpen,
        isQuickCreateOpen,
        setIsQuickCreateOpen,
        isInviteMemberOpen,
        setIsInviteMemberOpen,
        isTeamModalOpen,
        setIsTeamModalOpen,
        editingUser,
        setEditingUser,
        editingTeam,
        setEditingTeam,
        searchQuery,
        setSearchQuery,
        toast: toasts.length > 0 ? toasts[toasts.length - 1] : null,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
