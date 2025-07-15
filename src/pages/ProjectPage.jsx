import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Form, Select, Upload, Card, message, Alert, FloatButton } from 'antd';
import { CameraOutlined, SaveOutlined, WarningOutlined, SettingOutlined } from '@ant-design/icons';
import PageLayout from '../components/layout/PageLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import SaveResultModal from '../components/ui/SaveResultModal';
import { useAuth } from '../hooks/useAuth';
import { useProject } from '../hooks/useProject';
import { dbUtils } from '../utils/database';
import { ROUTES } from '../config/constants';
import dayjs from 'dayjs';

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userName } = useAuth();
  const { project, loading, error } = useProject(id);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [maintenanceOptions, setMaintenanceOptions] = useState({
    floors: [],
    things: [],
    locations: []
  });
  const [fileList, setFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState('');
  const [showSettingAlert, setShowSettingAlert] = useState(false);
  const [settingDisabled, setSettingDisabled] = useState(false);
  const [saveResultVisible, setSaveResultVisible] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (project) {
      checkMaintenanceSetting();
      fetchMaintenanceOptions();
      // 設置表單初始值
      form.setFieldsValue({
        maintainance_time: dayjs().format('YYYY-MM-DD'),
        maintainance_user: userName
      });
    }
  }, [project, userName, form]);

  const checkMaintenanceSetting = async () => {
    try {
      const { data, error } = await dbUtils.maintenanceSettings.getByProject(project.name);

      if (error && error.code !== 'PGRST116') {
        console.error('檢查保養設定失敗:', error);
        return;
      }

      const today = dayjs();
      if (!data) {
        // 沒有設定
        setShowSettingAlert(true);
        setSettingDisabled(true);
      } else if (data.time_start && data.time_finish) {
        const startDate = dayjs(data.time_start);
        const endDate = dayjs(data.time_finish);
        
        if (today.isBefore(startDate) || today.isAfter(endDate)) {
          // 超出保養時間範圍
          setShowSettingAlert(true);
          setSettingDisabled(true);
        }
      }
    } catch (error) {
      console.error('檢查保養設定錯誤:', error);
    }
  };

  const fetchMaintenanceOptions = async () => {
    try {
      const { data, error } = await dbUtils.maintenanceData.getOptions(project.name);
      if (error) throw error;
      setMaintenanceOptions(data);
    } catch (error) {
      console.error('獲取保養選項失敗:', error);
    }
  };

  const addWatermark = (file, formValues) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // 繪製原圖
        ctx.drawImage(img, 0, 0);
        
        // 設置浮水印樣式
        const fontSize = Math.max(16, img.width / 40);
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = 'rgba(128, 128, 128, 0.8)';
        ctx.textAlign = 'right';
        
        // 浮水印內容
        const watermarkText = [
          `案場名稱: ${project.name}`,
          `檢查項目: ${formValues.thing || ''}`,
          `檢查位置: ${formValues.location || ''}`,
          `檢查說明: ${project.directions}`,
          `檢查單位: ${project.unit}`,
          `檢查日期: ${dayjs().format('YYYY-MM-DD')}`
        ];
        
        // 計算浮水印位置（右下角）
        const padding = 20;
        const lineHeight = fontSize + 4;
        const startY = img.height - (watermarkText.length * lineHeight) - padding;
        
        // 繪製背景
        const textWidth = Math.max(...watermarkText.map(text => ctx.measureText(text).width));
        ctx.fillStyle = 'rgba(128, 128, 128, 0.7)';
        ctx.fillRect(
          img.width - textWidth - padding * 2,
          startY - padding,
          textWidth + padding * 2,
          watermarkText.length * lineHeight + padding * 2
        );
        
        // 繪製文字
        ctx.fillStyle = 'black';
        watermarkText.forEach((text, index) => {
          ctx.fillText(
            text,
            img.width - padding,
            startY + (index * lineHeight) + fontSize
          );
        });
        
        canvas.toBlob(resolve, 'image/jpeg', 0.9);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleUpload = async (options) => {
    const { file } = options;
    const formValues = form.getFieldsValue();
    
    try {
      // 添加浮水印
      const watermarkedFile = await addWatermark(file, formValues);
      
      // 生成安全的文件名（移除中文字符和特殊字符）
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop() || 'jpg';
      // 更嚴格的檔案名稱清理
      const baseName = file.name
        .replace(/\.[^/.]+$/, '') // 移除副檔名
        .replace(/[^\w\-]/g, '_') // 只保留字母、數字、連字號和下劃線
        .replace(/_{2,}/g, '_') // 合併多個下劃線
        .replace(/^_+|_+$/g, '') // 移除開頭和結尾的下劃線
        .substring(0, 50); // 限制長度
      
      const fileName = `${timestamp}_${baseName || 'photo'}.${fileExtension}`;
      const filePath = `${id}/${fileName}`;
      
      // 上傳到 Supabase Storage
      const { error: uploadError } = await dbUtils.storage.uploadFile('maintainance-data-photo', filePath, watermarkedFile);
      
      if (uploadError) throw uploadError;
      
      // 更新文件列表和預覽
      const publicUrl = dbUtils.storage.getImageUrl('maintainance-data-photo', filePath);
      
      setFileList([{
        uid: file.uid,
        name: file.name,
        status: 'done',
        url: publicUrl,
        path: filePath
      }]);
      
      setPreviewImage(publicUrl);
      message.success('照片上傳成功！');
    } catch (error) {
      console.error('上傳失敗:', error);
      message.error('照片上傳失敗');
      setFileList([{
        uid: file.uid,
        name: file.name,
        status: 'error'
      }]);
    }
  };

  const handleSubmit = async (values) => {
    if (!fileList.length || !fileList[0].path) {
      message.error('請先上傳照片');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        maintainance_user: userName,
        maintainance_time: dayjs().format('YYYY-MM-DD'),
        photo_path: fileList[0].path,
        floor: values.floor,
        thing: values.thing,
        location: values.location,
        project: project.name,
        company: project.unit,
        direction: project.directions,
        creat_at: dayjs().format('YYYY-MM-DD') // 添加 creat_at 欄位
        // 移除 creat_user，因為檢查者應該寫入 maintainance_user
      };

      console.log('準備提交的保養資料:', payload);
      console.log('用戶名稱:', userName);
      console.log('專案資料:', project);

      const { error } = await dbUtils.maintenancePhoto.create(payload);

      if (error) throw error;

      setSaveSuccess(true);
      setSaveMessage('保養資料儲存成功！');
      setSaveResultVisible(true);
      form.resetFields();
      setFileList([]);
      setPreviewImage('');
    } catch (error) {
      console.error('儲存失敗:', error);
      setSaveSuccess(false);
      setSaveMessage('儲存失敗，請稍後再試');
      setSaveResultVisible(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error || !project) {
    return <ErrorMessage message="找不到專案資料" onBack={() => navigate(ROUTES.HOME)} />;
  }

  return (
    <PageLayout
      userName={userName}
      projectName={project.name}
      projectId={id}
    >
      {showSettingAlert && (
        <FloatButton
          icon={<WarningOutlined />}
          type="primary"
          style={{
            right: 24,
            bottom: 80,
            backgroundColor: '#ff4d4f'
          }}
          onClick={() => navigate(`/project/${id}/season-setting`)}
          tooltip="請先設定季保養時間"
        />
      )}
      
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '20px'
      }}>
        {showSettingAlert && (
          <div className="glass-morphism animate-slideInLeft" style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid var(--border-warning)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <WarningOutlined style={{ color: 'var(--text-warning)', fontSize: '20px' }} />
              <div>
                <div style={{ 
                  color: 'var(--text-primary)', 
                  fontWeight: 600,
                  marginBottom: '4px'
                }}>
                  未完成季保養設定
                </div>
                <div style={{ 
                  color: 'var(--text-primary)', 
                  fontSize: '14px'
                }}>
                  請先完成本次季保養設定（季別、保養時間起迄）才能進行保養作業
                </div>
              </div>
            </div>
            <Button 
              size="small" 
              type="primary" 
              icon={<SettingOutlined />}
              onClick={() => navigate(`/project/${id}/season-setting`)}
              className="interactive-hover"
              style={{
                background: 'var(--warning-gradient)',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 500
              }}
            >
              前往設定
            </Button>
          </div>
        )}

        <Card 
          className="modern-card glass-morphism animate-fadeInUp"
          title={
            <div className="gradient-text" style={{ 
              fontSize: '1.5rem', 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📸 季保養照片上傳表單
            </div>
          }
          style={{ marginBottom: 24 }}
        >
          {/* 顯示專案資訊 */}
          <div className="glass-morphism animate-slideInLeft" style={{ 
            background: 'var(--bg-glass-light)', 
            padding: 12, 
            borderRadius: 8, 
            marginBottom: 16,
            animationDelay: '0.2s',
            animationFillMode: 'both'
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr',
              gap: '8px',
              fontSize: '14px'
            }}>
              {/* 左上角：案場名稱 */}
              <div style={{ gridColumn: '1', gridRow: '1' }}>
                <span style={{ color: 'var(--text-accent)', fontWeight: 500 }}>案場：</span>
                <span style={{ color: 'var(--text-primary)', marginLeft: '4px' }}>{project.name}</span>
              </div>
              
              {/* 右上角：單位 */}
              <div style={{ gridColumn: '2', gridRow: '1' }}>
                <span style={{ color: 'var(--text-accent)', fontWeight: 500 }}>單位：</span>
                <span style={{ color: 'var(--text-primary)', marginLeft: '4px' }}>{project.unit}</span>
              </div>
              
              {/* 左下角：日期 */}
              <div style={{ gridColumn: '1', gridRow: '2' }}>
                <span style={{ color: 'var(--text-accent)', fontWeight: 500 }}>日期：</span>
                <span style={{ color: 'var(--text-primary)', marginLeft: '4px' }}>{dayjs().format('YYYY-MM-DD')}</span>
              </div>
              
              {/* 右下角：檢查者 */}
              <div style={{ gridColumn: '2', gridRow: '2' }}>
                <span style={{ color: 'var(--text-accent)', fontWeight: 500 }}>檢查者：</span>
                <span style={{ color: 'var(--text-primary)', marginLeft: '4px' }}>{userName}</span>
              </div>
            </div>
            
            <div style={{ 
              marginTop: '8px',
              paddingTop: '8px',
              borderTop: '1px solid var(--border-primary)',
              fontSize: '13px'
            }}>
              <span style={{ color: 'var(--text-accent)', fontWeight: 500 }}>說明：</span>
              <span style={{ 
                color: 'var(--text-secondary)', 
                marginLeft: '4px',
                lineHeight: 1.4
              }}>
                {project.directions}
              </span>
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="animate-slideInRight"
            style={{
              animationDelay: '0.4s',
              animationFillMode: 'both'
            }}
          >
            <Form.Item
              label={<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>🏢 樓層</span>}
              name="floor"
              rules={[{ required: true, message: '請選擇樓層' }]}
            >
              <Select
                placeholder="請選擇樓層"
                showSearch
                className="interactive-hover"
                style={{
                  height: '48px',
                  borderRadius: '12px'
                }}
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {maintenanceOptions.floors.map(floor => (
                  <Select.Option key={floor} value={floor}>
                    🏢 {floor}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label={<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>🔍 檢查項目</span>}
              name="thing"
              rules={[{ required: true, message: '請選擇檢查項目' }]}
            >
              <Select
                placeholder="請選擇檢查項目"
                showSearch
                className="interactive-hover"
                style={{
                  height: '48px',
                  borderRadius: '12px'
                }}
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {maintenanceOptions.things.map(thing => (
                  <Select.Option key={thing} value={thing}>
                    🔍 {thing}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label={<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>📍 檢查位置</span>}
              name="location"
              rules={[{ required: true, message: '請選擇檢查位置' }]}
            >
              <Select
                placeholder="請選擇檢查位置"
                showSearch
                className="interactive-hover"
                style={{
                  height: '48px',
                  borderRadius: '12px'
                }}
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {maintenanceOptions.locations.map(location => (
                  <Select.Option key={location} value={location}>
                    📍 {location}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label={<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>📸 上傳照片</span>}
              required
            >
              <Upload
                customRequest={handleUpload}
                fileList={fileList}
                listType="picture-card"
                maxCount={1}
                accept="image/*"
                className="interactive-hover"
                onRemove={() => {
                  setFileList([]);
                  setPreviewImage('');
                }}
              >
                {fileList.length === 0 && (
                  <div className="animate-bounce" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'var(--text-accent)'
                  }}>
                    <CameraOutlined style={{ fontSize: '2rem', marginBottom: '8px' }} />
                    <div style={{ fontWeight: 500 }}>📸 上傳照片</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            {previewImage && (
              <Form.Item label={<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>👁️ 照片預覽（含浮水印）</span>}>
                <div className="glass-morphism animate-scaleIn" style={{
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  background: 'var(--bg-tertiary)',
                  border: '2px solid var(--border-primary)'
                }}>
                  <img 
                    src={previewImage} 
                    alt="保養照片預覽" 
                    style={{ 
                      width: '100%',
                      maxHeight: '600px',
                      borderRadius: '12px',
                      boxShadow: 'var(--shadow-card)',
                      objectFit: 'contain'
                    }} 
                  />
                  <div style={{ 
                    marginTop: '12px', 
                    fontSize: '14px', 
                    color: 'var(--text-accent)',
                    fontWeight: 500
                  }}>
                    📸 已添加浮水印的保養照片
                  </div>
                </div>
              </Form.Item>
            )}

            <Form.Item style={{ marginTop: 32, textAlign: 'center' }}>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={submitting}
                size="large"
                disabled={settingDisabled}
                className="interactive-click neon-glow"
                style={{
                  height: '56px',
                  fontSize: '20px',
                  fontWeight: 600,
                  borderRadius: '12px',
                  background: settingDisabled ? 'var(--bg-tertiary)' : 'var(--success-gradient)',
                  border: 'none',
                  boxShadow: settingDisabled ? 'none' : 'var(--shadow-success)',
                  padding: '0 48px',
                  color: settingDisabled ? 'var(--text-muted)' : 'white'
                }}
              >
                {settingDisabled ? '🚫 請先完成設定' : '儲存保養資料'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
      
      <SaveResultModal
        visible={saveResultVisible}
        onClose={() => setSaveResultVisible(false)}
        success={saveSuccess}
        message={saveMessage}
      />
    </PageLayout>
  );
}
