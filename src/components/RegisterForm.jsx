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
    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
      <div className="neon-glow animate-rotateIn" style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'var(--success-gradient)',
        margin: '0 auto 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        fontWeight: 'bold',
        color: 'white'
      }}>
        👤
      </div>
      <Typography.Title level={2} className="gradient-text" style={{ 
        marginBottom: '8px',
        fontSize: '2rem',
        fontWeight: 700
      }}>
        註冊新帳號
      </Typography.Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleRegister}
        className="animate-fadeInUp"
        style={{
          marginTop: '24px',
          animationDelay: '0.3s',
          animationFillMode: 'both'
        }}
      >
        <Form.Item 
          label={<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>📧 Email</span>}
          name="email" 
          rules={[
            { required: true, message: '請輸入Email' }, 
            { type: 'email', message: 'Email格式錯誤' }
          ]}
        >
          <Input 
            placeholder="請輸入您的Email"
            className="interactive-hover"
            style={{
              height: '48px',
              borderRadius: '12px',
              fontSize: '16px'
            }}
          />
        </Form.Item>
        
        <Form.Item 
          label={<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>🔒 密碼</span>}
          name="password" 
          rules={[{ required: true, message: '請輸入密碼' }]}
        >
          <Input.Password 
            placeholder="請輸入密碼"
            className="interactive-hover"
            style={{
              height: '48px',
              borderRadius: '12px',
              fontSize: '16px'
            }}
          />
        </Form.Item>
        
        <Form.Item 
          label={<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>🔐 確認密碼</span>}
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
            placeholder="請再次輸入密碼"
            className="interactive-hover"
            style={{
              height: '48px',
              borderRadius: '12px',
              fontSize: '16px'
            }}
          />
        </Form.Item>
        
        {error && (
          <div className="animate-slideInLeft" style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--border-danger)',
            borderRadius: '12px',
            padding: '12px 16px',
            color: 'var(--text-danger)',
            marginBottom: '24px',
            textAlign: 'center',
            fontWeight: 500,
            backdropFilter: 'blur(10px)'
          }}>
            ⚠️ {error}
          </div>
        )}
        
        <Button 
          type="primary" 
          htmlType="submit" 
          block 
          loading={loading}
          className="interactive-click neon-glow"
          style={{
            height: '52px',
            fontSize: '18px',
            fontWeight: 600,
            borderRadius: '12px',
            background: 'var(--success-gradient)',
            border: 'none',
            boxShadow: 'var(--shadow-success)',
            transition: 'var(--transition-bounce)',
            marginBottom: '12px'
          }}
        >
          立即註冊
        </Button>
      </Form>
    </div>
  );
}