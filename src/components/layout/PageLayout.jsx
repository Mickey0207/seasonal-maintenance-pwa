import React from 'react';
import { Layout } from 'antd';
import ProjectTopBar from '../ProjectTopBar';

const PageLayout = ({ 
  children, 
  projectName, 
  userName, 
  projectId,
  customSideMenu,
  noShadow = false,
  background = 'var(--bg-primary)'
}) => {
  return (
    <>
      <div className="animated-bg"></div>
      <Layout className="page-enter" style={{ minHeight: '100vh', background }}>
        <ProjectTopBar
          userName={userName}
          projectName={projectName}
          id={projectId}
          customSideMenu={customSideMenu}
          noShadow={noShadow}
          onUserClick={() => {}}
          onHomeClick={() => {}}
        />
        <Layout.Content style={{ 
          padding: '32px 24px',
          minHeight: 'calc(100vh - 70px)',
          background: 'transparent',
          position: 'relative',
          zIndex: 1
        }}>
          <div className="animate-fadeInUp">
            {children}
          </div>
        </Layout.Content>
      </Layout>
    </>
  );
};

export default PageLayout;