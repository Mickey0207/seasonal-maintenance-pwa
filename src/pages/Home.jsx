
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Button, message } from 'antd';
import { UserOutlined, SettingOutlined } from '@ant-design/icons';
import PageLayout from '../components/layout/PageLayout';
import ProjectCard from '../components/forms/ProjectCard';
import AddProjectCard from '../components/forms/AddProjectCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { useProjects } from '../hooks/useProject';
import { APP_CONFIG, ROUTES } from '../config/constants';

// 主畫面


export default function Home() {
  const navigate = useNavigate();
  const { userName } = useAuth();
  const { projects, loading } = useProjects();




  // 卡片點擊
  const handleCardClick = (project) => {
    console.log('點擊卡片', project);
    if (project && project.id) {
      navigate(`/project/${project.id}`);
    } else {
      message.error('專案資料異常，無法跳轉');
    }
  };

  // 新增卡片點擊
  const handleAddCard = () => {
    navigate('/project/new');
  };

  // 側邊欄選單事件
  const onAppSettings = () => message.info('尚未實作應用程式設定');
  const onUserClick = () => message.info('尚未實作用戶頁面');

  if (loading) return <LoadingSpinner />;

  const customSideMenu = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="sidebar-title">
        {APP_CONFIG.HOME_SIDEBAR_TITLE}
      </div>
      <Button 
        className="sidebar-menu-item" 
        type="text" 
        icon={<SettingOutlined />} 
        onClick={onAppSettings}
      >
        應用程式設定
      </Button>
      <div style={{ flex: 1 }} />
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Button 
          className="sidebar-menu-item" 
          type="text" 
          icon={<UserOutlined />} 
          onClick={onUserClick}
        >
          {userName || '用戶'}
        </Button>
      </div>
    </div>
  );

  return (
    <PageLayout
      userName={userName}
      projectName={APP_CONFIG.HOME_TOPBAR_TITLE}
      customSideMenu={customSideMenu}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <Row gutter={[24, 24]}>
          {/* 新增卡片 */}
          <Col xs={24} sm={12} md={8} lg={6} key="add">
            <AddProjectCard onClick={handleAddCard} />
          </Col>
          {/* 專案卡片 */}
          {projects.map(project => (
            <Col xs={24} sm={12} md={8} lg={6} key={project.id}>
              <ProjectCard 
                project={project} 
                onClick={handleCardClick} 
              />
            </Col>
          ))}
        </Row>
      </div>
    </PageLayout>
  );
}
