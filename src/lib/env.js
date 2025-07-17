// 環境變數驗證和預設值
export const getEnvVar = (key, defaultValue = '') => {
  const value = import.meta.env[key];
  if (!value && !defaultValue) {
    console.warn(`Environment variable ${key} is not defined`);
  }
  return value || defaultValue;
};

export const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL', 'https://placeholder.supabase.co');
export const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY', 'placeholder-key');

// 驗證環境變數
export const validateEnv = () => {
  const errors = [];
  
  if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('your-project')) {
    errors.push('VITE_SUPABASE_URL is not properly configured');
  }
  
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY.includes('your-anon-key')) {
    errors.push('VITE_SUPABASE_ANON_KEY is not properly configured');
  }
  
  if (errors.length > 0) {
    console.error('Environment configuration errors:', errors);
    return false;
  }
  
  return true;
};