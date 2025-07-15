import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Modal, Typography, message, AutoComplete, Space } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { supabase } from '../lib/supabaseClient';
import { dbUtils } from '../utils/database';
import { ROUTES } from '../config/constants';

// 登入表單元件
export default function LoginForm({ onLoginSuccess, onAppSettings }) {
  const [users, setUsers] = useState([]);
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showAppSettings, setShowAppSettings] = useState(false);
  const [adminPwd, setAdminPwd] = useState('');
  const [adminError, setAdminError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await dbUtils.users.getAll();
      if (!error && data) {
        setUsers(data);
      }
    }
    fetchUsers();
  }, []);

  const handleLogin = async (values) => {
    setError('');
    
    if (!account || !password) {
      setError('請輸入帳號和密碼');
      return;
    }

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      let loginEmail = account;
      
      if (!account.includes('@')) {
        const { data: userNamesData, error: userNamesError } = await supabase
          .from('user_names')
          .select('email')
          .eq('user', account)
          .single();
        
        if (userNamesError || !userNamesData) {
          setError('找不到此用戶名對應的帳號');
          return;
        }
        
        loginEmail = userNamesData.email;
      }

      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (signInError) {
        console.error('登入錯誤:', signInError);
        if (signInError.message.includes('Invalid login credentials')) {
          setError('帳號或密碼錯誤，請檢查後重試');
        } else {
          setError('登入失敗：' + signInError.message);
        }
        return;
      }

      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      console.error('登入異常:', err);
      setError('登入時發生錯誤：' + err.message);
    }
  };

  const handleTestConnection = async () => {
    const result = await testSupabaseConnection();
    if (result.success) {
      message.success('Supabase 連接正常');
    } else {
      message.error('Supabase 連接失敗: ' + result.error);
    }
  };

  const handleTestLogin = async () => {
    setAccount('test@example.com');
    setPassword('test123456');
    message.info('已填入測試帳號，請點擊登入按鈕');
  };

  const handleAppSettings = async (values) => {
    if (values.password === 'admin123') {
      setShowAppSettings(false);
      setAdminPwd('');
      setAdminError('');
      if (onAppSettings) onAppSettings();
    } else {
      setAdminError('密碼錯誤');
    }
  };

  return (
    <>
      <div className="animated-bg"></div>
      <div className="login-container">
        <div className="login-card-modern glass-effect">
          <Typography.Title className="login-title">
            季保養管理系統
          </Typography.Title>
          
          <Form layout="vertical" onFinish={handleLogin} size="large">
            <Form.Item 
              className="modern-form-item"
              label="用戶名或Email"
              required
            >
              <AutoComplete
                className="modern-autocomplete"
                value={account}
                onChange={v => setAccount(v)}
                options={users.filter(u => u.user && !u.user.includes('@')).map(u => ({ value: u.user }))}
                placeholder="請輸入Email或選擇用戶名"
                dropdownClassName="modern-dropdown"
                size="large"
                allowClear={false}
                filterOption={(inputValue, option) =>
                  (option?.value ?? '').toLowerCase().includes(inputValue.toLowerCase())
                }
              />
            </Form.Item>
            
            <Form.Item 
              className="modern-form-item"
              label="密碼"
              required
            >
              <Input.Password 
                className="modern-password"
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                autoComplete="current-password"
                placeholder="請輸入密碼"
                size="large"
              />
            </Form.Item>
            
            <div className="login-buttons">
              <Button 
                className="login-btn-primary"
                type="primary" 
                htmlType="submit" 
                block 
                disabled={!account || !password}
                size="large"
              >
                登入
              </Button>
              <Button 
                className="login-btn-secondary"
                block 
                onClick={() => navigate(ROUTES.REGISTER)}
                size="large"
              >
                註冊新帳號
              </Button>
              
              <div className="test-buttons">
                <Button 
                  className="test-btn"
                  size="small"
                  onClick={handleTestConnection}
                >
                  測試連接
                </Button>
                <Button 
                  className="test-btn"
                  size="small"
                  onClick={handleTestLogin}
                >
                  測試帳號
                </Button>
              </div>
            </div>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </Form>

          <Modal
            open={showAppSettings}
            title="輸入設定人員密碼"
            onCancel={() => setShowAppSettings(false)}
            footer={null}
            centered
          >
            <Form onFinish={handleAppSettings} layout="vertical">
              <Form.Item 
                label="密碼" 
                validateStatus={adminError ? 'error' : ''} 
                help={adminError}
              >
                <Input.Password 
                  value={adminPwd} 
                  onChange={e => setAdminPwd(e.target.value)} 
                />
              </Form.Item>
              <Button type="primary" htmlType="submit" block>確認</Button>
            </Form>
          </Modal>
        </div>
      </div>
    </>
  );
}