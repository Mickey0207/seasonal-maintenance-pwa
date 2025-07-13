

import React from 'react';
import { App as AntdApp } from 'antd';
// import { ThemeProvider } from './lib/ThemeContext';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import ProjectPage from './pages/ProjectPage';

import SeasonSetting from './pages/SeasonSetting';


import ProjectMaintainSetting from './pages/ProjectMaintainSetting';

import History from './pages/History';


import Register from './pages/Register';

export default function App() {
  return (
    <AntdApp>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginWrapper />} />
          <Route path="/home" element={<Home />} />
          <Route path="/project/:id" element={<ProjectPage />} />
          <Route path="/project/:id/season-setting" element={<SeasonSetting />} />
          <Route path="/project/:id/history" element={<History />} />
          <Route path="/register" element={<Register />} />
          <Route path="/project/:id/maintain-setting" element={<ProjectMaintainSetting />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AntdApp>
  );
}

// 包裝 LoginForm 以支援登入後導向
import LoginForm from './components/LoginForm';
function LoginWrapper() {
  const navigate = useNavigate();
  return <LoginForm onLoginSuccess={() => navigate('/home')} onAppSettings={() => navigate('/app-settings')} />;
}
