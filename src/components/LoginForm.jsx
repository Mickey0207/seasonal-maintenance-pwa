import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Modal, Typography, Dropdown, Space, message, AutoComplete } from 'antd';
import { SettingOutlined, MoreOutlined } from '@ant-design/icons';
// import ThemeSwitchBtn from './ThemeSwitchBtn';

// 登入表單元件
export default function LoginForm({ onLoginSuccess, onAppSettings }) {
  const [showSetUsername, setShowSetUsername] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingUid, setPendingUid] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [setUsernameError, setSetUsernameError] = useState('');
  const [showRegisterSuccess, setShowRegisterSuccess] = useState(false);
  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase.from('user_names').select('user, email');
      if (!error && data) setUsers(data);
    }
    fetchUsers();
  }, []);
  // 從 Supabase 取得 user_names
  const [users, setUsers] = useState([]);
  const [account, setAccount] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showAppSettings, setShowAppSettings] = useState(false);
  const [adminPwd, setAdminPwd] = useState('');
  const [adminError, setAdminError] = useState('');

  async function handleLogin() {
    setError('');
    if (!account || !password) {
      setError('請輸入用戶名或Email並輸入密碼');
      return;
    }
    let loginEmail = '';
    let loginUsername = '';
    // 判斷是 email 還是用戶名
    if (account.includes('@')) {
      loginEmail = account;
    } else {
      const found = users.find(u => u.user === account);
      if (!found) {
        setError('找不到該用戶名，請直接輸入Email登入');
        return;
      }
      loginEmail = found.email;
      loginUsername = found.user;
    }
    // Supabase Auth 登入
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });
    if (loginError) {
      setError('登入失敗：' + loginError.message);
      return;
    }
    // 登入後如果 user_names 沒有該 email，彈窗要求設定用戶名
    const { data: userNamesData, error: userNamesError } = await supabase.from('user_names').select('user').eq('email', loginEmail);
    if (!userNamesError && userNamesData && userNamesData.length === 0) {
      setPendingEmail(loginEmail);
      setShowSetUsername(true);
      return;
    }
    setError('');
    if (onLoginSuccess) onLoginSuccess();
  }

  const handleAppSettings = () => {
    if (adminPwd === 'admin1234') {
      setAdminError('');
      setShowAppSettings(false);
      if (onAppSettings) onAppSettings();
    } else {
      setAdminError('密碼錯誤');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
      }}
    >
      <div
        className="login-card"
        style={{
          width: '100%',
          maxWidth: 400,
          minWidth: 0,
          padding: 'min(8vw,64px) 4vw min(4vw,32px) 4vw',
          background: 'var(--login-card-bg, #fff)',
          borderRadius: 16,
          boxShadow: '0 4px 24px 0 #e3e3e3',
          boxSizing: 'border-box',
        }}
      >
      <Modal
        open={showSetUsername}
        title="請設定用戶名"
        onCancel={() => { setShowSetUsername(false); setNewUsername(''); }}
        footer={null}
        centered
      >
        <Form
          layout="vertical"
          onFinish={async () => {
            setSetUsernameError('');
            if (!newUsername.trim()) {
              setSetUsernameError('請輸入用戶名');
              return;
            }
            const { data: existUser, error: existUserError } = await supabase.from('user_names').select('user').eq('user', newUsername.trim());
            if (!existUserError && existUser && existUser.length > 0) {
              setSetUsernameError('用戶名已被使用');
              return;
            }
            const { error: insertError } = await supabase.from('user_names').insert([{ user: newUsername.trim(), email: pendingEmail }]);
            if (insertError) {
              setSetUsernameError('寫入 user_names 失敗：' + insertError.message);
              return;
            }
            setShowSetUsername(false);
            setShowRegisterSuccess(true);
            setNewUsername('');
            const { data, error } = await supabase.from('user_names').select('user');
            if (!error && data) setUsers(data);
          }}
        >
          <Form.Item validateStatus={setUsernameError ? 'error' : ''} help={setUsernameError}>
            <Input
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              placeholder="請輸入用戶名"
              autoFocus
            />
          </Form.Item>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Button type="primary" htmlType="submit" block>儲存</Button>
            <Button onClick={() => { setShowSetUsername(false); setNewUsername(''); }} block>下次再設定</Button>
          </Space>
        </Form>
      </Modal>
      <Modal
        open={showRegisterSuccess}
        title="註冊成功"
        onCancel={() => setShowRegisterSuccess(false)}
        footer={[
          <Button type="primary" key="ok" onClick={() => setShowRegisterSuccess(false)} block>確定</Button>
        ]}
        centered
      >
        <div>下次可直接使用用戶名登入</div>
      </Modal>
      <Typography.Title level={2} style={{ textAlign: 'center', marginBottom: 40, color: '#1976d2', fontWeight: 800, letterSpacing: 2, fontSize: 32 }}>登入</Typography.Title>
      <Form layout="vertical" onFinish={handleLogin} size="large" style={{ gap: 0 }}>
        <Form.Item label={<span style={{ fontWeight: 600, fontSize: 18 }}>用戶名</span>} required style={{ marginBottom: 24 }}>
          <AutoComplete
            value={account}
            onChange={v => setAccount(v)}
            options={users.filter(u => u.user && !u.user.includes('@')).map(u => ({ value: u.user }))}
            placeholder="請輸入Email或選擇用戶名"
            style={{ width: '100%', fontSize: 18, borderRadius: 12, minHeight: 48, background: 'var(--bg-input, #232b39)', border: 'none', boxShadow: 'none', outline: 'none' }}
            dropdownStyle={{ fontSize: 18, minWidth: 180, background: '#232b39', color: '#fff', borderRadius: 12, boxShadow: '0 4px 32px 0 #10162499', border: '1.5px solid #353a4a' }}
            popupClassName="login-autocomplete-dropdown"
            size="large"
            allowClear={false}
            filterOption={(inputValue, option) =>
              (option?.value ?? '').toLowerCase().includes(inputValue.toLowerCase())
            }
          />
        </Form.Item>
        <input type="hidden" value={email} readOnly />
        <Form.Item label={<span style={{ fontWeight: 600, fontSize: 18 }}>密碼</span>} required style={{ marginBottom: 24 }}>
          <Input.Password value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" style={{ height: 48, fontSize: 18, borderRadius: 8 }} />
        </Form.Item>
        <Form.Item style={{ marginBottom: 16 }}>
          <Button type="primary" htmlType="submit" block disabled={!account || !password} style={{ height: 48, fontSize: 18, borderRadius: 8, fontWeight: 700, marginBottom: 8 }}>登入</Button>
          <Button type="default" block onClick={() => navigate('/register')} style={{ height: 44, fontSize: 16, borderRadius: 8, fontWeight: 600 }}>註冊新帳號</Button>
        </Form.Item>
        {error && <Typography.Text type="danger" style={{ fontWeight: 600, fontSize: 16 }}>{error}</Typography.Text>}
      </Form>
      <Modal
        open={showAppSettings}
        title="輸入設定人員密碼"
        onCancel={() => setShowAppSettings(false)}
        footer={null}
        centered
      >
        <Form onFinish={handleAppSettings} layout="vertical">
          <Form.Item label="密碼" validateStatus={adminError ? 'error' : ''} help={adminError}>
            <Input.Password value={adminPwd} onChange={e => setAdminPwd(e.target.value)} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>確認</Button>
        </Form>
      </Modal>
      </div>
    </div>
  );
}
