import React, { useState, useEffect } from 'react';
import { Button, Spin, Alert, Table, App } from 'antd';
import ExcelJS from 'exceljs';
import { useParams } from 'react-router-dom';
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

      // Prepare data for preview (flat list for simplicity)
      const flatPreviewData = [];
      for (const thing in groupedData) {
        groupedData[thing].forEach(item => {
          flatPreviewData.push({ ...item, key: item.id });
        });
      }
      console.log('Flat preview data:', flatPreviewData);
      setPreviewData(flatPreviewData);
      setPreviewColumns([
        { title: '檢查項目', dataIndex: 'thing', key: 'thing' },
        {
          title: '檢查照片',
          dataIndex: 'photo_path',
          key: 'photo_path',
          render: (text) => (
            text ? <img src={dbUtils.storage.getImageUrl('maintainance-data-photo', text)} alt="照片" style={{ width: 100, height: 100, objectFit: 'contain' }} /> : '無照片'
          ),
          align: 'center',
        },
        { title: '檢查位置', dataIndex: 'location', key: 'location' },
      ]);

    } catch (err) {
      setError('無法獲取或處理數據');
      console.error('Error in fetchAndPrepareData:', err);
      message.error('操作失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
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

      for (const thing in groupedData) {
        const worksheet = workbook.addWorksheet(thing.replace(/[/\\?*:[\]]/g, ''));

        worksheet.columns = [
          { width: 8 }, // A: 項次
          { width: 15 }, // B: 照片
          { width: 20 }, // C: 位置
          { width: 5 },  // D: Spacer
          { width: 8 }, // E: 項次
          { width: 15 }, // F: 照片
          { width: 20 }, // G: 位置
          { width: 5 },  // H: Spacer
          { width: 8 }, // I: 項次
          { width: 15 }, // J: 照片
          { width: 20 }, // K: 位置
          { width: 5 },  // L: Spacer
          { width: 8 }, // M: 項次
          { width: 15 }, // N: 照片
          { width: 20 }, // O: 位置
          { width: 5 },  // P: Spacer
          { width: 8 }, // Q: 項次
          { width: 15 }, // R: 照片
          { width: 20 }, // S: 位置
        ];

        let currentRow = 1;
        const itemsInThing = groupedData[thing];

        for (let i = 0; i < itemsInThing.length; i += 5) {
          const rowItems = itemsInThing.slice(i, i + 5);
          let currentColumnOffset = 0;
          let maxRowHeight = 20;

          for (let j = 0; j < rowItems.length; j++) {
            const item = rowItems[j];
            const colA = 1 + currentColumnOffset;
            const colB = 2 + currentColumnOffset;
            const colC = 3 + currentColumnOffset;

            worksheet.getCell(currentRow + 1, colA).value = i + j + 1;
            worksheet.getCell(currentRow + 1, colA).alignment = { vertical: 'middle', horizontal: 'center' };

            if (item.photo_path) {
              try {
                const imageUrl = dbUtils.storage.getImageUrl('maintainance-data-photo', item.photo_path);
                const imageBuffer = await urlToBuffer(imageUrl);
                const imageId = workbook.addImage({
                  buffer: imageBuffer,
                  extension: 'jpeg',
                });
                worksheet.addImage(imageId, {
                  tl: { col: colB - 1, row: currentRow },
                  ext: { width: 100, height: 100 }
                });
                maxRowHeight = Math.max(maxRowHeight, 80);
              } catch (imgError) {
                console.error(`Could not add image for ${item.photo_path}:`, imgError);
                worksheet.getCell(currentRow + 1, colB).value = '無法載入圖片';
              }
            }

            worksheet.getCell(currentRow + 1, colC).value = item.location;
            worksheet.getCell(currentRow + 1, colC).alignment = { vertical: 'middle', horizontal: 'center' };

            currentColumnOffset += 4;
          }
          worksheet.getRow(currentRow + 1).height = maxRowHeight;
          currentRow += 2;
        }
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
    return <ErrorMessage message="找不到專案資料" onBack={() => navigate(ROUTES.HOME)} />;
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
          Excel 檔案將根據「檢查項目」分類為不同的試算表。每個試算表中的資料將以每行五組的方式排列，每組包含「項次」、「照片」和「位置」。
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
          <h2>數據預覽 (將匯出至 Excel 的原始資料)</h2>
          <Table
            columns={previewColumns}
            dataSource={previewData}
            loading={loading}
            pagination={false}
            bordered
            size="small"
          />
        </div>
      </div>
    </PageLayout>
  );
}