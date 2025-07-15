從 Supabase 生成 Excel 檔案的完整流程說明
基本需求分析
您需要將 Supabase 資料庫中的 maintainance_photo 表格資料匯出到根目錄的 Excel 檔案中，並按照特定格式排列。

資料庫表格結構
表格名稱：季保養Excel輸出

主要欄位：

thing：物品名稱

photo_path：照片路徑（指向 Supabase Storage 的 maintainance-data-photo 儲存桶）

location：位置資訊

Excel 檔案結構設計
第一個物品區塊：

A2~D2：合併儲存格，填入第一個 thing 值

A4~An：序號欄（1、2、3...），僅在 B 欄有資料時填入

B4~Bn：照片欄，插入從 Supabase Storage 下載的實際照片

C4~Cn：位置欄，填入對應的 location 值

多個物品處理：

若資料庫中有多個不同的 thing 值，則為每個 thing 創建獨立區塊

每個新區塊複製 A~D 欄的結構，向下順移排列

每個區塊的合併儲存格填入對應的 thing 值