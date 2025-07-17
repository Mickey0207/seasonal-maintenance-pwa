import React from 'react';
import { Layout } from 'antd';
import { useMediaQuery } from 'react-responsive';
import UnifiedTopBar from './UnifiedTopBar';

const UnifiedPageLayout = ({ 
  children, 
  projectName, 
  userName, 
  projectId,
  customSideMenu,
  noShadow = false,
  showFab = false,
  fabIcon,
  onFabClick,
  className = ''
}) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  
  return (
    <>
      {/* 動態背景 */}
      <div className="animated-bg"></div>
      
      {/* 主要佈局 */}
      <Layout className={`page-enter ${className}`} style={{ 
        minHeight: '100vh', 
        background: 'transparent' 
      }}>
        {/* 統一頂部導航 */}
        <UnifiedTopBar
          userName={userName}
          projectName={projectName}
          projectId={projectId}
          customSideMenu={customSideMenu}
          noShadow={noShadow}
          isMobile={isMobile}
        />
        
        {/* 內容區域 */}
        <Layout.Content style={{ 
          padding: isMobile ? '16px' : '32px 24px',
          minHeight: isMobile ? 'calc(100vh - 60px)' : 'calc(100vh - 70px)',
          background: 'transparent',
          position: 'relative',
          zIndex: 1
        }}>
          <div className={`animate-fadeInUp ${isMobile ? 'mobile-container' : ''}`}>
            {children}
          </div>
        </Layout.Content>
      </Layout>
      
      {/* 浮動動作按鈕 */}
      {showFab && (
        <button 
          className="unified-fab"
          onClick={onFabClick}
          aria-label="浮動動作按鈕"
        >
          {fabIcon}
        </button>
      )}
    </>
  );
};

export default UnifiedPageLayout;