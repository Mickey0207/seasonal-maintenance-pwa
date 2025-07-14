# 🌟 季保養管理系統

一個現代化的深色主題季保養管理系統，採用酷炫的 UI 設計和流暢的動畫效果。

## ✨ 特色功能

### 🎨 視覺設計
- **深色主題**：專業的深色配色方案
- **漸變效果**：精美的漸變色彩搭配
- **玻璃效果**：現代化的毛玻璃背景
- **動畫交互**：流暢的過渡動畫和懸停效果
- **響應式設計**：完美適配各種設備

### 🚀 技術特點
- **React 19** + **Vite** - 最新前端技術棧
- **Ant Design 5** - 企業級 UI 組件庫
- **Supabase** - 現代化後端服務
- **CSS 變數** - 統一的主題管理
- **模組化架構** - 清晰的代碼組織

### 🎯 核心功能
- 用戶認證系統
- 項目管理
- 季保養記錄
- 歷史數據查看
- 設定管理

## 🎨 UI 設計亮點

### 配色方案
```css
/* 主要漸變色 */
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
--accent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

/* 深色背景 */
--bg-primary: #0a0e1a;
--bg-secondary: #1a1f2e;
--bg-tertiary: #252b3d;
--bg-card: #1e2332;
```

### 動畫效果
- **淡入上升**：頁面載入動畫
- **懸停變換**：卡片和按鈕交互
- **發光效果**：重點元素高亮
- **浮動動畫**：背景裝飾元素

### 玻璃效果
```css
.glass-effect {
  background: rgba(30, 35, 50, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

## 🛠️ 開發指南

### 環境設定
```bash
# 安裝依賴
npm install

# 設定環境變數
cp .env.example .env
# 編輯 .env 填入 Supabase 資訊

# 啟動開發服務器
npm run dev
```

### 項目結構
```
src/
├── components/          # 組件庫
│   ├── forms/          # 表單組件
│   ├── layout/         # 佈局組件
│   └── ui/             # 基礎 UI 組件
├── config/             # 配置文件
├── hooks/              # 自定義 Hooks
├── pages/              # 頁面組件
├── styles/             # 樣式文件
│   ├── theme.css       # 主題變數和動畫
│   ├── components-new.css  # 組件樣式
│   └── forms-new.css   # 表單樣式
└── utils/              # 工具函數
```

## 🎯 設計原則

### 1. 一致性
- 統一的配色方案
- 一致的動畫時長
- 標準化的間距系統

### 2. 可用性
- 清晰的視覺層次
- 直觀的交互反饋
- 無障礙設計考量

### 3. 性能
- CSS 變數優化
- 硬體加速動畫
- 模組化載入

## 🚀 部署

```bash
# 構建生產版本
npm run build

# 預覽構建結果
npm run preview
```

## 📱 響應式設計

- **桌面端**：完整功能體驗
- **平板端**：優化的觸控交互
- **手機端**：簡化的導航結構

## 🎨 自定義主題

修改 `src/styles/theme.css` 中的 CSS 變數即可自定義主題：

```css
:root {
  --primary-gradient: your-gradient;
  --bg-primary: your-background;
  --text-primary: your-text-color;
}
```

---

**打造現代化的使用體驗，讓季保養管理變得更加優雅！** ✨