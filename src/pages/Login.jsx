import React from 'react';
import ThemeSwitchBtn from '../components/ThemeSwitchBtn';
import LoginForm from '../components/LoginForm';

// 登入頁
export default function Login() {
  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: 'var(--login-bg, #e3eafc)',
      width: '100vw',
      overflow: 'hidden',
    }}>
      <ThemeSwitchBtn style={{ right: 24, top: 24, position: 'absolute' }} />
      <LoginForm />
    </div>
  );
}
