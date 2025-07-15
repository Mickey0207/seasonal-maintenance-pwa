import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import RegisterForm from '../components/RegisterForm';
import { ROUTES } from '../config/constants';

export default function Register() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.body.classList.add('register-page');
    return () => {
      document.body.classList.remove('register-page');
    };
  }, []);

  if (success) {
    return (
      <>
        <div className="animated-bg"></div>
        <div className="register-container">
          <div className="register-card-modern glass-effect">
            <h2 style={{ 
              color: 'var(--text-primary)', 
              textAlign: 'center',
              marginBottom: 24 
            }}>
              註冊成功！
            </h2>
            <p style={{ 
              color: 'var(--text-secondary)', 
              textAlign: 'center',
              marginBottom: 32 
            }}>
              請至信箱完成驗證後再登入
            </p>
            <Button 
              className="modern-btn-primary"
              type="primary"
              block
              size="large"
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              前往登入
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="animated-bg"></div>
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="glass-morphism animate-scaleIn" style={{
          padding: '48px 40px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: 'var(--shadow-intense)',
          position: 'relative',
          zIndex: 1
        }}>
          <RegisterForm onRegisterSuccess={() => setSuccess(true)} />
          <Button
            block 
            onClick={() => navigate(ROUTES.LOGIN)}
            className="interactive-hover"
            style={{
              height: '48px',
              fontSize: '16px',
              fontWeight: 500,
              borderRadius: '12px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
              marginTop: '12px'
            }}
          >
            🔙 返回登入
          </Button>
        </div>
      </div>
    </>
  );
}