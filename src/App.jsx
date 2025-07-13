

import React from 'react';
import { ThemeProvider } from './lib/ThemeContext';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import ProjectPage from './pages/ProjectPage';
import SeasonSetting from './pages/SeasonSetting';


import Register from './pages/Register';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginWrapper />} />
          <Route path="/home" element={<Home />} />
          <Route path="/project/:id" element={<ProjectPage />} />
          <Route path="/season-setting" element={<SeasonSetting />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

// 包裝 LoginForm 以支援登入後導向
import LoginForm from './components/LoginForm';
function LoginWrapper() {
  const navigate = useNavigate();
  return <LoginForm onLoginSuccess={() => navigate('/home')} onAppSettings={() => navigate('/app-settings')} />;
}
