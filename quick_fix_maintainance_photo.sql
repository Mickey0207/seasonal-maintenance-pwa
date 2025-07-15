-- =====================================================
-- 快速修正 maintainance_photo 表問題
-- =====================================================

-- 1. 檢查表是否存在
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'maintainance_photo' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. 如果表不存在，創建它
CREATE TABLE IF NOT EXISTS maintainance_photo (
  id SERIAL PRIMARY KEY,
  thing VARCHAR(255),
  location VARCHAR(255),
  floor VARCHAR(100),
  creat_at DATE,
  project VARCHAR(255),
  company VARCHAR(255),
  direction TEXT,
  maintainance_user VARCHAR(255),
  maintainance_time DATE,
  photo_path VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. 如果表存在但缺少 creat_at 欄位，添加它
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'maintainance_photo' 
      AND column_name = 'creat_at' 
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE maintainance_photo ADD COLUMN creat_at DATE;
  END IF;
END $$;

-- 4. 確保所有必要欄位都存在
DO $$
BEGIN
  -- 檢查並添加 thing 欄位
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'maintainance_photo' AND column_name = 'thing'
  ) THEN
    ALTER TABLE maintainance_photo ADD COLUMN thing VARCHAR(255);
  END IF;

  -- 檢查並添加 location 欄位
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'maintainance_photo' AND column_name = 'location'
  ) THEN
    ALTER TABLE maintainance_photo ADD COLUMN location VARCHAR(255);
  END IF;

  -- 檢查並添加 floor 欄位
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'maintainance_photo' AND column_name = 'floor'
  ) THEN
    ALTER TABLE maintainance_photo ADD COLUMN floor VARCHAR(100);
  END IF;

  -- 檢查並添加 project 欄位
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'maintainance_photo' AND column_name = 'project'
  ) THEN
    ALTER TABLE maintainance_photo ADD COLUMN project VARCHAR(255);
  END IF;

  -- 檢查並添加 company 欄位
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'maintainance_photo' AND column_name = 'company'
  ) THEN
    ALTER TABLE maintainance_photo ADD COLUMN company VARCHAR(255);
  END IF;

  -- 檢查並添加 direction 欄位
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'maintainance_photo' AND column_name = 'direction'
  ) THEN
    ALTER TABLE maintainance_photo ADD COLUMN direction TEXT;
  END IF;

  -- 檢查並添加 maintainance_user 欄位
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'maintainance_photo' AND column_name = 'maintainance_user'
  ) THEN
    ALTER TABLE maintainance_photo ADD COLUMN maintainance_user VARCHAR(255);
  END IF;

  -- 檢查並添加 maintainance_time 欄位
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'maintainance_photo' AND column_name = 'maintainance_time'
  ) THEN
    ALTER TABLE maintainance_photo ADD COLUMN maintainance_time DATE;
  END IF;

  -- 檢查並添加 photo_path 欄位
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'maintainance_photo' AND column_name = 'photo_path'
  ) THEN
    ALTER TABLE maintainance_photo ADD COLUMN photo_path VARCHAR(500);
  END IF;
END $$;

-- 5. 設定 RLS 權限
ALTER TABLE maintainance_photo ENABLE ROW LEVEL SECURITY;

-- 6. 刪除可能存在的舊政策
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON maintainance_photo;

-- 7. 創建新的權限政策
CREATE POLICY "Allow all operations for authenticated users" ON maintainance_photo
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 8. 強制刷新 PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- 9. 再次檢查表結構
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'maintainance_photo' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 10. 檢查權限政策
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE tablename = 'maintainance_photo';

-- 11. 測試插入一筆資料
INSERT INTO maintainance_photo (
  thing,
  location,
  floor,
  creat_at,
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
  'test_project',
  'test_company',
  'test_direction',
  'test_user',
  CURRENT_DATE,
  'test_photo_path'
);

-- 12. 檢查插入是否成功
SELECT * FROM maintainance_photo WHERE thing = 'test_thing';

-- 13. 清理測試資料
DELETE FROM maintainance_photo WHERE thing = 'test_thing';