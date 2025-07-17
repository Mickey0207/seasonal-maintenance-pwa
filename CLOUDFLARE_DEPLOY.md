# Cloudflare Pages 部署指南

## 問題診斷與解決方案

### 1. 常見部署問題

#### 問題 1: 環境變數未設定
**症狀**: 部署成功但應用程式無法連接到 Supabase
**解決方案**: 
- 在 Cloudflare Pages 設定中添加環境變數
- 確保變數名稱以 `VITE_` 開頭

#### 問題 2: 路由問題 (404 錯誤)
**症狀**: 直接訪問子路由時出現 404
**解決方案**: 
- 已添加 `public/_redirects` 文件
- 設定 SPA 重定向規則

#### 問題 3: 構建輸出目錄問題
**症狀**: Cloudflare 找不到構建文件
**解決方案**: 
- 已將輸出目錄從 `Output` 改為 `dist`
- 這是 Cloudflare Pages 的標準目錄

## 部署步驟

### 方法 1: 通過 Cloudflare Dashboard (推薦)

1. **登入 Cloudflare Dashboard**
   - 前往 https://dash.cloudflare.com
   - 選擇 "Pages" 服務

2. **連接 Git 倉庫**
   - 點擊 "Create a project"
   - 選擇 "Connect to Git"
   - 授權並選擇您的倉庫

3. **設定構建配置**
   ```
   Framework preset: Vite
   Build command: npm run build
   Build output directory: dist
   Root directory: (留空)
   ```

4. **設定環境變數**
   在 "Environment variables" 部分添加：
   ```
   VITE_SUPABASE_URL=您的_supabase_url
   VITE_SUPABASE_ANON_KEY=您的_supabase_anon_key
   ```

5. **部署**
   - 點擊 "Save and Deploy"
   - 等待構建完成

### 方法 2: 使用 Wrangler CLI

1. **安裝 Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **登入 Cloudflare**
   ```bash
   wrangler login
   ```

3. **部署**
   ```bash
   npm run deploy
   ```

## 環境變數檢查清單

確保您的 `.env` 文件包含正確的 Supabase 配置：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**重要**: 
- 變數名稱必須以 `VITE_` 開頭
- 在 Cloudflare Pages 中也要設定相同的環境變數
- 不要在 Git 中提交真實的 `.env` 文件

## 故障排除

### 構建失敗
1. 檢查 Node.js 版本 (建議 18+)
2. 清除 node_modules 並重新安裝
3. 檢查依賴版本衝突

### 運行時錯誤
1. 檢查瀏覽器控制台錯誤
2. 確認環境變數正確設定
3. 檢查 Supabase 連接

### 路由問題
1. 確認 `public/_redirects` 文件存在
2. 檢查 `base` 配置在 vite.config.js 中

## 性能優化

已在 vite.config.js 中添加：
- 代碼分割 (vendor, antd, supabase)
- 關閉 sourcemap (生產環境)
- 資源優化配置

## 監控與維護

部署後建議：
1. 設定 Cloudflare Analytics
2. 配置自定義域名
3. 啟用 HTTPS (自動)
4. 設定快取規則