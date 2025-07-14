import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './ui/LoadingSpinner';
import { ROUTES } from '../config/constants';

// 受保護的路由組件
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // 如果還在載入中，顯示載入畫面
  if (loading) {
    return <LoadingSpinner />;
  }

  // 如果未登入，重導向到登入頁
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // 如果已登入，顯示子組件
  return children;
};

export default ProtectedRoute;