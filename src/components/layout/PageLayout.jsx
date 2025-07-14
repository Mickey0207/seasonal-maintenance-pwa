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
      <Layout style={{ minHeight: '100vh', background }}>
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
          background: 'transparent'
        }}>
          {children}
        </Layout.Content>
      </Layout>
    </>
  );
};

export default PageLayout;