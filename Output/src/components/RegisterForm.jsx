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
    if (onRegisterSuccess) onRegisterSuccess();
  };

  return (
    <>
      <Typography.Title className="register-title">
        註冊新帳號
      </Typography.Title>
      <Form
        form={form}
        layout="vertical"
        size="large"
        onFinish={handleRegister}
        autoComplete="off"
      >
        <Form.Item 
          className="modern-form-item"
          label="Email" 
          name="email" 
          rules={[
            { required: true, message: '請輸入Email' }, 
            { type: 'email', message: 'Email格式錯誤' }
          ]}
        >
          <Input 
            className="modern-input"
            placeholder="請輸入您的Email"
            autoFocus 
          />
        </Form.Item>
        
        <Form.Item 
          className="modern-form-item"
          label="密碼" 
          name="password" 
          rules={[{ required: true, message: '請輸入密碼' }]}
        >
          <Input.Password 
            className="modern-password"
            placeholder="請輸入密碼"
            autoComplete="new-password" 
          />
        </Form.Item>
        
        <Form.Item 
          className="modern-form-item"
          label="確認密碼" 
          name="confirmPassword" 
          dependencies={["password"]} 
          rules={[
            { required: true, message: '請再次輸入密碼' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('密碼與確認密碼不一致'));
              },
            }),
          ]}
        >
          <Input.Password 
            className="modern-password"
            placeholder="請再次輸入密碼"
            autoComplete="new-password" 
          />
        </Form.Item>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div style={{ marginTop: 32 }}>
          <Button 
            className="login-btn-primary"
            type="primary" 
            htmlType="submit" 
            block 
            loading={loading}
            size="large"
          >
            註冊
          </Button>
        </div>
      </Form>
    </>
  );
}