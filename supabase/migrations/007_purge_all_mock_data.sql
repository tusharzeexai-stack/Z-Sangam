-- ==============================================================================
-- Z-SANGAM ENTERPRISE PLATFORM
-- Migration 007: Purge All Mock & Seed Data from Supabase
-- ==============================================================================

-- Truncate all entity tables while preserving table structures and constraints
TRUNCATE TABLE 
    public.tasks,
    public.project_milestones,
    public.project_members,
    public.project_teams,
    public.project_departments,
    public.projects,
    public.team_members,
    public.teams,
    public.departments,
    public.profiles,
    public.activity_logs,
    public.notifications
RESTART IDENTITY CASCADE;

-- Ensure default organization exists for foreign key references when creating real data
INSERT INTO public.organizations (id, name, slug, logo_url, description)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Z-Sangam Enterprise',
    'zsangam-enterprise',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
    'Premier multi-departmental enterprise workspace.'
) ON CONFLICT (slug) DO NOTHING;

-- Verification Notice
SELECT 'Purge Completed: All mock profiles, departments, teams, projects, and tasks removed from Supabase.' AS status;
