import React from 'react';
import { Typography, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const ErrorMessage = ({ 
  message = '發生錯誤', 
  showBackButton = true, 
  onBack, 
  backText = '回主畫面' 
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.href = '/home';
    }
  };

  return (
    <div className="glass-morphism animate-fadeInUp" style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      padding: '40px',
      textAlign: 'center',
      color: 'var(--text-primary)',
      margin: '20px',
      maxWidth: '500px',
      marginLeft: 'auto',
      marginRight: 'auto'
    }}>
      <div className="animate-bounce" style={{ marginBottom: '24px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'var(--danger-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          color: 'white',
          boxShadow: 'var(--shadow-danger)',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          ⚠️
        </div>
      </div>
      <Typography.Title level={4} className="gradient-text" style={{ 
        marginBottom: 16,
        fontSize: '1.5rem'
      }}>
        {message}
      </Typography.Title>
      {showBackButton && (
        <Button 
          type="primary"
          onClick={handleBack}
          size="large"
          className="interactive-click"
          style={{
            height: '48px',
            fontSize: '16px',
            fontWeight: 600,
            borderRadius: '12px',
            background: 'var(--primary-gradient)',
            border: 'none',
            boxShadow: 'var(--shadow-glow)',
            padding: '0 32px'
          }}
        >
          🏠 {backText}
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage;