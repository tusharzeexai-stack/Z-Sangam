export type ViewType = 
  | 'login'
  | 'dashboard'
  | 'projects'
  | 'project-detail'
  | 'create-project'
  | 'departments'
  | 'teams'
  | 'members'
  | 'tasks'
  | 'analytics'
  | 'reports'
  | 'activity'
  | 'settings';

export type UserRole = 'Super Admin' | 'Department Head' | 'Team Lead' | 'Senior Engineer' | 'AI Researcher' | 'Product Manager' | 'Designer' | 'Member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
  team: string;
  status: 'Active' | 'Away' | 'Offline';
  skills: string[];
  projectsCount: number;
  lastActive: string;
  location: string;
  phone?: string;
  bio?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  headName: string;
  headAvatar: string;
  teamsCount: number;
  membersCount: number;
  activeProjectsCount: number;
  resourceAllocationPct: number;
  status: 'ON TRACK' | 'AT RISK' | 'SCALING' | 'STABLE' | 'REVIEW';
  leadEmail: string;
  accentColor: string;
  category: 'Core Engineering' | 'Strategic Innovation' | 'Business & Operations' | 'Corporate Functions';
}

export interface Team {
  id: string;
  name: string;
  code: string;
  shortTag: string;
  department: string;
  leadName: string;
  leadAvatar: string;
  membersCount: number;
  activeProjectsCount: number;
  completionRatePct: number;
  status: 'Active' | 'Hiring' | 'Restructuring';
  focusArea: string;
}

export interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  status: 'Completed' | 'In Progress' | 'Pending';
  completionDate?: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  description: string;
  status: 'Active' | 'In Progress' | 'Planning' | 'Completed' | 'On Hold' | 'Blocked';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  department: string;
  teams: string[];
  leadName: string;
  leadAvatar: string;
  members: Array<{ id: string; name: string; avatar: string; role: string }>;
  startDate: string;
  targetEndDate: string;
  progressPct: number;
  completedTasks: number;
  totalTasks: number;
  tags: string[];
  blockersCount: number;
  commits7dCount: number;
  sprintPhaseRemainingDays: number;
  milestones: Milestone[];
  architecturePreview?: string;
}

export interface Task {
  id: string;
  title: string;
  projectCode: string;
  projectName: string;
  department: string;
  team: string;
  assigneeName: string;
  assigneeAvatar: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Review' | 'Completed';
  dueDate: string;
  estimatedHours: number;
  tags: string[];
}

export interface ActivityEvent {
  id: string;
  userName: string;
  userAvatar: string;
  userRole: string;
  action: string;
  target: string;
  targetType: 'project' | 'task' | 'team' | 'department' | 'member' | 'system';
  timestamp: string;
  relativeTime: string;
  dateGroup: 'TODAY' | 'YESTERDAY' | 'THIS WEEK' | 'EARLIER';
  details?: string;
}

export interface RolePermission {
  id: string;
  name: string;
  description: string;
  usersActive: number;
  tag: string;
  permissions: {
    userManagement: {
      createUsers: boolean;
      editUserRoles: boolean;
      deleteUsers: boolean;
      viewAuditLogs: boolean;
    };
    workManagement: {
      createProjects: boolean;
      approveBudgets: boolean;
      viewDeptAnalytics: boolean;
      assignTeams: boolean;
      overrideMilestones: boolean;
    };
  };
}
