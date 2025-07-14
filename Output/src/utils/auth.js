import { supabase } from '../lib/supabaseClient';

// 認證相關工具函數
export const authUtils = {
  // 獲取當前用戶
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // 獲取用戶名稱
  async getUserName() {
    const { user, error } = await this.getCurrentUser();
    if (error || !user?.email) return '';

    const { data, error: nameError } = await supabase
      .from('user_names')
      .select('user')
      .eq('email', user.email)
      .single();

    return !nameError && data?.user ? data.user : user.email;
  },

  // 登出
  async logout() {
    localStorage.clear();
    await supabase.auth.signOut();
  },

  // 檢查用戶是否已登入
  async isAuthenticated() {
    const { user } = await this.getCurrentUser();
    return !!user;
  }
};