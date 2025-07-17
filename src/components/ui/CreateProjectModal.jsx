import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Typography, Spin, Alert, App } from 'antd';
import { PlusOutlined, CopyOutlined, ProjectOutlined } from '@ant-design/icons';
import { projectTemplateUtils } from '../../utils/projectTemplate';

const { Title, Text } = Typography;

const CreateProjectModal = ({ 
  visible, 
  onClose, 
  onSuccess 
}) => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [templatePreview, setTemplatePreview] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [previewLoading, setPreviewLoading] = useState(true);

  // 載入範本預覽
  useEffect(() => {
    if (visible) {
      loadTemplatePreview();
      setProjectName('新的季保養專案');
    }
  }, [visible]);

  const loadTemplatePreview = async () => {
    setPreviewLoading(true);
    try {
      const { preview, error } = await projectTemplateUtils.getTemplatePreview();
      if (error) throw error;
      setTemplatePreview(preview);
    } catch (error) {
      console.error('載入範本預覽失敗:', error);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      message.error({
        content: '輸入錯誤：請輸入專案名稱',
        duration: 3
      });
      return;
    }

    setLoading(true);
    try {
      const { project, error, message } = await projectTemplateUtils.createProjectFromTemplate(projectName.trim());
      
      if (error) throw error;

      Modal.success({
        title: '專案創建成功',
        content: message,
        className: 'custom-success-modal',
        onOk: () => {
          onSuccess?.(project);
          onClose();
        }
      });
    } catch (error) {
      console.error('創建專案失敗:', error);
      Modal.error({
        title: '創建失敗',
        content: `創建專案時發生錯誤: ${error.message}`,
        className: 'modern-modal'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading) {
      setProjectName('');
      setTemplatePreview(null);
      onClose();
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      className="modern-modal"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ProjectOutlined style={{ color: 'var(--text-accent)', fontSize: '20px' }} />
          <span>創建新專案</span>
        </div>
      }
    >
      <div style={{ padding: '20px 0' }}>
        {/* 範本預覽區域 */}
        <div style={{ 
          background: 'var(--bg-tertiary)', 
          border: '1px solid var(--border-primary)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <Title level={4} style={{ 
            color: 'var(--text-primary)', 
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CopyOutlined style={{ color: 'var(--text-accent)' }} />
            範本預覽
          </Title>
          
          {previewLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin size="large" />
              <Text style={{ display: 'block', marginTop: '12px', color: 'var(--text-secondary)' }}>
                載入範本資訊中...
              </Text>
            </div>
          ) : templatePreview ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <Text strong style={{ color: 'var(--text-primary)' }}>範本來源：</Text>
                <br />
                <Text style={{ color: 'var(--text-secondary)' }}>{templatePreview.name}</Text>
              </div>
              <div>
                <Text strong style={{ color: 'var(--text-primary)' }}>單位：</Text>
                <br />
                <Text style={{ color: 'var(--text-secondary)' }}>{templatePreview.unit}</Text>
              </div>
              <div>
                <Text strong style={{ color: 'var(--text-primary)' }}>保養設定項目：</Text>
                <br />
                <Text style={{ color: 'var(--text-secondary)' }}>{templatePreview.settingsCount} 項</Text>
              </div>
              <div>
                <Text strong style={{ color: 'var(--text-primary)' }}>保養資料項目：</Text>
                <br />
                <Text style={{ color: 'var(--text-secondary)' }}>{templatePreview.dataCount} 項</Text>
              </div>
              <div>
                <Text strong style={{ color: 'var(--text-primary)' }}>保養照片結構：</Text>
                <br />
                <Text style={{ color: 'var(--text-secondary)' }}>{templatePreview.photoCount} 項</Text>
              </div>
              <div>
                <Text strong style={{ color: 'var(--text-primary)' }}>專案封面：</Text>
                <br />
                <Text style={{ color: 'var(--text-secondary)' }}>
                  {templatePreview.hasPhoto ? '✓ 包含' : '✗ 無照片'}
                </Text>
              </div>
            </div>
          ) : (
            <Alert
              message="無法載入範本預覽"
              description="請稍後再試或聯繫管理員"
              type="warning"
              showIcon
            />
          )}
        </div>

        {/* 專案名稱輸入 */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={5} style={{ color: 'var(--text-primary)', marginBottom: '12px' }}>
            新專案名稱
          </Title>
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="請輸入新專案的名稱"
            size="large"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '8px',
              color: 'var(--text-primary)'
            }}
            disabled={loading}
          />
          <Text style={{ 
            color: 'var(--text-muted)', 
            fontSize: '12px',
            display: 'block',
            marginTop: '8px'
          }}>
            請確保專案名稱的唯一性，避免與現有專案重複
          </Text>
        </div>

        {/* 說明文字 */}
        <Alert
          message="範本說明"
          description={
            <div>
              <p>此功能會複製專案1的所有設定，創建一個全新的獨立專案，包括：</p>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li>專案基本資訊（home_project_card）</li>
                <li>保養設定資料（maintainance_setting）</li>
                <li>保養項目資料（maintainance_data）</li>
                <li>保養照片結構（maintainance_photo，不含實際照片文件）</li>
                <li>專案封面照片（如果存在）</li>
              </ul>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                注意：保養照片的資料結構會被複製，但實際照片文件需要重新上傳。新專案不會包含任何密碼保護功能。
              </p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />

        {/* 操作按鈕 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '12px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-primary)'
        }}>
          <Button
            onClick={handleCancel}
            disabled={loading}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
              borderRadius: '8px',
              height: '40px',
              padding: '0 20px'
            }}
          >
            取消
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateProject}
            loading={loading}
            disabled={!projectName.trim() || previewLoading}
            style={{
              background: 'var(--primary-gradient)',
              border: 'none',
              borderRadius: '8px',
              height: '40px',
              padding: '0 24px',
              fontWeight: '600'
            }}
          >
            {loading ? '創建中...' : '創建專案'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateProjectModal;