-- =====================================================
-- Supabase maintainance_photo 表管理 SQL
-- =====================================================

-- =====================================================
-- 1. 表結構創建和設定
-- =====================================================

-- 1.1 創建 maintainance_photo 表
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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 1.2 創建更新時間觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_maintainance_photo_updated_at 
    BEFORE UPDATE ON maintainance_photo 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 1.3 啟用 RLS (Row Level Security)
ALTER TABLE maintainance_photo ENABLE ROW LEVEL SECURITY;

-- 1.4 創建權限政策
-- 允許認證用戶進行所有操作
CREATE POLICY "Allow all operations for authenticated users" ON maintainance_photo
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 允許公開讀取 (如果需要)
-- CREATE POLICY "Allow public read access" ON maintainance_photo
-- FOR SELECT USING (true);

-- =====================================================
-- 2. 新增 (INSERT) 操作
-- =====================================================

-- 2.1 新增單筆記錄
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
  '消防設備檢查',
  '1F-大廳',
  '1F',
  '2024-01-15',
  '測試案場',
  '測試公司',
  '定期消防設備檢查',
  'test_user',
  '2024-01-15',
  '1/1234567890_fire_equipment.jpg'
);

-- 2.2 批量新增多筆記錄
INSERT INTO maintainance_photo (
  thing, location, floor, creat_at, project, company, direction, 
  maintainance_user, maintainance_time, photo_path
) VALUES 
  ('電梯檢查', '1F-電梯間', '1F', CURRENT_DATE, '測試案場', '測試公司', '電梯安全檢查', 'user1', CURRENT_DATE, '1/elevator_check.jpg'),
  ('空調檢查', '2F-辦公室', '2F', CURRENT_DATE, '測試案場', '測試公司', '空調系統檢查', 'user2', CURRENT_DATE, '1/ac_check.jpg'),
  ('照明檢查', '3F-會議室', '3F', CURRENT_DATE, '測試案場', '測試公司', '照明設備檢查', 'user3', CURRENT_DATE, '1/lighting_check.jpg');

-- =====================================================
-- 3. 查詢 (SELECT) 操作
-- =====================================================

-- 3.1 查詢所有記錄
SELECT * FROM maintainance_photo ORDER BY created_at DESC;

-- 3.2 按專案查詢
SELECT * FROM maintainance_photo 
WHERE project = '測試案場' 
ORDER BY maintainance_time DESC;

-- 3.3 按檢查項目查詢
SELECT * FROM maintainance_photo 
WHERE thing LIKE '%消防%' 
ORDER BY created_at DESC;

-- 3.4 按樓層查詢
SELECT * FROM maintainance_photo 
WHERE floor = '1F' 
ORDER BY location;

-- 3.5 按日期範圍查詢
SELECT * FROM maintainance_photo 
WHERE maintainance_time BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY maintainance_time DESC;

-- 3.6 按檢查者查詢
SELECT * FROM maintainance_photo 
WHERE maintainance_user = 'test_user'
ORDER BY maintainance_time DESC;

-- 3.7 查詢特定位置的記錄
SELECT * FROM maintainance_photo 
WHERE location LIKE '%大廳%'
ORDER BY created_at DESC;

-- 3.8 聯合查詢 (多條件)
SELECT * FROM maintainance_photo 
WHERE project = '測試案場' 
  AND floor = '1F' 
  AND maintainance_time >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY maintainance_time DESC;

-- 3.9 統計查詢
-- 按專案統計記錄數
SELECT 
  project,
  COUNT(*) as total_records,
  COUNT(DISTINCT floor) as floors_count,
  COUNT(DISTINCT thing) as things_count,
  MIN(maintainance_time) as earliest_maintenance,
  MAX(maintainance_time) as latest_maintenance
FROM maintainance_photo 
GROUP BY project
ORDER BY total_records DESC;

-- 按樓層統計
SELECT 
  floor,
  COUNT(*) as record_count,
  COUNT(DISTINCT thing) as unique_things,
  COUNT(DISTINCT maintainance_user) as unique_users
FROM maintainance_photo 
GROUP BY floor
ORDER BY floor;

-- 按檢查項目統計
SELECT 
  thing,
  COUNT(*) as frequency,
  COUNT(DISTINCT project) as projects_count,
  AVG(EXTRACT(DAY FROM (CURRENT_DATE - maintainance_time))) as avg_days_ago
FROM maintainance_photo 
GROUP BY thing
ORDER BY frequency DESC;

