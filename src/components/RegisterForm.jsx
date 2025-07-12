import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function RegisterForm({ onRegisterSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password || !confirmPassword) {
      setError('所有欄位皆必填');
      return;
    }
    if (password !== confirmPassword) {
      setError('密碼與確認密碼不一致');
      return;
    }
    setLoading(true);
    // 1. 註冊 Supabase Auth
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    setError('註冊成功，請至信箱完成驗證後再登入！');
    if (onRegisterSuccess) onRegisterSuccess();
  };

  return (
    <form onSubmit={handleRegister} style={{ maxWidth: 400, margin: '0 auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>註冊新帳號</h2>
      {/* 用戶名欄位已移除 */}
      <div style={{ marginBottom: 16 }}>
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #bdbdbd' }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>密碼</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #bdbdbd' }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>確認密碼</label>
        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #bdbdbd' }} />
      </div>
      {/* ...existing code... */}
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600 }}>
        {loading ? '註冊中...' : '註冊'}
      </button>
    </form>
  );
}
