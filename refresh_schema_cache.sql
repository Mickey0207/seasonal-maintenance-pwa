-- =====================================================
-- 刷新 Supabase Schema Cache
-- =====================================================

-- 1. 檢查 maintainance_data 表結構
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'maintainance_data' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. 如果 user 欄位不存在，添加它
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'maintainance_data' 
      AND column_name = 'user' 
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE maintainance_data ADD COLUMN user VARCHAR(255);
  END IF;
END $$;

-- 3. 刷新 PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- 4. 再次檢查表結構確認
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'maintainance_data' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. 測試插入一筆資料（可選）
/*
INSERT INTO maintainance_data (
  thing,
  location,
  floor,
  creat_at,
  user,
  project,
  company,
  direction,
  maintainance_user,
  maintainance_time,
  photo_path
) VALUES (
  'test_thing',
  'test_location', 
  'test_floor',
  CURRENT_DATE,
  'test_user',
  'test_project',
  'test_company',
  'test_direction',
  'test_maintainance_user',
  CURRENT_DATE,
  'test_photo_path'
);
*/