-- =====================================================
-- 4. 修改 (UPDATE) 操作
-- =====================================================

-- 4.1 更新單筆記錄的特定欄位
UPDATE maintainance_photo 
SET 
  thing = '消防設備年度檢查',
  direction = '年度消防設備全面檢查'
WHERE id = 1;

-- 4.2 更新多筆記錄
UPDATE maintainance_photo 
SET company = '新測試公司'
WHERE project = '測試案場';

-- 4.3 更新照片路徑
UPDATE maintainance_photo 
SET photo_path = '1/updated_photo_path.jpg'
WHERE id = 1;

-- 4.4 批量更新檢查時間
UPDATE maintainance_photo 
SET maintainance_time = CURRENT_DATE
WHERE maintainance_time < '2024-01-01';

-- 4.5 更新檢查者
UPDATE maintainance_photo 
SET maintainance_user = 'new_user'
WHERE maintainance_user = 'old_user';

-- =====================================================
-- 5. 刪除 (DELETE) 操作
-- =====================================================

-- 5.1 刪除單筆記錄
DELETE FROM maintainance_photo WHERE id = 1;

-- 5.2 按專案刪除
DELETE FROM maintainance_photo WHERE project = '要刪除的專案';

-- 5.3 刪除舊記錄 (超過一年)
DELETE FROM maintainance_photo 
WHERE maintainance_time < CURRENT_DATE - INTERVAL '1 year';

-- 5.4 刪除特定檢查項目
DELETE FROM maintainance_photo 
WHERE thing = '已停用的檢查項目';

-- 5.5 刪除沒有照片的記錄
DELETE FROM maintainance_photo 
WHERE photo_path IS NULL OR photo_path = '';

-- 5.6 條件刪除
DELETE FROM maintainance_photo 
WHERE project = '測試案場' 
  AND floor = '1F' 
  AND maintainance_time < '2024-01-01';

-- =====================================================
-- 6. 進階查詢和分析
-- =====================================================

-- 6.1 查詢最近的檢查記錄
SELECT 
  project,
  thing,
  location,
  maintainance_time,
  maintainance_user,
  ROW_NUMBER() OVER (PARTITION BY project, thing ORDER BY maintainance_time DESC) as rn
FROM maintainance_photo
WHERE ROW_NUMBER() OVER (PARTITION BY project, thing ORDER BY maintainance_time DESC) = 1;

-- 6.2 查詢需要重新檢查的項目 (超過30天未檢查)
SELECT DISTINCT 
  project,
  thing,
  location,
  MAX(maintainance_time) as last_check,
  CURRENT_DATE - MAX(maintainance_time) as days_since_check
FROM maintainance_photo 
GROUP BY project, thing, location
HAVING MAX(maintainance_time) < CURRENT_DATE - INTERVAL '30 days'
ORDER BY days_since_check DESC;

-- 6.3 查詢檢查頻率分析
SELECT 
  project,
  thing,
  COUNT(*) as check_count,
  MIN(maintainance_time) as first_check,
  MAX(maintainance_time) as last_check,
  ROUND(
    EXTRACT(DAY FROM (MAX(maintainance_time) - MIN(maintainance_time))) / 
    NULLIF(COUNT(*) - 1, 0), 2
  ) as avg_days_between_checks
FROM maintainance_photo 
GROUP BY project, thing
HAVING COUNT(*) > 1
ORDER BY project, thing;

-- 6.4 查詢檢查者工作量統計
SELECT 
  maintainance_user,
  COUNT(*) as total_checks,
  COUNT(DISTINCT project) as projects_worked,
  COUNT(DISTINCT thing) as different_tasks,
  MIN(maintainance_time) as first_work,
  MAX(maintainance_time) as last_work
FROM maintainance_photo 
GROUP BY maintainance_user
ORDER BY total_checks DESC;

-- =====================================================
-- 7. 資料維護和清理
-- =====================================================

-- 7.1 查詢重複記錄
SELECT 
  project, thing, location, maintainance_time, maintainance_user,
  COUNT(*) as duplicate_count
FROM maintainance_photo 
GROUP BY project, thing, location, maintainance_time, maintainance_user
HAVING COUNT(*) > 1;

-- 7.2 查詢孤立的照片記錄 (照片檔案可能已刪除)
SELECT 
  id, photo_path, project, thing, location
FROM maintainance_photo 
WHERE photo_path IS NOT NULL 
  AND photo_path NOT IN (
    SELECT DISTINCT name 
    FROM storage.objects 
    WHERE bucket_id = 'maintainance-data-photo'
  );

-- 7.3 清理測試資料
DELETE FROM maintainance_photo 
WHERE project LIKE '%測試%' OR project LIKE '%test%';

-- 7.4 資料完整性檢查
SELECT 
  'Missing thing' as issue,
  COUNT(*) as count
FROM maintainance_photo 
WHERE thing IS NULL OR thing = ''
UNION ALL
SELECT 
  'Missing location' as issue,
  COUNT(*) as count
FROM maintainance_photo 
WHERE location IS NULL OR location = ''
UNION ALL
SELECT 
  'Missing photo_path' as issue,
  COUNT(*) as count
FROM maintainance_photo 
WHERE photo_path IS NULL OR photo_path = ''
UNION ALL
SELECT 
  'Future maintenance_time' as issue,
  COUNT(*) as count
FROM maintainance_photo 
WHERE maintainance_time > CURRENT_DATE;

-- =====================================================
-- 8. 索引優化 (提升查詢效能)
-- =====================================================

-- 8.1 為常用查詢欄位創建索引
CREATE INDEX IF NOT EXISTS idx_maintainance_photo_project 
ON maintainance_photo (project);

CREATE INDEX IF NOT EXISTS idx_maintainance_photo_maintainance_time 
ON maintainance_photo (maintainance_time DESC);

CREATE INDEX IF NOT EXISTS idx_maintainance_photo_thing 
ON maintainance_photo (thing);

CREATE INDEX IF NOT EXISTS idx_maintainance_photo_floor 
ON maintainance_photo (floor);

CREATE INDEX IF NOT EXISTS idx_maintainance_photo_user 
ON maintainance_photo (maintainance_user);

-- 8.2 複合索引 (多欄位查詢優化)
CREATE INDEX IF NOT EXISTS idx_maintainance_photo_project_time 
ON maintainance_photo (project, maintainance_time DESC);

CREATE INDEX IF NOT EXISTS idx_maintainance_photo_project_thing 
ON maintainance_photo (project, thing);

-- =====================================================
-- 9. 檢視表 (Views) 創建
-- =====================================================

-- 9.1 最新檢查記錄檢視
CREATE OR REPLACE VIEW latest_maintenance_checks AS
SELECT DISTINCT ON (project, thing, location)
  id,
  project,
  thing,
  location,
  floor,
  maintainance_time,
  maintainance_user,
  photo_path,
  created_at
FROM maintainance_photo 
ORDER BY project, thing, location, maintainance_time DESC;

-- 9.2 檢查統計檢視
CREATE OR REPLACE VIEW maintenance_statistics AS
SELECT 
  project,
  COUNT(*) as total_checks,
  COUNT(DISTINCT thing) as unique_tasks,
  COUNT(DISTINCT floor) as floors_covered,
  COUNT(DISTINCT maintainance_user) as users_involved,
  MIN(maintainance_time) as first_check,
  MAX(maintainance_time) as last_check,
  COUNT(CASE WHEN maintainance_time >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_checks
FROM maintainance_photo 
GROUP BY project;

-- =====================================================
-- 10. 備份和還原
-- =====================================================

-- 10.1 匯出資料 (查詢結果可複製為 CSV)
SELECT 
  id,
  thing,
  location,
  floor,
  creat_at,
  project,
  company,
  direction,
  maintainance_user,
  maintainance_time,
  photo_path,
  created_at,
  updated_at
FROM maintainance_photo 
ORDER BY created_at DESC;

-- 10.2 備份特定專案資料
SELECT * FROM maintainance_photo 
WHERE project = '要備份的專案名稱'
ORDER BY created_at;

-- =====================================================
-- 使用說明：
-- 
-- 1. 首先執行第 1 部分創建表和設定權限
-- 2. 使用第 2 部分進行資料新增
-- 3. 使用第 3 部分進行各種查詢
-- 4. 使用第 4 部分進行資料修改
-- 5. 使用第 5 部分進行資料刪除（請謹慎使用）
-- 6. 使用第 6 部分進行進階分析
-- 7. 定期使用第 7 部分進行資料維護
-- 8. 根據需要執行第 8 部分的索引優化
-- 9. 使用第 9 部分的檢視表簡化常用查詢
-- 10. 使用第 10 部分進行資料備份
-- 
-- 注意事項：
-- - 刪除操作請謹慎使用，建議先備份
-- - 索引會提升查詢速度但會影響寫入效能
-- - 定期檢查資料完整性
-- - 建議在測試環境中先測試所有操作
-- =====================================================