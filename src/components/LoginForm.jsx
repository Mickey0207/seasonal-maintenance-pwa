
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

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
    <div>
      {/* 設定用戶名彈窗 */}
      {showSetUsername && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 300 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 8, maxWidth: 340, margin: '120px auto', position: 'relative', textAlign: 'center' }}>
            <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 12 }}>請設定用戶名</h3>
            <input
              type="text"
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              placeholder="請輸入用戶名"
              style={{ width: '100%', padding: 10, fontSize: 16, borderRadius: 6, border: '1px solid #bdbdbd', marginBottom: 12 }}
              autoFocus
            />
            {setUsernameError && <div style={{ color: 'red', marginBottom: 8 }}>{setUsernameError}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                style={{ flex: 1, padding: 10, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontSize: 16, cursor: 'pointer', fontWeight: 600 }}
                onClick={async () => {
                  setSetUsernameError('');
                  if (!newUsername.trim()) {
                    setSetUsernameError('請輸入用戶名');
                    return;
                  }
                  // 檢查 user_names 是否已存在同名用戶名
                  const { data: existUser, error: existUserError } = await supabase.from('user_names').select('user').eq('user', newUsername.trim());
                  if (!existUserError && existUser && existUser.length > 0) {
                    setSetUsernameError('用戶名已被使用');
                    return;
                  }
                  // 新增 user_names
                  const { error: insertError } = await supabase.from('user_names').insert([{ user: newUsername.trim(), email: pendingEmail }]);
                  if (insertError) {
                    setSetUsernameError('寫入 user_names 失敗：' + insertError.message);
                    return;
                  }
                  setShowSetUsername(false);
                  setShowRegisterSuccess(true);
                  setNewUsername('');
                  // 重新載入 users 下拉選單
                  const { data, error } = await supabase.from('user_names').select('user');
                  if (!error && data) setUsers(data);
                }}
              >儲存</button>
              <button
                style={{ flex: 1, padding: 10, background: '#eee', color: '#1976d2', border: 'none', borderRadius: 6, fontSize: 16, cursor: 'pointer', fontWeight: 600 }}
                onClick={() => {
                  setShowSetUsername(false);
                  setNewUsername('');
                }}
              >下次再設定</button>
            </div>
          </div>
        </div>
      )}
      {/* 註冊成功提示彈窗 */}
      {showRegisterSuccess && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 200 }} onClick={() => setShowRegisterSuccess(false)}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 8, maxWidth: 320, margin: '120px auto', position: 'relative', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 12 }}>註冊成功</h3>
            <div style={{ fontSize: 16, marginBottom: 16 }}>下次可直接使用用戶名登入</div>
            <button onClick={() => setShowRegisterSuccess(false)} style={{ width: '100%', padding: 10, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontSize: 16, cursor: 'pointer', fontWeight: 600 }}>確定</button>
          </div>
        </div>
      )}
      <div style={{ position: 'relative' }}>
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
        <label htmlFor="account" style={{ fontWeight: 600, fontSize: 16 }}>用戶名</label>
        <input
          id="account"
          list="user-list"
          value={account}
          onChange={e => setAccount(e.target.value)}
          placeholder="請輸入用戶名或選擇用戶名"
          style={{ width: '100%', padding: 10, marginTop: 6, fontSize: 16, borderRadius: 6, border: '1px solid #bdbdbd' }}
          autoComplete="username"
        />
        <datalist id="user-list">
          {users.map(u => (
            u.user && !u.user.includes('@') ? <option key={u.user} value={u.user} /> : null
          ))}
        </datalist>
      </div>
      {/* 隱藏 email 欄位 */}
      <input type="hidden" value={email} readOnly />
      <div style={{ margin: '20px 0' }}>
        <label htmlFor="password" style={{ fontWeight: 600, fontSize: 16 }}>密碼</label>
        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 6, fontSize: 16, borderRadius: 6, border: '1px solid #bdbdbd' }} />
      </div>
      <button onClick={handleLogin} style={{ width: '100%', padding: 'clamp(12px, 4vw, 18px)', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, fontSize: 'clamp(1rem, 4vw, 1.2rem)', cursor: 'pointer', fontWeight: 600, marginTop: 12, marginBottom: 8, transition: 'background 0.2s' }} disabled={!account || !password}>
        登入
      </button>
      <button type="button" onClick={() => navigate('/register')} style={{ width: '100%', padding: 10, background: '#eee', color: '#1976d2', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, marginTop: 8 }}>
        註冊新帳號
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
  );
}
