import React, { useState, useEffect } from 'react';
import { Button, Spin, Alert, Table, App, Tabs } from 'antd';
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
  const { message, modal } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [previewColumns, setPreviewColumns] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [groupedData, setGroupedData] = useState({});

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
      setGroupedData(groupedData);

      // Prepare preview data in new format (horizontal layout)
      const previewData = prepareHorizontalPreviewData(groupedData);
      setPreviewData(previewData);
      
      // Create dynamic columns based on categories
      const categories = Object.keys(groupedData);
      const dynamicColumns = createDynamicColumns(categories);
      setPreviewColumns(dynamicColumns);

      if (categories.length > 0) {
        setActiveTab(categories[0]);
      }

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
    const previewData = {};

    for (const category of categories) {
      const categoryData = groupedData[category];
      const maxRows = categoryData.length;
      const previewRows = [];

      // Row 1: Photo counts
      const countRow = { key: 'count-row', rowType: 'count' };
      countRow[`col_0`] = `照片數量: ${maxRows}`;
      countRow[`col_1`] = '';
      countRow[`col_2`] = '';
      countRow[`col_3`] = '';
      previewRows.push(countRow);

      // Row 2: Headers
      const headerRow = { key: 'header-row', rowType: 'header' };
      headerRow[`col_0`] = '項次';
      headerRow[`col_1`] = '照片';
      headerRow[`col_2`] = '位置';
      headerRow[`col_3`] = '備註';
      previewRows.push(headerRow);

      // Data rows
      for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
        const dataRow = { key: `data-row-${rowIndex}`, rowType: 'data' };
        const item = categoryData[rowIndex];

        if (item) {
          dataRow[`col_0`] = rowIndex + 1;
          dataRow[`col_1`] = item.photo_path;
          dataRow[`col_2`] = item.location || '';
          dataRow[`col_3`] = '';
        } else {
          dataRow[`col_0`] = '';
          dataRow[`col_1`] = '';
          dataRow[`col_2`] = '';
          dataRow[`col_3`] = '';
        }
        previewRows.push(dataRow);
      }
      previewData[category] = previewRows;
    }

    return previewData;
  };

  // Helper function to create dynamic columns
  const createDynamicColumns = (category) => {
    const columns = [];
    const baseCol = 0;

    columns.push({
      title: '項次',
      dataIndex: `col_${baseCol}`,
      key: `col_${baseCol}`,
      width: 50,
      align: 'center',
      render: (text, record) => {
        if (record.rowType === 'count') {
          return { children: text, props: { colSpan: 4 } };
        } else if (record.rowType === 'header') {
          return { children: text, props: { style: { backgroundColor: '#fafafa', fontWeight: 'bold' } } };
        }
        return text;
      }
    });

    columns.push({
      title: '照片',
      dataIndex: `col_${baseCol + 1}`,
      key: `col_${baseCol + 1}`,
      width: 280,
      align: 'center',
      render: (text, record) => {
        if (record.rowType === 'count') {
          return { children: '', props: { colSpan: 0 } };
        } else if (record.rowType === 'header') {
          return { children: text, props: { style: { backgroundColor: '#fafafa', fontWeight: 'bold' } } };
        } else if (text && record.rowType === 'data') {
          return <img
            src={dbUtils.storage.getImageUrl('maintainance-data-photo', text)}
            alt="照片"
            style={{
              width: 267,
              height: 199,
              objectFit: 'contain',
              border: '1px solid #d9d9d9',
              borderRadius: '4px'
            }}
          />;
        }
        return text;
      }
    });

    columns.push({
      title: '位置',
      dataIndex: `col_${baseCol + 2}`,
      key: `col_${baseCol + 2}`,
      width: 96,
      align: 'center',
      render: (text, record) => {
        if (record.rowType === 'count') {
          return { children: '', props: { colSpan: 0 } };
        } else if (record.rowType === 'header') {
          return { children: text, props: { style: { backgroundColor: '#fafafa', fontWeight: 'bold' } } };
        }
        return text;
      }
    });

    columns.push({
      title: '備註',
      dataIndex: `col_${baseCol + 3}`,
      key: `col_${baseCol + 3}`,
      width: 96,
      align: 'center',
      render: (text, record) => {
        if (record.rowType === 'count') {
          return { children: '', props: { colSpan: 0 } };
        } else if (record.rowType === 'header') {
          return { children: text, props: { style: { backgroundColor: '#fafafa', fontWeight: 'bold' } } };
        }
        return text;
      }
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

      const workbook = new ExcelJS.Workbook();

      for (const category of Object.keys(groupedData)) {
        const worksheet = workbook.addWorksheet(category);
        const categoryData = groupedData[category];
        
        // Set column widths
        worksheet.getColumn(1).width = 5;   // 項次
        worksheet.getColumn(2).width = 40;  // 照片
        worksheet.getColumn(3).width = 12;  // 位置
        worksheet.getColumn(4).width = 12;  // 備註

        let currentRow = 1;

        // Photo count
        const countCell = worksheet.getCell(currentRow, 1);
        countCell.value = `照片數量: ${categoryData.length}`;
        countCell.alignment = { horizontal: 'center', vertical: 'middle' };
        countCell.font = { bold: true };
        worksheet.mergeCells(currentRow, 1, currentRow, 4);
        currentRow++;

        // Headers
        ['項次', '照片', '位置', '備註'].forEach((header, index) => {
          const cell = worksheet.getCell(currentRow, index + 1);
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
        currentRow++;

        // Data rows
        for (const [rowIndex, item] of categoryData.entries()) {
          let maxRowHeight = 387;

          // 項次
          const seqCell = worksheet.getCell(currentRow, 1);
          seqCell.value = rowIndex + 1;
          seqCell.alignment = { horizontal: 'center', vertical: 'middle' };
          seqCell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

          // 照片
          const photoCell = worksheet.getCell(currentRow, 2);
          if (item.photo_path) {
            try {
              const imageUrl = dbUtils.storage.getImageUrl('maintainance-data-photo', item.photo_path);
              const imageBuffer = await urlToBuffer(imageUrl);
              const imageId = workbook.addImage({
                buffer: imageBuffer,
                extension: 'jpeg',
              });
              worksheet.addImage(imageId, {
                tl: { col: 1.05, row: currentRow - 1 + 0.1 },
                ext: { width: 267, height: 199 },
              });
            } catch (imgError) {
              console.error(`Could not add image for ${item.photo_path}:`, imgError);
              photoCell.value = '無法載入圖片';
            }
          }
          photoCell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

          // 位置
          const locationCell = worksheet.getCell(currentRow, 3);
          locationCell.value = item.location || '';
          locationCell.alignment = { horizontal: 'center', vertical: 'middle' };
          locationCell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

          // 備註
          const remarkCell = worksheet.getCell(currentRow, 4);
          remarkCell.value = '';
          remarkCell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          
          worksheet.getRow(currentRow).height = maxRowHeight;
          currentRow++;
        }
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${project.name}_季保養.xlsx`;
      link.click();

      modal.success({
        title: <span style={{ color: 'white' }}>Excel 文件已成功下載</span>,
        content: <span style={{ color: 'white' }}>檔案 ${project.name}_季保養.xlsx 已經可以開啟。</span>,
        className: 'custom-success-modal',
      });

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
      <div style={{ padding: '20px', color: 'white' }}>
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
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              {Object.keys(groupedData).map(category => (
                <Tabs.TabPane tab={category} key={category}>
                  <Table
                    columns={createDynamicColumns(category)}
                    dataSource={previewData[category]}
                    loading={loading}
                    pagination={false}
                    bordered
                    size="small"
                    scroll={{ x: 'max-content' }}
                    rowClassName={(record) => {
                      if (record.rowType === 'data') {
                        return 'data-row-height';
                      }
                      return '';
                    }}
                  />
                </Tabs.TabPane>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}