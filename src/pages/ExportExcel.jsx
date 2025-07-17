import React, { useState, useEffect } from 'react';
import { Button, Spin, Alert, Table, App, Modal } from 'antd';
import ExcelJS from 'exceljs';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { useProject } from '../hooks/useProject';
import { dbUtils } from '../utils/database';
import { supabase } from '../lib/supabaseClient';

async function urlToBuffer(url) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return buffer;
}

export default function ExportExcel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userName } = useAuth();
  const { project, loading: projectLoading, error: projectError } = useProject(id);
  const { message, modal } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [maintenanceData, setMaintenanceData] = useState([]);

  // 獲取保養資料
  const fetchMaintenanceData = async () => {
    if (!project || !project.name) return;

    try {
      const { data, error: dbError } = await dbUtils.maintenancePhoto.getByProject(project.name);
      if (dbError) throw dbError;
      setMaintenanceData(data || []);
    } catch (err) {
      console.error('Error fetching maintenance data:', err);
      setError('無法獲取保養資料');
    }
  };

  useEffect(() => {
    if (project && project.name) {
      fetchMaintenanceData();
    }
  }, [project]);

  // 生成 Excel 文件 - 完全按照 Excel.py 的格式
  const generateExcelFile = async () => {
    setLoading(true);
    setError(null);

    if (!project || !project.name) {
      message.error({
        content: '無法生成 Excel：專案資料尚未載入，請稍後再試',
        duration: 3
      });
      setLoading(false);
      return;
    }

    try {
      // 獲取最新資料
      const { data, error: dbError } = await dbUtils.maintenancePhoto.getByProject(project.name);
      if (dbError) throw dbError;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('1008-範本');

      // 設定全部列高和欄寬 - 按照 SETUP.md
      // 全部的列設定為 49.5
      for (let i = 1; i <= 1000; i++) {
        worksheet.getRow(i).height = 49.5;
      }
      
      // 全部的欄設定為 82.5
      for (let i = 1; i <= 50; i++) {
        worksheet.getColumn(i).width = 6.5;
      }

      // 設定邊框樣式
      const thinBorder = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };

      // 獲取 maintainance_setting 資料
      const { data: settingData, error: settingError } = await supabase
        .from('maintainance_setting')
        .select('time_start, time_finish')
        .eq('name', project.name)
        .single();

      // 標題列設定 - 按照 SETUP.md
      // A1~B2 合併儲存格 - 決裁編號
      worksheet.mergeCells('A1:B2');
      const cell_A1 = worksheet.getCell('A1');
      cell_A1.value = '決裁編號';
      cell_A1.font = { size: 14, name: 'Microsoft YaHei UI' };
      cell_A1.alignment = { horizontal: 'center', vertical: 'middle' };
      cell_A1.border = thinBorder;

      // C1~F2 合併儲存格 (空白)
      worksheet.mergeCells('C1:F2');
      worksheet.getCell('C1').border = thinBorder;

      // G1~H2 合併儲存格 - 工程名稱
      worksheet.mergeCells('G1:H2');
      const cell_G1 = worksheet.getCell('G1');
      cell_G1.value = '工程名稱';
      cell_G1.font = { size: 14, name: 'Microsoft YaHei UI' };
      cell_G1.alignment = { horizontal: 'center', vertical: 'middle' };
      cell_G1.border = thinBorder;

      // I1~T2 合併儲存格 - 專案名稱
      worksheet.mergeCells('I1:T2');
      const cell_I1 = worksheet.getCell('I1');
      cell_I1.value = project.name;
      cell_I1.font = { size: 14, name: 'Microsoft YaHei UI' };
      cell_I1.alignment = { horizontal: 'center', vertical: 'middle' };
      cell_I1.border = thinBorder;

      // U1~AD2 合併儲存格 - 驗收照片
      worksheet.mergeCells('U1:AD2');
      const cell_U1 = worksheet.getCell('U1');
      cell_U1.value = '驗收照片';
      cell_U1.font = { size: 20, name: 'Microsoft YaHei UI' };
      cell_U1.alignment = { horizontal: 'center', vertical: 'middle' };
      cell_U1.border = thinBorder;

      // AE1~AF2 合併儲存格 - 日期
      worksheet.mergeCells('AE1:AF2');
      const cell_AE1 = worksheet.getCell('AE1');
      cell_AE1.value = '日期';
      cell_AE1.font = { size: 20, name: 'Microsoft YaHei UI' };
      cell_AE1.alignment = { horizontal: 'center', vertical: 'middle' };
      cell_AE1.border = thinBorder;

      // AG1~AJ1 合併儲存格 - 開始時間
      worksheet.mergeCells('AG1:AJ1');
      const cell_AG1 = worksheet.getCell('AG1');
      cell_AG1.value = settingData?.time_start || '';
      cell_AG1.font = { size: 14, name: 'Microsoft YaHei UI' };
      cell_AG1.alignment = { horizontal: 'center', vertical: 'middle' };
      cell_AG1.border = thinBorder;

      // AG2~AJ2 合併儲存格 - 結束時間
      worksheet.mergeCells('AG2:AJ2');
      const cell_AG2 = worksheet.getCell('AG2');
      cell_AG2.value = settingData?.time_finish || '';
      cell_AG2.font = { size: 14, name: 'Microsoft YaHei UI' };
      cell_AG2.alignment = { horizontal: 'center', vertical: 'middle' };
      cell_AG2.border = thinBorder;

      // 處理保養資料 - 按照 SETUP.md 的格式
      if (data && data.length > 0) {
        let currentRow = 4; // 從第4列開始
        let groupNumber = 1;
        
        // 計算需要多少直排（每直排間隔一列）
        const totalRows = Math.ceil(data.length / 4); // 每橫排4組資料
        
        for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
          const baseRow = currentRow + (rowIndex * 14); // 每直排間隔13列 + 1列間隔
          
          // 一橫排有四組資料，每組間隔兩欄
          for (let colIndex = 0; colIndex < 4; colIndex++) {
            const dataIndex = rowIndex * 4 + colIndex;
            if (dataIndex >= data.length) break;
            
            const item = data[dataIndex];
            const baseCol = 3 + (colIndex * 9); // C=3, L=12, U=21, AD=30 (每組間隔8欄 + 1欄間隔)
            
            // 正確的欄位轉換函數
            const columnToLetter = (colNumber) => {
              let result = '';
              while (colNumber > 0) {
                colNumber--;
                result = String.fromCharCode(65 + (colNumber % 26)) + result;
                colNumber = Math.floor(colNumber / 26);
              }
              return result;
            };
            
            const baseColLetter = columnToLetter(baseCol); // 轉換為字母
            
            // 照片區域 (C4~I12 類似的區域)
            const photoStartCol = baseColLetter;
            const photoEndCol = columnToLetter(baseCol + 6); // 7欄寬度
            const photoStartRow = baseRow;
            const photoEndRow = baseRow + 8; // 9列高度
            
            // 合併照片區域並插入照片
            console.log(`合併照片區域 ${groupNumber}: ${photoStartCol}${photoStartRow}:${photoEndCol}${photoEndRow}`);
            try {
              worksheet.mergeCells(`${photoStartCol}${photoStartRow}:${photoEndCol}${photoEndRow}`);
            } catch (mergeError) {
              console.error(`合併照片區域失敗 ${groupNumber}:`, mergeError);
            }
            
            if (item.photo_path) {
              try {
                const imageUrl = dbUtils.storage.getImageUrl('maintainance-data-photo', item.photo_path);
                const imageBuffer = await urlToBuffer(imageUrl);
                const imageId = workbook.addImage({
                  buffer: imageBuffer,
                  extension: 'jpeg',
                });

                // 插入照片到合併的儲存格 - 調整為指定尺寸
                // 高度: 6.01公分, 寬度: 7.71公分
                // ExcelJS 使用磅值，1公分 = 28.35磅
                // 高度: 6.01cm = 170.3磅, 寬度: 7.71cm = 218.5磅
                // 但實際需要轉換為像素：1磅 ≈ 1.33像素
                // 高度: 170.3 * 1.33 ≈ 226.5px, 寬度: 218.5 * 1.33 ≈ 290.6px
                worksheet.addImage(imageId, {
                  tl: { col: baseCol - 1 + 0.1, row: photoStartRow - 1 + 0.1 },
                  ext: { width: 290.6, height: 226.5 }
                });
              } catch (imgError) {
                console.error(`無法插入照片 ${item.photo_path}:`, imgError);
                const photoCell = worksheet.getCell(`${photoStartCol}${photoStartRow}`);
                photoCell.value = '照片載入失敗';
                photoCell.alignment = { horizontal: 'center', vertical: 'middle' };
              }
            }
            
            // 編號列 (C13~I13 類似) - 只保留下框線
            const numberRow = baseRow + 9;
            console.log(`合併編號列 ${groupNumber}: ${photoStartCol}${numberRow}:${photoEndCol}${numberRow}`);
            try {
              worksheet.mergeCells(`${photoStartCol}${numberRow}:${photoEndCol}${numberRow}`);
            } catch (mergeError) {
              console.error(`合併編號列失敗 ${groupNumber}:`, mergeError);
            }
            const numberCell = worksheet.getCell(`${photoStartCol}${numberRow}`);
            numberCell.value = `№${groupNumber}`;
            numberCell.font = { size: 14, name: 'Microsoft YaHei UI' };
            numberCell.alignment = { horizontal: 'center', vertical: 'middle' };
            // 只保留下框線
            numberCell.border = { 
              bottom: { style: 'thin', color: { argb: 'FF000000' } } 
            };
            
            // 位置列 (C14) - 取消邊框
            const locationRow = numberRow + 1;
            const locationLabelCell = worksheet.getCell(`${photoStartCol}${locationRow}`);
            locationLabelCell.value = '位置:';
            locationLabelCell.font = { size: 10, name: 'Microsoft YaHei UI' };
            // 取消邊框
            
            // 位置內容 (D14~I14) - 取消邊框
            const locationContentStart = columnToLetter(baseCol + 1);
            const locationContentEnd = photoEndCol;
            console.log(`合併位置內容 ${groupNumber}: ${locationContentStart}${locationRow}:${locationContentEnd}${locationRow}`);
            try {
              worksheet.mergeCells(`${locationContentStart}${locationRow}:${locationContentEnd}${locationRow}`);
            } catch (mergeError) {
              console.error(`合併位置內容失敗 ${groupNumber}:`, mergeError);
            }
            const locationContentCell = worksheet.getCell(`${locationContentStart}${locationRow}`);
            locationContentCell.value = item.location || '';
            locationContentCell.font = { size: 10, name: 'Microsoft YaHei UI' };
            // 取消邊框
            
            // 內容列 (C15) - 取消邊框
            const contentRow = locationRow + 1;
            const contentLabelCell = worksheet.getCell(`${photoStartCol}${contentRow}`);
            contentLabelCell.value = '內容:';
            contentLabelCell.font = { size: 10, name: 'Microsoft YaHei UI' };
            // 取消邊框
            
            // 內容內容 (D15~I15) - 取消邊框
            console.log(`合併內容內容 ${groupNumber}: ${locationContentStart}${contentRow}:${locationContentEnd}${contentRow}`);
            try {
              worksheet.mergeCells(`${locationContentStart}${contentRow}:${locationContentEnd}${contentRow}`);
            } catch (mergeError) {
              console.error(`合併內容內容失敗 ${groupNumber}:`, mergeError);
            }
            const contentContentCell = worksheet.getCell(`${locationContentStart}${contentRow}`);
            contentContentCell.value = item.thing || '';
            contentContentCell.font = { size: 10, name: 'Microsoft YaHei UI' };
            // 取消邊框
            
            // 備註列 (C16) - 只保留下框線
            const remarkRow = contentRow + 1;
            const remarkLabelCell = worksheet.getCell(`${photoStartCol}${remarkRow}`);
            remarkLabelCell.value = '備註:';
            remarkLabelCell.font = { size: 10, name: 'Microsoft YaHei UI' };
            // 只保留下框線
            remarkLabelCell.border = { 
              bottom: { style: 'thin', color: { argb: 'FF000000' } } 
            };
            
            // 備註內容 (D16~I16) - 只保留下框線
            console.log(`合併備註內容 ${groupNumber}: ${locationContentStart}${remarkRow}:${locationContentEnd}${remarkRow}`);
            try {
              worksheet.mergeCells(`${locationContentStart}${remarkRow}:${locationContentEnd}${remarkRow}`);
            } catch (mergeError) {
              console.error(`合併備註內容失敗 ${groupNumber}:`, mergeError);
            }
            const remarkContentCell = worksheet.getCell(`${locationContentStart}${remarkRow}`);
            remarkContentCell.value = '';
            remarkContentCell.font = { size: 10, name: 'Microsoft YaHei UI' };
            // 只保留下框線
            remarkContentCell.border = { 
              bottom: { style: 'thin', color: { argb: 'FF000000' } } 
            };
            
            groupNumber++;
          }
        }
      }

      // 生成並下載文件
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${project.name}_1008範本.xlsx`;
      link.click();

      // 使用 message 而不是 Modal，避免卡住
      message.success({
        content: `Excel 文件已成功下載！檔案 ${project.name}_1008範本.xlsx 已生成`,
        duration: 3,
        style: {
          marginTop: '20vh',
        }
      });

    } catch (err) {
      console.error('生成 Excel 失敗:', err);
      message.error({
        content: '生成失敗：無法生成 Excel 文件，請稍後再試',
        duration: 3
      });
    } finally {
      setLoading(false);
    }
  };

  if (projectLoading) return <LoadingSpinner />;
  if (projectError || !project) {
    return <ErrorMessage message="找不到專案資料" onBack={() => navigate('/')} />;
  }

  return (
    <PageLayout
      userName={userName}
      projectName={project?.name}
      projectId={id}
    >
      <div style={{ padding: '20px', color: 'white' }}>
        <h1>匯出 Excel - SETUP.md 格式</h1>
        <p>按照 SETUP.md 的完整格式生成季保養資料 Excel 檔案。</p>
        
        <div style={{ 
          background: 'var(--bg-card)', 
          padding: '16px', 
          borderRadius: '8px', 
          margin: '16px 0',
          border: '1px solid var(--border-primary)'
        }}>
          <h3>📋 範本格式說明</h3>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>完全按照 SETUP.md 的格式規範</li>
            <li>全部列高：19.5，全部欄寬：5.26</li>
            <li>字體：Microsoft YaHei UI</li>
            <li>標題列：決裁編號、工程名稱、專案名稱、驗收照片、日期</li>
            <li>資料區：一橫排4組，每組包含照片、編號、位置、內容、備註</li>
            <li>自動從 maintainance_setting 取得時間資料</li>
          </ul>
        </div>

        <Button
          type="primary"
          onClick={generateExcelFile}
          loading={loading}
          disabled={loading}
          size="large"
          style={{
            background: 'var(--primary-gradient)',
            border: 'none',
            height: '48px',
            fontSize: '16px',
            fontWeight: 600
          }}
        >
          {loading ? '正在生成 Excel...' : '下載 1008範本 Excel'}
        </Button>

        {error && (
          <Alert 
            message={error} 
            type="error" 
            style={{ marginTop: 20 }} 
            showIcon
          />
        )}

        <div style={{ marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          <p>📊 資料統計：共 {maintenanceData.length} 筆保養照片記錄</p>
          <p>📁 檔案格式：Excel (.xlsx)</p>
          <p>🎯 範本版本：1008-範本 (與 Excel.py 完全一致)</p>
        </div>
      </div>
    </PageLayout>
  );
}