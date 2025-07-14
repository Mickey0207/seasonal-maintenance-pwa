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
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      padding: '40px',
      textAlign: 'center',
      color: 'var(--text-primary)'
    }}>
      <ExclamationCircleOutlined style={{ 
        fontSize: 64, 
        color: '#ef4444', 
        marginBottom: 24,
        animation: 'pulse 2s ease-in-out infinite'
      }} />
      <Typography.Title level={4} style={{ 
        color: 'var(--text-primary)', 
        marginBottom: 16 
      }}>
        {message}
      </Typography.Title>
      {showBackButton && (
        <Button 
          className="modern-btn-primary"
          type="primary"
          onClick={handleBack}
          size="large"
        >
          {backText}
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage;