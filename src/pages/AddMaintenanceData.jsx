import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, DatePicker, Button, message, Card, Space } from 'antd';
import { SaveOutlined, ClearOutlined } from '@ant-design/icons';
import PageLayout from '../components/layout/PageLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { useProject } from '../hooks/useProject';
import { dbUtils } from '../utils/database';
// 移除 SaveResultModal import
import { ROUTES } from '../config/constants';
import dayjs from 'dayjs';

export default function AddMaintenanceData() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userName } = useAuth();
  const { project, loading, error } = useProject(id);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  // 移除不需要的 Modal 狀態

  useEffect(() => {
    // 自動填入新增日期為今天
    form.setFieldsValue({
      create_at: dayjs(),
      user: userName
    });
  }, [form, userName]);

  const handleSubmit = async (values) => {
    if (!project) return;
    
    setSubmitting(true);
    let payload = null;
    try {
      payload = {
        thing: values.thing,
        location: values.location,
        floor: values.floor,
        creat_at: values.create_at.format('YYYY-MM-DD'),  // 修正欄位名稱為 creat_at
        creat_user: userName,  // 新增者欄位
        project: project.name,
        company: project.unit,
        direction: project.directions
      };

      
      const { error } = await dbUtils.maintenanceData.create(payload);

      if (error) {
        throw error;
      }

      // 使用 message 而不是 Modal，避免卡住
      message.success({
        content: '季保養資料新增成功！',
        duration: 3,
        style: {
          marginTop: '20vh',
        }
      });
      
      // 成功後只重置表單，不重載頁面
      form.resetFields();
      form.setFieldsValue({
        create_at: dayjs(),
        user: userName
      });
    } catch (error) {
      message.error('新增季保養資料失敗: ' + (error.message || '未知錯誤'));
      // 使用 message 而不是 Modal，避免卡住
      message.error({
        content: `新增失敗：${error.message || '未知錯誤'}`,
        duration: 3
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    form.setFieldsValue({
      create_at: dayjs(),
      user: userName
    });
    // 移除頁面重載，只重置表單
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
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '20px'
      }}>
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
              ➕ 新增季保養資料
            </div>
          }
          style={{ marginBottom: 24 }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="animate-slideInLeft"
            style={{ 
              maxWidth: '600px', 
              margin: '0 auto',
              animationDelay: '0.2s',
              animationFillMode: 'both'
            }}
          >
            <Form.Item
              label={<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>🔍 檢查項目</span>}
              name="thing"
              rules={[{ required: true, message: '請輸入檢查項目' }]}
            >
              <Input 
                placeholder="請輸入檢查項目" 
                className="interactive-hover"
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  fontSize: '16px'
                }}
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>📍 檢查位置</span>}
              name="location"
              rules={[{ required: true, message: '請輸入檢查位置' }]}
            >
              <Input 
                placeholder="請輸入檢查位置" 
                className="interactive-hover"
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  fontSize: '16px'
                }}
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>🏢 樓層</span>}
              name="floor"
              rules={[{ required: true, message: '請輸入樓層' }]}
            >
              <Input 
                placeholder="請輸入樓層" 
                className="interactive-hover"
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  fontSize: '16px'
                }}
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>📅 新增日期</span>}
              name="create_at"
              rules={[{ required: true, message: '請選擇新增日期' }]}
            >
              <DatePicker 
                style={{ 
                  width: '100%',
                  height: '48px',
                  borderRadius: '12px',
                  fontSize: '16px'
                }}
                className="interactive-hover"
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>👤 新增者</span>}
              name="user"
            >
              <Input 
                disabled 
                value={userName}
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)'
                }}
              />
            </Form.Item>

            <Form.Item style={{ marginTop: 32 }}>
              <Space size="large" style={{ width: '100%', justifyContent: 'center' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={submitting}
                  size="large"
                  className="interactive-click neon-glow"
                  style={{
                    height: '52px',
                    fontSize: '18px',
                    fontWeight: 600,
                    borderRadius: '12px',
                    background: 'var(--success-gradient)',
                    border: 'none',
                    boxShadow: 'var(--shadow-success)',
                    padding: '0 32px'
                  }}
                >
                  儲存
                </Button>
                <Button
                  type="default"
                  icon={<ClearOutlined />}
                  onClick={handleCancel}
                  size="large"
                  className="interactive-hover"
                  style={{
                    height: '52px',
                    fontSize: '18px',
                    fontWeight: 500,
                    borderRadius: '12px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)',
                    padding: '0 32px'
                  }}
                >
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </PageLayout>
  );
}