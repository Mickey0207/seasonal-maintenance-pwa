# 設定指南

## Supabase 後端設定

### 1. 創建 Supabase 項目
1. 前往 [Supabase](https://supabase.com) 並創建新項目
2. 記下項目的 URL 和 anon key

### 2. 設定環境變數
複製 `.env.example` 為 `.env` 並填入您的 Supabase 資訊：

```bash
cp .env.example .env
```

編輯 `.env` 文件：
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. 創建資料表

在 Supabase SQL 編輯器中執行以下 SQL：

```sql
-- 創建用戶名稱表
CREATE TABLE user_names (
  id SERIAL PRIMARY KEY,
  user VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 創建項目卡片表
CREATE TABLE home_project_card (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(255),
  directions TEXT,
  photo_path VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 創建維護記錄表
CREATE TABLE maintainance (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES home_project_card(id),
  time_start TIMESTAMP,
  time_finish TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 創建維護設定表
CREATE TABLE maintainance_setting (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  year_q VARCHAR(50),
  time_start DATE,
  time_finish DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 插入測試數據
INSERT INTO user_names (user, email) VALUES 
('testuser', 'test@example.com'),
('admin', 'admin@example.com');

INSERT INTO home_project_card (name, unit, directions) VALUES 
('測試案場', '測試單位', '這是一個測試項目');
```

### 4. 設定 RLS (Row Level Security)

```sql
-- 啟用 RLS
ALTER TABLE user_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_project_card ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintainance ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintainance_setting ENABLE ROW LEVEL SECURITY;

-- 創建政策（允許所有操作，您可以根據需要調整）
CREATE POLICY "Allow all operations" ON user_names FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON home_project_card FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON maintainance FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON maintainance_setting FOR ALL USING (true);
```

### 5. 創建測試用戶

在 Supabase Authentication 中創建測試用戶：
- Email: test@example.com
- Password: test123456

### 6. 測試連接

啟動應用程式後，點擊登入頁面的「測試連接」按鈕來驗證 Supabase 連接是否正常。

## 故障排除

### 連接失敗
- 檢查 `.env` 文件中的 URL 和 Key 是否正確
- 確認 Supabase 項目是否啟用
- 檢查網路連接

### 登入失敗
- 確認用戶已在 Supabase Authentication 中創建
- 檢查密碼是否正確
- 查看瀏覽器控制台的錯誤訊息