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
  addDepartment: (deptData: Partial<Department>) => Promise<Department>;
  addTeam: (teamData: Partial<Team>) => Promise<Team>;
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

  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj-01');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(isSupabaseConfigured());

  // Collections (Use live Supabase state when connected; default to mock data only if offline/unconfigured)
  const [users, setUsers] = useState<User[]>(() => isSupabaseConfigured() ? [] : MOCK_USERS);
  const [departments, setDepartments] = useState<Department[]>(() => isSupabaseConfigured() ? [] : MOCK_DEPARTMENTS);
  const [teams, setTeams] = useState<Team[]>(() => isSupabaseConfigured() ? [] : MOCK_TEAMS);
  const [projects, setProjects] = useState<Project[]>(() => isSupabaseConfigured() ? [] : MOCK_PROJECTS);
  const [tasks, setTasks] = useState<Task[]>(() => isSupabaseConfigured() ? [] : MOCK_TASKS);
  const [activities, setActivities] = useState<ActivityEvent[]>(() => isSupabaseConfigured() ? [] : MOCK_ACTIVITIES);
  const [roles, setRoles] = useState<RolePermission[]>(MOCK_ROLES);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState<boolean>(false);
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState<boolean>(false);
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
        NotificationService.getUserNotifications(currentUser.id),
        OrganizationService.getDashboardMetrics()
      ]);

      setDepartments(deptsRes);
      setTeams(teamsRes);
      setUsers(membersRes);
      setProjects(projectsRes);
      if (projectsRes.length > 0) {
        if (!selectedProjectId || selectedProjectId === 'proj-01') {
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

  const login = async (email: string, pass?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured() && pass) {
        const { user: authedUser, error } = await AuthService.signIn(email, pass);
        if (!error && authedUser) {
          setCurrentUser(authedUser);
          setIsAuthenticated(true);
          setActiveView('dashboard');
          showToast('Welcome to Z-Sangam', `Signed in as ${authedUser.name} (${authedUser.role})`, 'success');
          loadData();
          return true;
        }
      }

      // Demo login fallback
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase()) || {
        ...CURRENT_USER,
        email: email || CURRENT_USER.email,
        name: email.includes('admin') ? 'Enterprise Super Admin' : 'John Doe',
      };
      setCurrentUser(foundUser);
      setIsAuthenticated(true);
      setActiveView('dashboard');
      showToast('Welcome to Z-Sangam', `Signed in as ${foundUser.name} (${foundUser.role})`, 'success');
      return true;
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
    setActiveView('login');
    showToast('Signed Out', 'You have been securely disconnected.', 'info');
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const addProject = async (projectData: Partial<Project>): Promise<Project> => {
    try {
      if (isSupabaseConfigured()) {
        const created = await ProjectService.create(projectData);
        if (created) {
          setProjects(prev => [created, ...prev]);
          setSelectedProjectId(created.id);
          showToast('Project Created', `Project ${created.code} was persisted to Supabase database.`, 'success');
          return created;
        }
      }
    } catch (err: any) {
      console.warn('Supabase project creation failed, persisting locally:', err);
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
    if (isSupabaseConfigured()) {
      await ProjectService.update(id, updates);
    }
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    showToast('Project Updated', 'Changes were synchronized across the enterprise.', 'info');
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
      projectCode: taskData.projectCode || selectedProject.code,
      projectName: taskData.projectName || selectedProject.name,
      department: taskData.department || selectedProject.department,
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
    try {
      if (isSupabaseConfigured()) {
        const created = await MemberService.invite(memberData);
        if (created) {
          setUsers(prev => [created, ...prev]);
          showToast('Member Onboarded', `${created.name} added to Supabase.`, 'success');
          return created;
        }
      }
    } catch (err: any) {
      console.warn('Supabase member invite error:', err);
    }

    const newMember: User = {
      id: `usr-${Date.now()}`,
      name: memberData.name || 'New Specialist',
      email: memberData.email || 'specialist@zsangam.enterprise',
      role: memberData.role || 'Senior Engineer',
      avatar: memberData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      department: memberData.department || 'Engineering',
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

    showToast('Member Onboarded', `${newMember.name} joined the organization workspace.`, 'success');
    return newMember;
  };

  const addDepartment = async (deptData: Partial<Department>): Promise<Department> => {
    try {
      if (isSupabaseConfigured()) {
        const created = await DepartmentService.create(deptData);
        if (created) {
          setDepartments(prev => [created, ...prev]);
          showToast('Department Provisioned', `Department ${created.name} saved to Supabase.`, 'success');
          return created;
        }
      }
    } catch (err: any) {
      console.warn('Supabase dept create error:', err);
    }

    const newDept: Department = {
      id: `dept-${Date.now()}`,
      name: deptData.name || 'Strategic Operations',
      code: deptData.code || 'OPS-2',
      description: deptData.description || 'Department aligned on corporate strategic goals.',
      headName: deptData.headName || currentUser.name,
      headAvatar: deptData.headAvatar || currentUser.avatar,
      teamsCount: 1,
      membersCount: 4,
      activeProjectsCount: 1,
      resourceAllocationPct: 75,
      status: 'ON TRACK',
      leadEmail: currentUser.email,
      accentColor: '#3b82f6',
      category: 'Strategic Innovation'
    };

    setDepartments(prev => [newDept, ...prev]);
    showToast('Department Provisioned', `Department ${newDept.name} initialized.`, 'success');
    return newDept;
  };

  const addTeam = async (teamData: Partial<Team>): Promise<Team> => {
    try {
      if (isSupabaseConfigured()) {
        const created = await TeamService.create(teamData);
        if (created) {
          setTeams(prev => [created, ...prev]);
          showToast('Team Created', `Team ${created.name} saved to Supabase.`, 'success');
          return created;
        }
      }
    } catch (err: any) {
      console.warn('Supabase team create error:', err);
    }

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: teamData.name || 'Emerging Technologies',
      code: teamData.code || 'ENG-ET',
      shortTag: teamData.shortTag || 'ET',
      department: teamData.department || 'Engineering',
      leadName: teamData.leadName || currentUser.name,
      leadAvatar: teamData.leadAvatar || currentUser.avatar,
      membersCount: 3,
      activeProjectsCount: 1,
      completionRatePct: 90,
      status: 'Active',
      focusArea: teamData.focusArea || 'Rapid prototyping & production acceleration'
    };

    setTeams(prev => [newTeam, ...prev]);
    showToast('Team Created', `Team ${newTeam.name} is now active.`, 'success');
    return newTeam;
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
        addDepartment,
        addTeam,
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
