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


  // 保養資料相關
  maintenanceData: {
    async create(record) {
      const { data, error } = await supabase
        .from('maintainance_data')
        .insert(record);
      return { data, error };
    },

    async getByProject(projectName) {
      const { data, error } = await supabase
        .from('maintainance_data')
        .select('*')
        .eq('project', projectName);
      return { data: data || [], error };
    },

    async getOptions(projectName) {
      const { data, error } = await supabase
        .from('maintainance_data')
        .select('floor, thing, location')
        .eq('project', projectName);
      
      if (error) return { data: { floors: [], things: [], locations: [] }, error };
      
      const floors = [...new Set(data.map(item => item.floor).filter(Boolean))];
      const things = [...new Set(data.map(item => item.thing).filter(Boolean))];
      const locations = [...new Set(data.map(item => item.location).filter(Boolean))];
      
      return { data: { floors, things, locations }, error: null };
    }
  },

  // 保養設定相關
  maintenanceSettings: {
    async getByProject(projectName) {
      const { data, error } = await supabase
        .from('maintainance_setting')
        .select('*')
        .eq('name', projectName)
        .single();
      return { data, error };
    },

    async create(setting) {
      const { data, error } = await supabase
        .from('maintainance_setting')
        .insert(setting);
      return { data, error };
    },

    async update(projectName, setting) {
      const { data, error } = await supabase
        .from('maintainance_setting')
        .upsert(setting)
        .eq('name', projectName);
      return { data, error };
    }
  },

  // 存儲相關
  storage: {
    getImageUrl(bucket, path) {
      if (!path) return '';
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data?.publicUrl || '';
    },

    async uploadFile(bucket, path, file) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file);
      return { data, error };
    }
  }
};