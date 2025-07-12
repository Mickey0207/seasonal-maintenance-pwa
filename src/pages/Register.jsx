import React, { useState } from 'react';
import RegisterForm from '../components/RegisterForm';
import ThemeSwitchBtn from '../components/ThemeSwitchBtn';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: 'var(--register-bg, #e3eafc)',
      width: '100vw',
      overflow: 'hidden',
    }}>
      <ThemeSwitchBtn style={{ right: 24, top: 24 }} />
      {success ? (
        <div style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <h2>註冊成功！</h2>
          <button onClick={() => navigate('/login')} style={{ marginTop: 16, padding: 10, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16 }}>前往登入</button>
        </div>
      ) : (
        <RegisterForm onRegisterSuccess={() => setSuccess(true)} />
      )}
    </div>
  );
}
