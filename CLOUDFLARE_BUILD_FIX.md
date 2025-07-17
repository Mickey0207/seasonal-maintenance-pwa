# Cloudflare 構建錯誤修復指南

## 🔧 已修復的問題

### 1. 環境變數問題
- 創建了 `src/lib/env.js` 來處理環境變數驗證
- 添加了預設值防止構建時出現 undefined 錯誤
- 修改了 `supabaseClient.js` 使用新的環境變數處理

### 2. 構建配置優化
- 更新了 `vite.config.js` 添加更多構建優化
- 設定了 `target: 'es2015'` 確保瀏覽器兼容性
- 添加了 `minify: 'terser'` 進行代碼壓縮
- 移除了生產環境的 console 和 debugger

### 3. 代碼分割優化
- 將依賴分割成更小的 chunks
- 分離了 router、utils 等模組

## 🚀 Cloudflare Pages 設定步驟

### 1. 構建設定
```
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: (留空)
Node.js version: 18.x (推薦)
```

### 2. 環境變數設定
在 Cloudflare Pages 的 Settings > Environment variables 中添加：

**Production 環境:**
```
VITE_SUPABASE_URL = 您的實際 Supabase URL
VITE_SUPABASE_ANON_KEY = 您的實際 Supabase Anon Key
```

**Preview 環境 (可選):**
```
VITE_SUPABASE_URL = 您的測試 Supabase URL
VITE_SUPABASE_ANON_KEY = 您的測試 Supabase Anon Key
```

### 3. 獲取 Supabase 配置
1. 登入 https://supabase.com
2. 選擇您的專案
3. 前往 Settings > API
4. 複製以下資訊：
   - Project URL (VITE_SUPABASE_URL)
   - anon public key (VITE_SUPABASE_ANON_KEY)

## 🔍 常見錯誤排除

### 錯誤 1: "Failed: build command exited with code: 1"
**可能原因:**
- 環境變數未設定
- 依賴安裝失敗
- 代碼語法錯誤

**解決方案:**
1. 確保在 Cloudflare Pages 中設定了正確的環境變數
2. 檢查 package.json 中的依賴版本
3. 查看構建日誌中的詳細錯誤信息

### 錯誤 2: "Cannot resolve module"
**可能原因:**
- 缺少依賴
- 路徑錯誤

**解決方案:**
1. 檢查 import 路徑是否正確
2. 確保所有依賴都在 package.json 中

### 錯誤 3: "Environment variable undefined"
**可能原因:**
- Cloudflare Pages 中未設定環境變數
- 變數名稱錯誤

**解決方案:**
1. 確保變數名稱以 `VITE_` 開頭
2. 在 Cloudflare Pages 設定中添加變數
3. 重新部署

## 📋 部署檢查清單

- [ ] 確認 Supabase 專案已創建
- [ ] 獲取正確的 Supabase URL 和 API Key
- [ ] 在 Cloudflare Pages 中設定環境變數
- [ ] 確認構建命令為 `npm run build`
- [ ] 確認輸出目錄為 `dist`
- [ ] 檢查 Git 倉庫是否包含最新代碼

## 🔄 重新部署步驟

1. 確保所有環境變數已正確設定
2. 在 Cloudflare Pages 中點擊 "Retry deployment"
3. 或者推送新的 commit 觸發自動部署

## 📞 如果仍有問題

請提供以下資訊：
1. 完整的構建錯誤日誌
2. Cloudflare Pages 的構建設定截圖
3. 環境變數設定截圖（隱藏敏感資訊）