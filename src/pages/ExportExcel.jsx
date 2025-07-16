import React, { useState, useEffect } from 'react';
import { Button, Spin, Alert, Table, App } from 'antd';
import ExcelJS from 'exceljs';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { useProject } from '../hooks/useProject';
import { dbUtils } from '../utils/database';

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
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [previewColumns, setPreviewColumns] = useState([]);

  // Function to fetch data and prepare for preview/excel generation
  const fetchAndPrepareData = async () => {
    setLoading(true);
    setError(null);
    console.log('fetchAndPrepareData called.');
    if (!project || !project.name) {
      console.log('Project data not available yet.', project);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching data for project:', project.name);
      const { data, error: dbError } = await dbUtils.maintenancePhoto.getByProject(project.name);
      if (dbError) {
        console.error('Error fetching maintenance photos:', dbError);
        throw dbError;
      }
      console.log('Fetched maintenance photos data:', data);

      if (!data || data.length === 0) {
        console.log('No maintenance photos found for this project.');
        setPreviewData([]);
        setLoading(false);
        return;
      }

      // Group data by 'thing'
      const groupedData = data.reduce((acc, item) => {
        const key = item.thing || '未分類';
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      }, {});
      console.log('Grouped data:', groupedData);

      // Prepare preview data in new format (horizontal layout)
      const previewData = prepareHorizontalPreviewData(groupedData);
      setPreviewData(previewData);
      
      // Create dynamic columns based on categories
      const categories = Object.keys(groupedData);
      const dynamicColumns = createDynamicColumns(categories);
      setPreviewColumns(dynamicColumns);

    } catch (err) {
      setError('無法獲取或處理數據');
      console.error('Error in fetchAndPrepareData:', err);
      message.error('操作失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to prepare horizontal preview data
  const prepareHorizontalPreviewData = (groupedData) => {
    const categories = Object.keys(groupedData);
    const maxRows = Math.max(...categories.map(cat => groupedData[cat].length));
    const previewRows = [];

    // Row 1: Photo counts
    const countRow = { key: 'count-row', rowType: 'count' };
    categories.forEach((category, index) => {
      const baseCol = index * 4;
      countRow[`col_${baseCol}`] = `照片數量: ${groupedData[category].length}`;
      countRow[`col_${baseCol + 1}`] = '';
      countRow[`col_${baseCol + 2}`] = '';
      countRow[`col_${baseCol + 3}`] = '';
    });
    previewRows.push(countRow);

    // Row 2: Category names (merged cells simulation)
    const categoryRow = { key: 'category-row', rowType: 'category' };
    categories.forEach((category, index) => {
      const baseCol = index * 4;
      categoryRow[`col_${baseCol}`] = category;
      categoryRow[`col_${baseCol + 1}`] = '';
      categoryRow[`col_${baseCol + 2}`] = '';
      categoryRow[`col_${baseCol + 3}`] = '';
    });
    previewRows.push(categoryRow);

    // Row 3: Headers
    const headerRow = { key: 'header-row', rowType: 'header' };
    categories.forEach((category, index) => {
      const baseCol = index * 4;
      headerRow[`col_${baseCol}`] = '項次';
      headerRow[`col_${baseCol + 1}`] = '照片';
      headerRow[`col_${baseCol + 2}`] = '位置';
      headerRow[`col_${baseCol + 3}`] = '備註';
    });
    previewRows.push(headerRow);

    // Data rows
    for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
      const dataRow = { key: `data-row-${rowIndex}`, rowType: 'data' };
      
      categories.forEach((category, catIndex) => {
        const baseCol = catIndex * 4;
        const item = groupedData[category][rowIndex];
        
        if (item) {
          dataRow[`col_${baseCol}`] = rowIndex + 1; // 項次
          dataRow[`col_${baseCol + 1}`] = item.photo_path; // 照片路徑
          dataRow[`col_${baseCol + 2}`] = item.location || ''; // 位置
          dataRow[`col_${baseCol + 3}`] = ''; // 備註 (空白)
        } else {
          dataRow[`col_${baseCol}`] = '';
          dataRow[`col_${baseCol + 1}`] = '';
          dataRow[`col_${baseCol + 2}`] = '';
          dataRow[`col_${baseCol + 3}`] = '';
        }
      });
      
      previewRows.push(dataRow);
    }

    return previewRows;
  };

  // Helper function to create dynamic columns
  const createDynamicColumns = (categories) => {
    const columns = [];
    
    categories.forEach((category, index) => {
      const baseCol = index * 4;
      
      // 項次 column
      columns.push({
        title: `${category} - 項次`,
        dataIndex: `col_${baseCol}`,
        key: `col_${baseCol}`,
        width: 50, // 符合 SETUP.md 規範：項次欄寬度 5 的比例調整
        align: 'center',
        render: (text, record) => {
          if (record.rowType === 'count') {
            return { children: text, props: { colSpan: 4 } };
          } else if (record.rowType === 'category') {
            return { children: text, props: { colSpan: 4, style: { backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center' } } };
          } else if (record.rowType === 'header') {
            return { children: text, props: { style: { backgroundColor: '#fafafa', fontWeight: 'bold' } } };
          }
          return text;
        }
      });
      
      // 照片 column
      columns.push({
        title: `${category} - 照片`,
        dataIndex: `col_${baseCol + 1}`,
        key: `col_${baseCol + 1}`,
        width: 220, // 調整欄寬以配合縮小的圖片
        align: 'center',
        render: (text, record) => {
          if (record.rowType === 'count' || record.rowType === 'category') {
            return { children: '', props: { colSpan: 0 } };
          } else if (record.rowType === 'header') {
            return { children: text, props: { style: { backgroundColor: '#fafafa', fontWeight: 'bold' } } };
          } else if (text && record.rowType === 'data') {
            return <img 
              src={dbUtils.storage.getImageUrl('maintainance-data-photo', text)} 
              alt="照片" 
              style={{ 
                width: 200, 
                height: 280, 
                objectFit: 'contain',
                border: '1px solid #d9d9d9',
                borderRadius: '4px'
              }} 
            />;
          }
          return text;
        }
      });
      
      // 位置 column
      columns.push({
        title: `${category} - 位置`,
        dataIndex: `col_${baseCol + 2}`,
        key: `col_${baseCol + 2}`,
        width: 96, // 符合 SETUP.md 規範：位置欄寬度 12 的比例調整
        align: 'center',
        render: (text, record) => {
          if (record.rowType === 'count' || record.rowType === 'category') {
            return { children: '', props: { colSpan: 0 } };
          } else if (record.rowType === 'header') {
            return { children: text, props: { style: { backgroundColor: '#fafafa', fontWeight: 'bold' } } };
          }
          return text;
        }
      });
      
      // 備註 column
      columns.push({
        title: `${category} - 備註`,
        dataIndex: `col_${baseCol + 3}`,
        key: `col_${baseCol + 3}`,
        width: 96, // 符合 SETUP.md 規範：備註欄寬度 12 的比例調整
        align: 'center',
        render: (text, record) => {
          if (record.rowType === 'count' || record.rowType === 'category') {
            return { children: '', props: { colSpan: 0 } };
          } else if (record.rowType === 'header') {
            return { children: text, props: { style: { backgroundColor: '#fafafa', fontWeight: 'bold' } } };
          }
          return text;
        }
      });
    });
    
    return columns;
  };

  // Trigger data fetch when project data is available
  useEffect(() => {
    console.log('Project useEffect triggered. Project:', project);
    if (project && project.name) {
      fetchAndPrepareData();
    }
  }, [project]); // Dependency on project object

  // Function to generate and download Excel
  const generateExcelFile = async () => {
    setLoading(true);
    setError(null);
    if (!project || !project.name) {
      message.error('專案資料尚未載入，無法生成 Excel。');
      setLoading(false);
      return;
    }

    try {
      const { data, error: dbError } = await dbUtils.maintenancePhoto.getByProject(project.name);
      if (dbError) throw dbError;

      if (!data || data.length === 0) {
        message.warning('沒有資料可供匯出。');
        setLoading(false);
        return;
      }

      const groupedData = data.reduce((acc, item) => {
        const key = item.thing || '未分類';
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      }, {});

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('維護照片記錄');

      const categories = Object.keys(groupedData);
      const maxRows = Math.max(...categories.map(cat => groupedData[cat].length));

      // Set column widths (4 columns per category) - 符合 SETUP.md 規範
      const totalColumns = categories.length * 4;
      for (let i = 1; i <= totalColumns; i++) {
        const colIndex = (i - 1) % 4;
        if (colIndex === 0) worksheet.getColumn(i).width = 5;   // 項次 - A欄
        else if (colIndex === 1) worksheet.getColumn(i).width = 40;  // 照片 - B欄
        else if (colIndex === 2) worksheet.getColumn(i).width = 12;  // 位置 - C欄
        else worksheet.getColumn(i).width = 12; // 備註 - D欄
      }

      let currentRow = 1;

      // Row 1: Photo counts
      categories.forEach((category, index) => {
        const startCol = index * 4 + 1;
        const cell = worksheet.getCell(currentRow, startCol);
        cell.value = `照片數量: ${groupedData[category].length}`;
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.font = { bold: true };
        
        // Merge cells for photo count
        worksheet.mergeCells(currentRow, startCol, currentRow, startCol + 3);
      });
      currentRow++;

      // Row 2: Category names
      categories.forEach((category, index) => {
        const startCol = index * 4 + 1;
        const cell = worksheet.getCell(currentRow, startCol);
        cell.value = category;
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF0F0F0' }
        };
        
        // Merge cells for category name
        worksheet.mergeCells(currentRow, startCol, currentRow, startCol + 3);
      });
      currentRow++;

      // Row 3: Headers
      categories.forEach((category, index) => {
        const startCol = index * 4 + 1;
        
        ['項次', '照片', '位置', '備註'].forEach((header, headerIndex) => {
          const cell = worksheet.getCell(currentRow, startCol + headerIndex);
          cell.value = header;
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.font = { bold: true };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFAFAFA' }
          };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });
      currentRow++;

      // Data rows
      for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
        let maxRowHeight = 388; // 515像素 ≈ 388點數 (515 * 0.75)
        
        for (let catIndex = 0; catIndex < categories.length; catIndex++) {
          const category = categories[catIndex];
          const startCol = catIndex * 4 + 1;
          const item = groupedData[category][rowIndex];
          
          if (item) {
            // 項次
            const seqCell = worksheet.getCell(currentRow, startCol);
            seqCell.value = rowIndex + 1;
            seqCell.alignment = { horizontal: 'center', vertical: 'middle' };
            seqCell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };

            // 照片
            const photoCell = worksheet.getCell(currentRow, startCol + 1);
            if (item.photo_path) {
              try {
                const imageUrl = dbUtils.storage.getImageUrl('maintainance-data-photo', item.photo_path);
                const imageBuffer = await urlToBuffer(imageUrl);
                const imageId = workbook.addImage({
                  buffer: imageBuffer,
                  extension: 'jpeg',
                });
                worksheet.addImage(imageId, {
                  tl: { col: startCol + 0.05, row: currentRow - 1 + 0.1 }, // Add margin
                  ext: { width: 267, height: 199 },
                });
                // 5.29cm height is approx 150 points in Excel
                maxRowHeight = Math.max(maxRowHeight, 150);
              } catch (imgError) {
                console.error(`Could not add image for ${item.photo_path}:`, imgError);
                photoCell.value = '無法載入圖片';
              }
            }
            photoCell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };

            // 位置
            const locationCell = worksheet.getCell(currentRow, startCol + 2);
            locationCell.value = item.location || '';
            locationCell.alignment = { horizontal: 'center', vertical: 'middle' };
            locationCell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };

            // 備註
            const remarkCell = worksheet.getCell(currentRow, startCol + 3);
            remarkCell.value = '';
            remarkCell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          } else {
            // Empty cells with borders
            for (let i = 0; i < 4; i++) {
              const cell = worksheet.getCell(currentRow, startCol + i);
              cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              };
            }
          }
        }
        
        worksheet.getRow(currentRow).height = maxRowHeight;
        currentRow++;
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${project.name}_季保養.xlsx`;
      link.click();

      message.success('Excel 文件已成功下載');

    } catch (err) {
      setError('無法獲取或處理數據');
      console.error(err);
      message.error('操作失敗，請稍後再試');
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
      <div style={{ padding: '20px' }}>
        <h1>匯出 Excel</h1>
        <p>點擊下面的按鈕來下載季保養資料的 Excel 檔案。</p>
        <p style={{ fontSize: '0.9em', color: 'var(--text-secondary)' }}>
          Excel 檔案將所有檢查項目橫向排列在同一個工作表中。每個檢查項目佔用 4 欄（項次｜照片｜位置｜備註），
          包含照片數量統計、分類標題和詳細資料。格式符合維護照片記錄範本規範。
        </p>
        <Button
          type="primary"
          onClick={generateExcelFile}
          loading={loading}
          disabled={loading}
        >
          {loading ? '正在生成...' : '下載 Excel'}
        </Button>
        {error && <Alert message={error} type="error" style={{ marginTop: 20 }} />}
        
        <div style={{ marginTop: 20 }}>
          <h2>Excel 格式預覽</h2>
          <p style={{ fontSize: '0.9em', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            以下預覽展示了 Excel 檔案的實際格式：每個檢查項目佔用 4 欄（項次｜照片｜位置｜備註），
            所有分類橫向排列在同一個工作表中。
          </p>
          <div style={{ overflowX: 'auto' }}>
            <style>
              {`
                .ant-table-tbody > tr.data-row-height > td {
                  height: 585px !important;
                  vertical-align: middle !important;
                }
              `}
            </style>
            <Table
              columns={previewColumns}
              dataSource={previewData}
              loading={loading}
              pagination={false}
              bordered
              size="small"
              scroll={{ x: 'max-content' }}
              rowClassName={(record) => {
                // 為資料列設定高度樣式
                if (record.rowType === 'data') {
                  return 'data-row-height';
                }
                return '';
              }}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}