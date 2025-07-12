import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Form, Input, Button, Typography } from 'antd';

export default function RegisterForm({ onRegisterSuccess }) {
  const [form] = Form.useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (values) => {
    setError('');
    const { email, password, confirmPassword } = values;
    if (!email || !password || !confirmPassword) {
      setError('所有欄位皆必填');
      return;
    }
    if (password !== confirmPassword) {
      setError('密碼與確認密碼不一致');
      return;
    }
    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    setError('註冊成功，請至信箱完成驗證後再登入！');
    if (onRegisterSuccess) onRegisterSuccess();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#e3eafc',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          minWidth: 0,
          padding: 'min(8vw,64px) 4vw min(4vw,32px) 4vw',
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 4px 24px 0 #e3e3e3',
          boxSizing: 'border-box',
        }}
      >
      <Typography.Title level={2} style={{ textAlign: 'center', marginBottom: 32, color: '#1976d2', fontWeight: 800, letterSpacing: 2, fontSize: 28 }}>註冊新帳號</Typography.Title>
      <Form
        form={form}
        layout="vertical"
        size="large"
        onFinish={handleRegister}
        autoComplete="off"
      >
        <Form.Item label={<span style={{ fontWeight: 600, fontSize: 18 }}>Email</span>} name="email" rules={[{ required: true, message: '請輸入Email' }, { type: 'email', message: 'Email格式錯誤' }]} style={{ marginBottom: 24 }}>
          <Input style={{ height: 48, fontSize: 18, borderRadius: 8 }} autoFocus />
        </Form.Item>
        <Form.Item label={<span style={{ fontWeight: 600, fontSize: 18 }}>密碼</span>} name="password" rules={[{ required: true, message: '請輸入密碼' }]} style={{ marginBottom: 24 }}>
          <Input.Password style={{ height: 48, fontSize: 18, borderRadius: 8 }} autoComplete="new-password" />
        </Form.Item>
        <Form.Item label={<span style={{ fontWeight: 600, fontSize: 18 }}>確認密碼</span>} name="confirmPassword" dependencies={["password"]} rules={[
          { required: true, message: '請再次輸入密碼' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('密碼與確認密碼不一致'));
            },
          }),
        ]} style={{ marginBottom: 24 }}>
          <Input.Password style={{ height: 48, fontSize: 18, borderRadius: 8 }} autoComplete="new-password" />
        </Form.Item>
        {error && <Typography.Text type="danger" style={{ fontWeight: 600, fontSize: 16 }}>{error}</Typography.Text>}
        <Form.Item style={{ marginTop: 8 }}>
          <Button type="primary" htmlType="submit" block loading={loading} style={{ height: 48, fontSize: 18, borderRadius: 8, fontWeight: 700 }}>
            註冊
          </Button>
        </Form.Item>
      </Form>
      </div>
    </div>
  );
}
