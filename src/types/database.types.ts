export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          organization_id: string | null;
          full_name: string;
          email: string;
          avatar_url: string | null;
          job_title: string | null;
          role: 'super_admin' | 'organization_admin' | 'department_head' | 'team_lead' | 'project_manager' | 'member';
          phone: string | null;
          department_name: string | null;
          team_name: string | null;
          status: 'Active' | 'Away' | 'Offline' | 'Deactivated';
          skills: string[] | null;
          location: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          organization_id?: string | null;
          full_name: string;
          email: string;
          avatar_url?: string | null;
          job_title?: string | null;
          role?: 'super_admin' | 'organization_admin' | 'department_head' | 'team_lead' | 'project_manager' | 'member';
          phone?: string | null;
          department_name?: string | null;
          team_name?: string | null;
          status?: 'Active' | 'Away' | 'Offline' | 'Deactivated';
          skills?: string[] | null;
          location?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          full_name?: string;
          email?: string;
          avatar_url?: string | null;
          job_title?: string | null;
          role?: 'super_admin' | 'organization_admin' | 'department_head' | 'team_lead' | 'project_manager' | 'member';
          phone?: string | null;
          department_name?: string | null;
          team_name?: string | null;
          status?: 'Active' | 'Away' | 'Offline' | 'Deactivated';
          skills?: string[] | null;
          location?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      departments: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          code: string;
          description: string | null;
          head_id: string | null;
          status: 'ON TRACK' | 'AT RISK' | 'SCALING' | 'STABLE' | 'REVIEW';
          accent_color: string | null;
          category: 'Core Engineering' | 'Strategic Innovation' | 'Business & Operations' | 'Corporate Functions';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          code: string;
          description?: string | null;
          head_id?: string | null;
          status?: 'ON TRACK' | 'AT RISK' | 'SCALING' | 'STABLE' | 'REVIEW';
          accent_color?: string | null;
          category?: 'Core Engineering' | 'Strategic Innovation' | 'Business & Operations' | 'Corporate Functions';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          code?: string;
          description?: string | null;
          head_id?: string | null;
          status?: 'ON TRACK' | 'AT RISK' | 'SCALING' | 'STABLE' | 'REVIEW';
          accent_color?: string | null;
          category?: 'Core Engineering' | 'Strategic Innovation' | 'Business & Operations' | 'Corporate Functions';
          created_at?: string;
          updated_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          organization_id: string;
          department_id: string;
          name: string;
          code: string;
          short_tag: string;
          description: string | null;
          team_lead_id: string | null;
          focus_area: string | null;
          status: 'Active' | 'Hiring' | 'Restructuring' | 'Archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          department_id: string;
          name: string;
          code: string;
          short_tag: string;
          description?: string | null;
          team_lead_id?: string | null;
          focus_area?: string | null;
          status?: 'Active' | 'Hiring' | 'Restructuring' | 'Archived';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          department_id?: string;
          name?: string;
          code?: string;
          short_tag?: string;
          description?: string | null;
          team_lead_id?: string | null;
          focus_area?: string | null;
          status?: 'Active' | 'Hiring' | 'Restructuring' | 'Archived';
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          project_code: string;
          description: string | null;
          project_lead_id: string | null;
          department_id: string | null;
          status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
          priority: 'low' | 'medium' | 'high' | 'critical';
          start_date: string | null;
          end_date: string | null;
          progress: number;
          tags: string[] | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          project_code: string;
          description?: string | null;
          project_lead_id?: string | null;
          department_id?: string | null;
          status?: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
          priority?: 'low' | 'medium' | 'high' | 'critical';
          start_date?: string | null;
          end_date?: string | null;
          progress?: number;
          tags?: string[] | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          project_code?: string;
          description?: string | null;
          project_lead_id?: string | null;
          department_id?: string | null;
          status?: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
          priority?: 'low' | 'medium' | 'high' | 'critical';
          start_date?: string | null;
          end_date?: string | null;
          progress?: number;
          tags?: string[] | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          organization_id: string;
          project_id: string;
          title: string;
          description: string | null;
          assigned_to: string | null;
          created_by: string | null;
          status: 'todo' | 'in_progress' | 'review' | 'completed';
          priority: 'low' | 'medium' | 'high' | 'critical';
          due_date: string | null;
          estimated_hours: number | null;
          tags: string[] | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          project_id: string;
          title: string;
          description?: string | null;
          assigned_to?: string | null;
          created_by?: string | null;
          status?: 'todo' | 'in_progress' | 'review' | 'completed';
          priority?: 'low' | 'medium' | 'high' | 'critical';
          due_date?: string | null;
          estimated_hours?: number | null;
          tags?: string[] | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          assigned_to?: string | null;
          created_by?: string | null;
          status?: 'todo' | 'in_progress' | 'review' | 'completed';
          priority?: 'low' | 'medium' | 'high' | 'critical';
          due_date?: string | null;
          estimated_hours?: number | null;
          tags?: string[] | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          organization_id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          actor_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          organization_id: string;
          title: string;
          message: string;
          type: 'info' | 'success' | 'warning' | 'error';
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          organization_id: string;
          title: string;
          message: string;
          type?: 'info' | 'success' | 'warning' | 'error';
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          organization_id?: string;
          title?: string;
          message?: string;
          type?: 'info' | 'success' | 'warning' | 'error';
          is_read?: boolean;
          created_at?: string;
        };
      };
    };
  };
}
