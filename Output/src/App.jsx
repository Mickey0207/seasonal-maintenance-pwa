import React from 'react';
import { App as AntdApp } from 'antd';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ROUTES } from './config/constants';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Home from './pages/Home';
import ProjectPage from './pages/ProjectPage';
import SeasonSetting from './pages/SeasonSetting';
import ProjectMaintainSetting from './pages/ProjectMaintainSetting';
import History from './pages/History';
import Register from './pages/Register';

// Components
import LoginForm from './components/LoginForm';

export default function App() {
  return (
    <ErrorBoundary>
      <AntdApp>
        <BrowserRouter>
          <Routes>
            <Route path={ROUTES.LOGIN} element={<LoginWrapper />} />
            <Route path={ROUTES.REGISTER} element={<Register />} />
            <Route path={ROUTES.HOME} element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path={ROUTES.PROJECT} element={
              <ProtectedRoute>
                <ProjectPage />
              </ProtectedRoute>
            } />
            <Route path={ROUTES.PROJECT_SEASON_SETTING} element={
              <ProtectedRoute>
                <SeasonSetting />
              </ProtectedRoute>
            } />
            <Route path={ROUTES.PROJECT_HISTORY} element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } />
            <Route path={ROUTES.PROJECT_MAINTAIN_SETTING} element={
              <ProtectedRoute>
                <ProjectMaintainSetting />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
          </Routes>
        </BrowserRouter>
      </AntdApp>
    </ErrorBoundary>
  );
}

// 包裝 LoginForm 以支援登入後導向
function LoginWrapper() {
  const navigate = useNavigate();
  return <LoginForm onLoginSuccess={() => navigate(ROUTES.HOME)} onAppSettings={() => navigate('/app-settings')} />;
}