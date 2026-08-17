-- ==============================================================================
-- Z-SANGAM ENTERPRISE PROJECT MANAGEMENT PLATFORM
-- Migration 002: Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS checks
CREATE OR REPLACE FUNCTION public.get_auth_user_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_org_admin_or_super()
RETURNS BOOLEAN AS $$
  SELECT role IN ('super_admin', 'organization_admin') FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 1. ORGANIZATIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view their own organization"
    ON public.organizations FOR SELECT
    USING (id = public.get_auth_user_org_id());

CREATE POLICY "Super admins can update organization details"
    ON public.organizations FOR UPDATE
    USING (id = public.get_auth_user_org_id() AND public.is_org_admin_or_super());

-- ------------------------------------------------------------------------------
-- 2. PROFILES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view profiles within their organization"
    ON public.profiles FOR SELECT
    USING (organization_id = public.get_auth_user_org_id());

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid());

CREATE POLICY "Admins can manage profiles in their organization"
    ON public.profiles FOR ALL
    USING (organization_id = public.get_auth_user_org_id() AND public.is_org_admin_or_super());

CREATE POLICY "Allow authenticated users to insert profile during signup"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 3. DEPARTMENTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view departments in their organization"
    ON public.departments FOR SELECT
    USING (organization_id = public.get_auth_user_org_id());

CREATE POLICY "Admins and Dept Heads can manage departments"
    ON public.departments FOR ALL
    USING (
        organization_id = public.get_auth_user_org_id() AND (
            public.is_org_admin_or_super() OR 
            head_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- 4. TEAMS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view teams in their organization"
    ON public.teams FOR SELECT
    USING (organization_id = public.get_auth_user_org_id());

CREATE POLICY "Admins and Team Leads can manage teams"
    ON public.teams FOR ALL
    USING (
        organization_id = public.get_auth_user_org_id() AND (
            public.is_org_admin_or_super() OR 
            team_lead_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- 5. TEAM MEMBERS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view team members in their organization"
    ON public.team_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.teams t 
            WHERE t.id = team_members.team_id AND t.organization_id = public.get_auth_user_org_id()
        )
    );

CREATE POLICY "Admins and Team Leads can manage team members"
    ON public.team_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.teams t 
            WHERE t.id = team_members.team_id 
              AND t.organization_id = public.get_auth_user_org_id()
              AND (public.is_org_admin_or_super() OR t.team_lead_id = auth.uid())
        )
    );

-- ------------------------------------------------------------------------------
-- 6. PROJECTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view projects in their organization"
    ON public.projects FOR SELECT
    USING (organization_id = public.get_auth_user_org_id());

CREATE POLICY "Admins and Project Leads can insert projects"
    ON public.projects FOR INSERT
    WITH CHECK (
        organization_id = public.get_auth_user_org_id() AND (
            public.is_org_admin_or_super() OR 
            public.get_auth_user_role() IN ('department_head', 'team_lead', 'project_manager')
        )
    );

CREATE POLICY "Admins and Project Leads can update projects"
    ON public.projects FOR UPDATE
    USING (
        organization_id = public.get_auth_user_org_id() AND (
            public.is_org_admin_or_super() OR 
            project_lead_id = auth.uid() OR
            created_by = auth.uid()
        )
    );

CREATE POLICY "Admins can delete projects"
    ON public.projects FOR DELETE
    USING (organization_id = public.get_auth_user_org_id() AND public.is_org_admin_or_super());

-- ------------------------------------------------------------------------------
-- 7. PROJECT JUNCTIONS & MILESTONES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view project departments"
    ON public.project_departments FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_departments.project_id AND p.organization_id = public.get_auth_user_org_id()));

CREATE POLICY "Admins and Project Managers can manage project departments"
    ON public.project_departments FOR ALL
    USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_departments.project_id AND p.organization_id = public.get_auth_user_org_id() AND (public.is_org_admin_or_super() OR p.project_lead_id = auth.uid())));

CREATE POLICY "Users can view project teams"
    ON public.project_teams FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_teams.project_id AND p.organization_id = public.get_auth_user_org_id()));

CREATE POLICY "Admins and Project Managers can manage project teams"
    ON public.project_teams FOR ALL
    USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_teams.project_id AND p.organization_id = public.get_auth_user_org_id() AND (public.is_org_admin_or_super() OR p.project_lead_id = auth.uid())));

CREATE POLICY "Users can view project members"
    ON public.project_members FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_members.project_id AND p.organization_id = public.get_auth_user_org_id()));

CREATE POLICY "Admins and Project Managers can manage project members"
    ON public.project_members FOR ALL
    USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_members.project_id AND p.organization_id = public.get_auth_user_org_id() AND (public.is_org_admin_or_super() OR p.project_lead_id = auth.uid())));

CREATE POLICY "Users can view project milestones"
    ON public.project_milestones FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_milestones.project_id AND p.organization_id = public.get_auth_user_org_id()));

CREATE POLICY "Project Leads and Admins can manage milestones"
    ON public.project_milestones FOR ALL
    USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_milestones.project_id AND p.organization_id = public.get_auth_user_org_id() AND (public.is_org_admin_or_super() OR p.project_lead_id = auth.uid())));

-- ------------------------------------------------------------------------------
-- 8. TASKS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view tasks in their organization"
    ON public.tasks FOR SELECT
    USING (organization_id = public.get_auth_user_org_id());

CREATE POLICY "Users can create tasks for projects in their organization"
    ON public.tasks FOR INSERT
    WITH CHECK (organization_id = public.get_auth_user_org_id());

CREATE POLICY "Users can update their assigned tasks or if management"
    ON public.tasks FOR UPDATE
    USING (
        organization_id = public.get_auth_user_org_id() AND (
            assigned_to = auth.uid() OR
            created_by = auth.uid() OR
            public.is_org_admin_or_super() OR
            public.get_auth_user_role() IN ('department_head', 'team_lead', 'project_manager')
        )
    );

CREATE POLICY "Admins and Project Leads can delete tasks"
    ON public.tasks FOR DELETE
    USING (
        organization_id = public.get_auth_user_org_id() AND (
            public.is_org_admin_or_super() OR
            created_by = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- 9. ACTIVITY LOGS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view activity logs in their organization"
    ON public.activity_logs FOR SELECT
    USING (organization_id = public.get_auth_user_org_id());

CREATE POLICY "Users can insert activity logs for their actions"
    ON public.activity_logs FOR INSERT
    WITH CHECK (organization_id = public.get_auth_user_org_id());

-- ------------------------------------------------------------------------------
-- 10. NOTIFICATIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view only their own notifications"
    ON public.notifications FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "System and users can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (organization_id = public.get_auth_user_org_id());
