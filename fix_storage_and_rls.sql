-- =====================================================
-- 修正 Storage 和 RLS 權限問題
-- =====================================================

-- 1. 檢查並修正 maintainance_data 表的 RLS 政策
-- 首先檢查現有政策
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'maintainance_data';

-- 2. 刪除可能有問題的舊政策
DROP POLICY IF EXISTS "Allow all operations" ON maintainance_data;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON maintainance_data;
DROP POLICY IF EXISTS "Enable read access for all users" ON maintainance_data;
DROP POLICY IF EXISTS "Enable update for users based on email" ON maintainance_data;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON maintainance_data;

-- 3. 創建新的寬鬆政策（允許所有認證用戶操作）
CREATE POLICY "Allow all operations for authenticated users" ON maintainance_data
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 4. 確保 RLS 已啟用
ALTER TABLE maintainance_data ENABLE ROW LEVEL SECURITY;

-- 5. 檢查 Storage Bucket 設定
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'maintainance-data-photo';

-- 6. 確保 Storage Bucket 存在且設定正確
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'maintainance-data-photo',
  'maintainance-data-photo',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 7. 檢查並修正 Storage 權限政策
-- 刪除舊的 Storage 政策
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete files" ON storage.objects;

-- 8. 創建新的 Storage 政策
CREATE POLICY "Public read access for maintainance photos" ON storage.objects
FOR SELECT USING (bucket_id = 'maintainance-data-photo');

CREATE POLICY "Authenticated upload for maintainance photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'maintainance-data-photo' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated update for maintainance photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'maintainance-data-photo' 
  AND auth.role() = 'authenticated'
) WITH CHECK (
  bucket_id = 'maintainance-data-photo' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated delete for maintainance photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'maintainance-data-photo' 
  AND auth.role() = 'authenticated'
);

-- 9. 檢查當前用戶狀態
SELECT 
  auth.uid() as user_id,
  auth.role() as user_role,
  auth.email() as user_email;

-- 10. 測試資料庫插入權限
-- 這個查詢應該顯示用戶可以插入資料
SELECT 
  CASE 
    WHEN auth.role() = 'authenticated' THEN 'Can Insert'
    ELSE 'Cannot Insert'
  END as insert_permission;

-- 11. 檢查所有相關政策
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE (tablename = 'maintainance_data' OR (tablename = 'objects' AND schemaname = 'storage'))
ORDER BY tablename, policyname;