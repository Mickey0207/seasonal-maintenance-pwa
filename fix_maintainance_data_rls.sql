-- =====================================================
-- 修正 maintainance_data 表的 RLS 權限問題
-- =====================================================

-- 1. 檢查當前的 RLS 政策
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'maintainance_data';

-- 2. 檢查表是否啟用了 RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'maintainance_data';

-- 3. 檢查當前用戶狀態
SELECT 
  auth.uid() as user_id,
  auth.role() as user_role,
  auth.email() as user_email;

-- 4. 暫時禁用 RLS（用於測試）
-- 注意：這會暫時移除所有安全限制，僅用於診斷問題
-- ALTER TABLE maintainance_data DISABLE ROW LEVEL SECURITY;

-- 5. 或者，刪除現有的限制性政策並創建新的寬鬆政策
DROP POLICY IF EXISTS "Allow all operations" ON maintainance_data;

-- 6. 創建允許所有認證用戶操作的政策
CREATE POLICY "Allow all operations for authenticated users" ON maintainance_data
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- 7. 如果上面的政策太寬鬆，可以使用更具體的政策
-- 刪除上面的政策並使用下面的
-- DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON maintainance_data;

-- 創建分別的政策
CREATE POLICY "Allow authenticated users to insert" ON maintainance_data
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to select" ON maintainance_data
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to update" ON maintainance_data
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete" ON maintainance_data
FOR DELETE 
TO authenticated
USING (true);

-- 8. 檢查政策是否創建成功
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'maintainance_data';

-- 9. 測試插入權限（模擬應用程式的插入操作）
-- 注意：這只是測試語法，實際值請根據您的需求調整
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
  '測試項目',
  '測試位置',
  '1F',
  CURRENT_DATE,
  'test_user',
  '測試專案',
  '測試公司',
  '測試說明',
  'test_user',
  CURRENT_DATE,
  '1/test_photo.jpg'
);
*/

-- 10. 如果仍有問題，檢查表結構
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'maintainance_data'
ORDER BY ordinal_position;

-- =====================================================
-- 故障排除步驟：
-- 
-- 1. 首先執行第 1-3 步檢查當前狀態
-- 2. 執行第 5-7 步創建新的權限政策
-- 3. 執行第 8 步確認政策創建成功
-- 4. 在應用程式中測試上傳功能
-- 5. 如果仍有問題，執行第 10 步檢查表結構
-- 
-- 如果問題持續存在，可能需要：
-- - 檢查應用程式發送的資料格式
-- - 確認所有必要欄位都有值
-- - 檢查資料類型是否匹配
-- =====================================================