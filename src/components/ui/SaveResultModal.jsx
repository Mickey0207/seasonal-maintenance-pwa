import React from 'react';
import { Modal, Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const SaveResultModal = ({ 
  visible, 
  onClose, 
  success = true, 
  title = '', 
  message = '' 
}) => {
  const defaultTitle = success ? '儲存成功' : '儲存失敗';
  const defaultMessage = success ? '資料已成功儲存！' : '儲存過程中發生錯誤，請稍後再試。';

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      closable={false}
      width={400}
      className="save-result-modal"
    >
      <div style={{
        textAlign: 'center',
        padding: '20px 0'
      }}>
        <div className="animate-scaleIn" style={{
          marginBottom: '20px'
        }}>
          {success ? (
            <CheckCircleOutlined 
              style={{ 
                fontSize: '64px', 
                color: 'var(--text-success)',
                animation: 'successPulse 0.6s ease-out'
              }} 
            />
          ) : (
            <CloseCircleOutlined 
              style={{ 
                fontSize: '64px', 
                color: 'var(--text-danger)',
                animation: 'errorShake 0.6s ease-out'
              }} 
            />
          )}
        </div>
        
        <h2 style={{
          color: 'var(--text-primary)',
          marginBottom: '12px',
          fontSize: '24px',
          fontWeight: 600
        }}>
          {title || defaultTitle}
        </h2>
        
        <p style={{
          color: 'var(--text-secondary)',
          marginBottom: '24px',
          fontSize: '16px',
          lineHeight: 1.5
        }}>
          {message || defaultMessage}
        </p>
        
        <Button
          type="primary"
          size="large"
          onClick={onClose}
          className="interactive-click"
          style={{
            height: '48px',
            fontSize: '16px',
            fontWeight: 600,
            borderRadius: '12px',
            background: success ? 'var(--success-gradient)' : 'var(--primary-gradient)',
            border: 'none',
            boxShadow: success ? 'var(--shadow-success)' : 'var(--shadow-glow)',
            padding: '0 32px'
          }}
        >
          確定
        </Button>
      </div>
    </Modal>
  );
};

export default SaveResultModal;