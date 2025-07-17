import React from 'react';
import { Typography, Button } from 'antd';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Silent error handling in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center'
        }}>
          <Typography.Title level={3} type="danger">
            發生錯誤
          </Typography.Title>
          <Typography.Text style={{ marginBottom: '20px' }}>
            {this.state.error?.message || '未知錯誤'}
          </Typography.Text>
          <Button 
            type="primary" 
            onClick={() => window.location.href = '/'}
          >
            重新載入頁面
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;