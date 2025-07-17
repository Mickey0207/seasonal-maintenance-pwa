import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, validateEnv } from './env.js'

// 驗證環境變數
if (import.meta.env.MODE === 'development') {
  validateEnv();
}

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)