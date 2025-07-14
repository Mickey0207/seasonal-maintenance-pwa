import { supabase } from '../lib/supabaseClient';

// 數據庫操作工具函數
export const dbUtils = {
  // 項目相關
  projects: {
    async getAll() {
      const { data, error } = await supabase.from('home_project_card').select('*');
      return { data: data || [], error };
    },

    async getById(id) {
      const { data, error } = await supabase
        .from('home_project_card')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    },

    async create(project) {
      const { data, error } = await supabase
        .from('home_project_card')
        .insert([project]);
      return { data, error };
    },

    async createDefault() {
      const defaultProject = {
        name: '預設案場',
        unit: '預設單位',
        directions: '這是自動建立的預設專案卡片',
        photo_path: '',
      };
      return await this.create(defaultProject);
    }
  },

  // 用戶相關
  users: {
    async getAll() {
      const { data, error } = await supabase.from('user_names').select('user, email');
      return { data: data || [], error };
    },

    async getByEmail(email) {
      const { data, error } = await supabase
        .from('user_names')
        .select('user')
        .eq('email', email);
      return { data: data || [], error };
    },

    async create(userData) {
      const { data, error } = await supabase
        .from('user_names')
        .insert([userData]);
      return { data, error };
    },

    async checkUsernameExists(username) {
      const { data, error } = await supabase
        .from('user_names')
        .select('user')
        .eq('user', username);
      return { exists: data && data.length > 0, error };
    }
  },

  // 維護記錄相關
  maintenance: {
    async create(record) {
      const { data, error } = await supabase
        .from('maintainance')
        .insert(record);
      return { data, error };
    },

    async getByProjectId(projectId) {
      const { data, error } = await supabase
        .from('maintainance')
        .select('*')
        .eq('project_id', projectId);
      return { data: data || [], error };
    }
  },

  // 存儲相關
  storage: {
    getImageUrl(bucket, path) {
      if (!path) return '';
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data?.publicUrl || '';
    }
  }
};