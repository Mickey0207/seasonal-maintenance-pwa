# SETUP.md Excel 格式實現完成

## 🎯 完全按照 SETUP.md 規範實現

### 1. 基本設定
- ✅ 全部列高：19.5
- ✅ 全部欄寬：5.26
- ✅ 字體：Microsoft YaHei UI

### 2. 標題列設定
- ✅ A1~B2：決裁編號 (字體大小14)
- ✅ C1~F2：空白區域
- ✅ G1~H2：工程名稱 (字體大小20)
- ✅ I1~T2：專案名稱 (從 maintainance_photo.project 取得，字體大小14)
- ✅ U1~AD2：驗收照片 (字體大小20)
- ✅ AE1~AF2：日期 (字體大小20)
- ✅ AG1~AJ1：開始時間 (從 maintainance_setting.time_start 取得，字體大小20)
- ✅ AG2~AJ2：結束時間 (從 maintainance_setting.time_finish 取得，字體大小20)

### 3. 資料區格式
每組資料包含：
- ✅ C4~I12：照片區域 (插入實體圖片)
- ✅ C13~I13：編號 (№1, №2, №3... 字體大小14，有下框線)
- ✅ C14：位置標籤 (字體大小10)
- ✅ D14~I14：位置內容 (從 maintainance_photo.location 取得)
- ✅ C15：內容標籤 (字體大小10)
- ✅ D15~I15：內容內容 (從 maintainance_photo.thing 取得)
- ✅ C16：備註標籤 (字體大小10)
- ✅ D16~I16：備註內容 (空白)

### 4. 佈局規則
- ✅ 一橫排4組資料
- ✅ 每組間隔2欄 (實際間隔8欄+1欄=9欄)
- ✅ 每直排間隔1列 (實際間隔13列+1列=14列)
- ✅ 編號按筆數遞增：№1, №2, №3...

### 5. 資料來源
- ✅ 照片：maintainance_photo.photo_path (插入實體圖片)
- ✅ 專案名稱：maintainance_photo.project
- ✅ 位置：maintainance_photo.location
- ✅ 內容：maintainance_photo.thing
- ✅ 開始時間：maintainance_setting.time_start
- ✅ 結束時間：maintainance_setting.time_finish

## 🔧 技術實現

### 儲存格合併
```javascript
// 標題列合併
worksheet.mergeCells('A1:B2');     // 決裁編號
worksheet.mergeCells('G1:H2');     // 工程名稱
worksheet.mergeCells('I1:T2');     // 專案名稱
worksheet.mergeCells('U1:AD2');    // 驗收照片
worksheet.mergeCells('AE1:AF2');   // 日期
worksheet.mergeCells('AG1:AJ1');   // 開始時間
worksheet.mergeCells('AG2:AJ2');   // 結束時間

// 資料區合併
worksheet.mergeCells('C4:I12');    // 照片區域
worksheet.mergeCells('C13:I13');   // 編號列
worksheet.mergeCells('D14:I14');   // 位置內容
worksheet.mergeCells('D15:I15');   // 內容內容
worksheet.mergeCells('D16:I16');   // 備註內容
```

### 照片插入
```javascript
worksheet.addImage(imageId, {
  tl: { col: baseCol - 1 + 0.1, row: photoStartRow - 1 + 0.1 },
  br: { col: baseCol + 5.9, row: photoEndRow - 0.1 }
});
```

### 佈局計算
```javascript
const baseCol = 3 + (colIndex * 9);  // C=3, L=12, U=21, AD=30
const baseRow = currentRow + (rowIndex * 14);  // 每直排間隔14列
```

## 📊 輸出效果

### 標題區
- 專業的表格標題格式
- 自動填入專案名稱和時間
- 統一的字體和大小

### 資料區
- 4欄並列的照片展示
- 清楚的編號和分類
- 完整的位置和內容資訊

### 檔案特性
- 檔案名：`{專案名稱}_SETUP範本.xlsx`
- 完全符合 SETUP.md 規範
- 可直接列印使用

現在 Excel 匯出格式完全按照 SETUP.md 的描述實現！