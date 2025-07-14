import { supabase } from '../lib/supabaseClient';

// 測試 Supabase 連接的工具函數
export const testSupabaseConnection = async () => {
  try {
    console.log('測試 Supabase 連接...');
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Supabase Key 存在:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
    
    // 測試基本連接
    const { data, error } = await supabase.from('user_names').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase 連接失敗:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Supabase 連接成功，user_names 表記錄數:', data);
    return { success: true, data };
  } catch (err) {
    console.error('連接測試異常:', err);
    return { success: false, error: err.message };
  }
};

// 測試認證功能
export const testAuth = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log('當前用戶狀態:', user);
    
    if (error) {
      console.error('認證檢查失敗:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, user };
  } catch (err) {
    console.error('認證測試異常:', err);
    return { success: false, error: err.message };
  }
};