-- ==============================================================================
-- Z-SANGAM ENTERPRISE PROJECT MANAGEMENT PLATFORM
-- Migration 004: Stored Procedures, Functions & Triggers
-- ==============================================================================

-- 1. Automatic Project Progress Recomputation Trigger on Task Status Change
CREATE OR REPLACE FUNCTION public.recalculate_project_progress()
RETURNS TRIGGER AS $$
DECLARE
    v_total_tasks INTEGER;
    v_completed_tasks INTEGER;
    v_new_progress INTEGER := 0;
    v_proj_id UUID;
BEGIN
    v_proj_id := COALESCE(NEW.project_id, OLD.project_id);

    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
    INTO v_total_tasks, v_completed_tasks
    FROM public.tasks
    WHERE project_id = v_proj_id;

    IF v_total_tasks > 0 THEN
        v_new_progress := ROUND((v_completed_tasks::NUMERIC / v_total_tasks::NUMERIC) * 100);
    END IF;

    UPDATE public.projects
    SET progress = v_new_progress,
        updated_at = NOW()
    WHERE id = v_proj_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_task_progress_update ON public.tasks;
CREATE TRIGGER trg_task_progress_update
AFTER INSERT OR UPDATE OF status OR DELETE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.recalculate_project_progress();

-- 2. Atomic Transaction Function for Creating Project with Assignments
CREATE OR REPLACE FUNCTION public.create_project_with_assignments(
    p_org_id UUID,
    p_name TEXT,
    p_code TEXT,
    p_description TEXT,
    p_lead_id UUID,
    p_dept_id UUID,
    p_status TEXT,
    p_priority TEXT,
    p_start_date DATE,
    p_end_date DATE,
    p_tags TEXT[],
    p_dept_ids UUID[],
    p_team_ids UUID[],
    p_member_ids UUID[],
    p_milestones JSONB DEFAULT '[]'::jsonb
)
RETURNS UUID AS $$
DECLARE
    v_project_id UUID;
    v_item JSONB;
    v_dept_id UUID;
    v_team_id UUID;
    v_member_id UUID;
BEGIN
    -- 1. Insert Project
    INSERT INTO public.projects (
        organization_id, name, project_code, description, project_lead_id,
        department_id, status, priority, start_date, end_date, tags, created_by
    ) VALUES (
        p_org_id, p_name, p_code, p_description, p_lead_id,
        p_dept_id, p_status, p_priority, p_start_date, p_end_date, p_tags, auth.uid()
    ) RETURNING id INTO v_project_id;

    -- 2. Insert Departments
    IF p_dept_ids IS NOT NULL THEN
        FOREACH v_dept_id IN ARRAY p_dept_ids LOOP
            INSERT INTO public.project_departments (project_id, department_id)
            VALUES (v_project_id, v_dept_id)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END IF;

    -- 3. Insert Teams
    IF p_team_ids IS NOT NULL THEN
        FOREACH v_team_id IN ARRAY p_team_ids LOOP
            INSERT INTO public.project_teams (project_id, team_id)
            VALUES (v_project_id, v_team_id)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END IF;

    -- 4. Insert Members
    IF p_member_ids IS NOT NULL THEN
        FOREACH v_member_id IN ARRAY p_member_ids LOOP
            INSERT INTO public.project_members (project_id, user_id, role)
            VALUES (v_project_id, v_member_id, 'Contributor')
            ON CONFLICT DO NOTHING;
        END LOOP;
    END IF;

    -- 5. Insert Milestones
    IF p_milestones IS NOT NULL AND jsonb_array_length(p_milestones) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_milestones) LOOP
            INSERT INTO public.project_milestones (
                project_id, name, description, due_date, status, position
            ) VALUES (
                v_project_id,
                v_item->>'name',
                COALESCE(v_item->>'description', ''),
                (v_item->>'due_date')::DATE,
                COALESCE(v_item->>'status', 'pending'),
                COALESCE((v_item->>'position')::INTEGER, 0)
            );
        END LOOP;
    END IF;

    -- 6. Insert Activity Log
    INSERT INTO public.activity_logs (
        organization_id, actor_id, action, entity_type, entity_id, metadata
    ) VALUES (
        p_org_id,
        auth.uid(),
        'created project',
        'project',
        v_project_id,
        jsonb_build_object('project_code', p_code, 'name', p_name)
    );

    RETURN v_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Get Aggregated Dashboard Metrics Function
CREATE OR REPLACE FUNCTION public.get_dashboard_metrics(p_org_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_total_projects BIGINT;
    v_active_projects BIGINT;
    v_total_departments BIGINT;
    v_total_teams BIGINT;
    v_total_members BIGINT;
    v_completed_tasks BIGINT;
    v_total_tasks BIGINT;
    v_avg_progress NUMERIC;
BEGIN
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status IN ('in_progress', 'Active'))
    INTO v_total_projects, v_active_projects
    FROM public.projects
    WHERE organization_id = p_org_id;

    SELECT COUNT(*) INTO v_total_departments FROM public.departments WHERE organization_id = p_org_id;
    SELECT COUNT(*) INTO v_total_teams FROM public.teams WHERE organization_id = p_org_id;
    SELECT COUNT(*) INTO v_total_members FROM public.profiles WHERE organization_id = p_org_id AND status != 'Deactivated';
    
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
    INTO v_total_tasks, v_completed_tasks
    FROM public.tasks
    WHERE organization_id = p_org_id;

    SELECT COALESCE(AVG(progress), 0)
    INTO v_avg_progress
    FROM public.projects
    WHERE organization_id = p_org_id;

    RETURN jsonb_build_object(
        'totalProjects', v_total_projects,
        'activeProjects', v_active_projects,
        'totalDepartments', v_total_departments,
        'totalTeams', v_total_teams,
        'totalMembers', v_total_members,
        'totalTasks', v_total_tasks,
        'completedTasks', v_completed_tasks,
        'avgProgress', ROUND(v_avg_progress, 1)
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
