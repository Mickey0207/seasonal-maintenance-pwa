import React, { useState } from 'react';
import RegisterForm from '../components/RegisterForm';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e3eafc' }}>
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
