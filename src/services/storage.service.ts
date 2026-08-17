import { supabase, isSupabaseConfigured } from '../lib/supabase';

export class StorageService {
  /**
   * Uploads an avatar image to the 'avatars' storage bucket and returns the public URL.
   */
  static async uploadAvatar(userId: string, file: File): Promise<{ url: string | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { url: URL.createObjectURL(file), error: null };
    }

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `user_${userId}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return { url: data.publicUrl, error: null };
    } catch (err: any) {
      console.error('Storage avatar upload error:', err);
      return { url: null, error: err };
    }
  }

  /**
   * Uploads a project document or architecture preview file.
   */
  static async uploadProjectFile(projectId: string, file: File): Promise<{ url: string | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { url: URL.createObjectURL(file), error: null };
    }

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `project_${projectId}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('project_files')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('project_files').getPublicUrl(filePath);
      return { url: data.publicUrl, error: null };
    } catch (err: any) {
      console.error('Storage project file upload error:', err);
      return { url: null, error: err };
    }
  }
}
