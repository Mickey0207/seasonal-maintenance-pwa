import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, message, AutoComplete } from 'antd';
import { supabase } from '../lib/supabaseClient';
import { dbUtils } from '../utils/database';
import { ROUTES } from '../config/constants';

export default function ModernLoginForm({ onLoginSuccess }) {
  const [users, setUsers] = useState([]);
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    
    if (!account || !password) {
      setError('請輸入帳號和密碼');
      setLoading(false);
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
          setError('找不到此用戶名');
          setLoading(false);
          return;
        }
        
        loginEmail = userNamesData.email;
      }
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password,
      });

      if (signInError) {
        setError('登入失敗：' + signInError.message);
        setLoading(false);
        return;
      }

      message.success('登入成功！');
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError('登入異常：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const userOptions = users
    .filter(u => u.user && !u.user.includes('@'))
    .map(u => ({ value: u.user }));

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
          <div className="animate-fadeInUp" style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div className="neon-glow animate-rotateIn" style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--primary-gradient)',
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 'bold',
              color: 'white'
            }}>
              🔧
            </div>
            <Typography.Title level={2} className="gradient-text" style={{ 
              marginBottom: '8px',
              fontSize: '2rem',
              fontWeight: 700
            }}>
              季保養管理系統
            </Typography.Title>
          </div>
          
          <Form 
            layout="vertical" 
            onFinish={handleLogin} 
            className="animate-fadeInUp"
            style={{
              animationDelay: '0.3s',
              animationFillMode: 'both'
            }}
          >
            <Form.Item 
              label={<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>👤 帳號</span>}
              required
            >
              <AutoComplete
                className="interactive-hover"
                value={account}
                onChange={setAccount}
                options={userOptions}
                placeholder="請輸入Email或選擇用戶名"
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  fontSize: '16px'
                }}
                filterOption={(inputValue, option) =>
                  (option?.value ?? '').toLowerCase().includes(inputValue.toLowerCase())
                }
              />
            </Form.Item>
            
            <Form.Item 
              label={<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>🔒 密碼</span>}
              required
            >
              <Input.Password 
                className="interactive-hover"
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="請輸入密碼"
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  fontSize: '16px'
                }}
                onPressEnter={handleLogin}
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
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Button 
                type="primary" 
                onClick={handleLogin}
                loading={loading}
                block 
                disabled={!account || !password}
                className="interactive-click neon-glow"
                style={{
                  height: '52px',
                  fontSize: '18px',
                  fontWeight: 600,
                  borderRadius: '12px',
                  background: 'var(--primary-gradient)',
                  border: 'none',
                  boxShadow: 'var(--shadow-glow)',
                  transition: 'var(--transition-bounce)'
                }}
              >
                立即登入
              </Button>
              <Button 
                block 
                onClick={() => navigate(ROUTES.REGISTER)}
                className="interactive-hover"
                style={{
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: 500,
                  borderRadius: '12px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              >
                註冊新帳號
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
}