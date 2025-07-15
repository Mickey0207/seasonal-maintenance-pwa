import React from 'react';
import { Spin } from 'antd';

const LoadingSpinner = ({ tip = '載入中...', style = {} }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      zIndex: 9999,
      ...style
    }}>
      <div className="glass-morphism animate-fadeInUp" style={{
        padding: '60px 40px',
        textAlign: 'center',
        borderRadius: '20px',
        minWidth: '300px'
      }}>
        <div className="animate-bounce" style={{ marginBottom: '24px' }}>
          <div className="neon-glow" style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--primary-gradient)',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            animation: 'rotateIn 2s ease-out infinite'
          }}>
            ⚡
          </div>
        </div>
        <Spin size="large" style={{ color: 'var(--text-accent)' }} />
        <div style={{
          marginTop: '24px',
          color: 'var(--text-primary)',
          fontSize: '18px',
          fontWeight: 600
        }}>
          {tip}
        </div>
        <div style={{
          marginTop: '8px',
          color: 'var(--text-secondary)',
          fontSize: '14px'
        }}>
          請稍候片刻...
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;