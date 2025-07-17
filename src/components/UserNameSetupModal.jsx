import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { supabase } from '../lib/supabaseClient';

const UserNameSetupModal = ({ visible, onClose, userEmail, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const { userName } = values;
      
      // 檢查用戶名是否已存在
      const { data: existingUser, error: checkError } = await supabase
        .from('user_names')
        .select('user')
        .eq('user', userName)
        .single();

      if (existingUser) {
        message.error('此用戶名已被使用，請選擇其他名稱');
        setLoading(false);
        return;
      }

      // 插入新的用戶名記錄
      const { error: insertError } = await supabase
        .from('user_names')
        .insert([
          {
            user: userName,
            email: userEmail
          }
        ]);

      if (insertError) {
        throw insertError;
      }

      message.success('用戶名設定成功！');
      form.resetFields();
      onSuccess(userName);
      onClose();
    } catch (error) {
      console.error('設定用戶名失敗:', error);
      message.error('設定用戶名失敗：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center', color: 'var(--text-primary)' }}>
          <UserOutlined style={{ marginRight: 8, color: 'var(--text-accent)' }} />
          設定您的用戶名
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      className="modern-modal user-setup-modal"
      centered
      maskClosable={false}
      closable={false}
      width={400}
      styles={{
        mask: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
        content: { 
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          borderRadius: '16px'
        },
        header: {
          backgroundColor: 'transparent',
          borderBottom: '1px solid var(--border-primary)'
        },
        body: {
          backgroundColor: 'transparent'
        }
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{
          background: 'var(--primary-gradient)',
          width: 60,
          height: 60,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: '24px'
        }}>
          👤
        </div>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          歡迎！請設定您的用戶名以完成註冊
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          label={<span style={{ color: 'var(--text-primary)' }}>用戶名</span>}
          name="userName"
          rules={[
            { required: true, message: '請輸入用戶名' },
            { min: 2, message: '用戶名至少需要2個字符' },
            { max: 20, message: '用戶名不能超過20個字符' },
            {
              pattern: /^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/,
              message: '用戶名只能包含字母、數字、中文、底線和連字符'
            }
          ]}
        >
          <Input
            prefix={<UserOutlined style={{ color: 'var(--text-muted)' }} />}
            placeholder="請輸入您的用戶名"
            style={{
              height: 44,
              borderRadius: 8,
              fontSize: 16
            }}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{
              height: 44,
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              background: 'var(--primary-gradient)',
              border: 'none'
            }}
          >
            完成設定
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserNameSetupModal;