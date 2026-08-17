-- ==============================================================================
-- Z-SANGAM ENTERPRISE PROJECT MANAGEMENT PLATFORM
-- Migration 003: Performance Indexes & Query Optimization
-- ==============================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_org_id ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- Departments indexes
CREATE INDEX IF NOT EXISTS idx_departments_org_id ON public.departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_departments_head_id ON public.departments(head_id);

-- Teams indexes
CREATE INDEX IF NOT EXISTS idx_teams_org_id ON public.teams(organization_id);
CREATE INDEX IF NOT EXISTS idx_teams_dept_id ON public.teams(department_id);
CREATE INDEX IF NOT EXISTS idx_teams_lead_id ON public.teams(team_lead_id);

-- Team members junction indexes
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team_id);

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_org_id ON public.projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_dept_id ON public.projects(department_id);
CREATE INDEX IF NOT EXISTS idx_projects_lead_id ON public.projects(project_lead_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON public.projects(priority);
CREATE INDEX IF NOT EXISTS idx_projects_code ON public.projects(project_code);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- Project junctions indexes
CREATE INDEX IF NOT EXISTS idx_project_dept_dept ON public.project_departments(department_id);
CREATE INDEX IF NOT EXISTS idx_project_teams_team ON public.project_teams(team_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON public.project_members(user_id);

-- Milestones index
CREATE INDEX IF NOT EXISTS idx_milestones_proj_id ON public.project_milestones(project_id);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_org_id ON public.tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

-- Activity logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_org_id ON public.activity_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_actor_id ON public.activity_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_entity ON public.activity_logs(entity_type, entity_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
