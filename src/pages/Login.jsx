import React from 'react';
import LoginForm from '../components/LoginForm';

// 登入頁
export default function Login() {
  return (
    <div className="card flex flex-center" style={{ minHeight: '60vh', maxWidth: 420, margin: '4rem auto', boxShadow: 'var(--color-shadow)', borderRadius: 'var(--radius)', background: 'var(--color-surface)' }}>
      <LoginForm />
    </div>
  );
}
