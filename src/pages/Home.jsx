
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Button, message, Typography } from 'antd';
import { UserOutlined, SettingOutlined } from '@ant-design/icons';
import PageLayout from '../components/layout/PageLayout';
import ProjectCard from '../components/forms/ProjectCard';
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
    if (project && project.id) {
      navigate(`/project/${project.id}`);
    } else {
      message.error('專案資料異常，無法跳轉');
    }
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
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        <div className="animate-fadeInUp" style={{ marginBottom: '32px' }}>
          <Typography.Title 
            level={2} 
            className="gradient-text"
            style={{ 
              textAlign: 'center',
              marginBottom: '8px',
              fontSize: '2.5rem',
              fontWeight: 700
            }}
          >
            季保養管理系統
          </Typography.Title>
        </div>
        
        <Row gutter={[24, 24]}>
          {/* 專案卡片 */}
          {projects.map((project, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={project.id}>
              <div 
                className="animate-scaleIn interactive-hover"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'both'
                }}
              >
                <ProjectCard 
                  project={project} 
                  onClick={handleCardClick} 
                />
              </div>
            </Col>
          ))}
        </Row>
        
        {projects.length === 0 && (
          <div className="animate-fadeInUp" style={{ 
            textAlign: 'center', 
            padding: '80px 20px',
            color: 'var(--text-muted)'
          }}>
            <Typography.Title level={3} style={{ color: 'var(--text-muted)' }}>
              暫無專案資料
            </Typography.Title>
            <Typography.Text>
              請聯繫管理員新增專案
            </Typography.Text>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
