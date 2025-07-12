
import React, { useState } from 'react';

// 登入表單元件
export default function LoginForm({ onLoginSuccess, onAppSettings }) {
  // 假資料，實際應從資料庫取得
  const users = [
    { id: 1, account: 'user1' },
    { id: 2, account: 'user2' },
    { id: 3, account: 'admin' },
  ];
  const [account, setAccount] = useState(users[0].account);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showAppSettings, setShowAppSettings] = useState(false);
  const [adminPwd, setAdminPwd] = useState('');
  const [adminError, setAdminError] = useState('');

  // 假驗證，實際應串接後端
  const handleLogin = () => {
    if ((account === 'admin' && password === 'admin') || (account === 'user1' && password === '1234') || (account === 'user2' && password === '5678')) {
      setError('');
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setError('帳號或密碼輸入錯誤');
    }
  };

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
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #e3eafc 0%, #f5f5f5 100%)',
      padding: 0,
      margin: 0,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        margin: '0 auto',
        padding: 'clamp(24px, 6vw, 48px) clamp(12px, 5vw, 40px)',
        borderRadius: 16,
        background: '#fff',
        boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
        position: 'relative',
        border: '1px solid #e0e0e0',
      }}>
        {/* 右上三點選單 */}
        <div style={{ position: 'absolute', top: 16, right: 16 }}>
          <button aria-label="更多選單" style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }} onClick={() => setShowMenu(!showMenu)}>
            &#8942;
          </button>
          {showMenu && (
            <div style={{ position: 'absolute', right: 0, top: 32, background: '#fff', border: '1px solid #ccc', borderRadius: 4, zIndex: 10 }}>
              <button style={{ padding: '8px 16px', width: '100%', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => { setShowAppSettings(true); setShowMenu(false); }}>應用程式設定</button>
            </div>
          )}
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: 32, color: '#1976d2', fontSize: 'clamp(1.5rem, 6vw, 2.2rem)', fontWeight: 700, letterSpacing: 2 }}>登入</h2>
        <div style={{ margin: '20px 0' }}>
          <label htmlFor="account" style={{ fontWeight: 600, fontSize: 16 }}>使用者帳號</label>
          <select id="account" value={account} onChange={e => setAccount(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 6, fontSize: 16, borderRadius: 6, border: '1px solid #bdbdbd' }}>
            {users.map(u => (
              <option key={u.id} value={u.account}>{u.account}</option>
            ))}
          </select>
        </div>
        <div style={{ margin: '20px 0' }}>
          <label htmlFor="password" style={{ fontWeight: 600, fontSize: 16 }}>密碼</label>
          <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 6, fontSize: 16, borderRadius: 6, border: '1px solid #bdbdbd' }} />
        </div>
        <button onClick={handleLogin} style={{ width: '100%', padding: 'clamp(12px, 4vw, 18px)', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, fontSize: 'clamp(1rem, 4vw, 1.2rem)', cursor: 'pointer', fontWeight: 600, marginTop: 12, marginBottom: 8, transition: 'background 0.2s' }} disabled={!account || !password}>
          登入
        </button>
        {error && <div style={{ color: 'red', marginTop: 12, fontWeight: 600 }}>{error}</div>}

        {/* 應用程式設定密碼彈窗 */}
        {showAppSettings && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 100 }} onClick={() => setShowAppSettings(false)}>
            <div style={{ background: '#fff', padding: 24, borderRadius: 8, maxWidth: 320, margin: '120px auto', position: 'relative' }} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 12 }}>輸入設定人員密碼</h3>
              <input type="password" value={adminPwd} onChange={e => setAdminPwd(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 8, fontSize: 16, borderRadius: 6, border: '1px solid #bdbdbd' }} />
              <button onClick={handleAppSettings} style={{ width: '100%', marginTop: 16, padding: 10, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontSize: 16, cursor: 'pointer', fontWeight: 600 }}>確認</button>
              {adminError && <div style={{ color: 'red', marginTop: 8 }}>{adminError}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
