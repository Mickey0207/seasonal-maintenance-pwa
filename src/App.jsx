

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Setup from './pages/Setup';
import Form from './pages/Form';
import History from './pages/History';
import AppSettingsPage from './pages/AppSettings';
import UserSettingsPage from './pages/UserSettings';

import Register from './pages/Register';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginWrapper />} />
        <Route path="/home" element={<Home />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/form" element={<Form />} />
        <Route path="/history" element={<History />} />
        <Route path="/app-settings" element={<AppSettingsPage />} />
        <Route path="/user-settings" element={<UserSettingsPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// 包裝 LoginForm 以支援登入後導向
import LoginForm from './components/LoginForm';
function LoginWrapper() {
  const navigate = useNavigate();
  return <LoginForm onLoginSuccess={() => navigate('/home')} onAppSettings={() => navigate('/app-settings')} />;
}
