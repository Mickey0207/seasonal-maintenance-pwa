
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Button, message, Typography, Modal, Input } from 'antd';
import { UserOutlined, SettingOutlined, PlusOutlined, LockOutlined } from '@ant-design/icons';
import PageLayout from '../components/layout/PageLayout';
import ProjectCard from '../components/forms/ProjectCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CreateProjectModal from '../components/ui/CreateProjectModal';
import { useAuth } from '../hooks/useAuth';
import { useProjects } from '../hooks/useProject';
import { APP_CONFIG, ROUTES } from '../config/constants';

// 主畫面

export default function Home() {
  const navigate = useNavigate();
  const { userName } = useAuth();
  const { projects, loading } = useProjects();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [pendingProject, setPendingProject] = useState(null);

  // 卡片點擊
  const handleCardClick = (project) => {
    if (project && project.id) {
      // 檢查是否為專案1，需要密碼保護
      if (project.id === 1) {
        setPendingProject(project);
        setPasswordModalVisible(true);
        setPassword('');
      } else {
        navigate(`/project/${project.id}`);
      }
    } else {
      message.error('專案資料異常，無法跳轉');
    }
  };

  // 密碼驗證
  const handlePasswordSubmit = () => {
    const correctPassword = 'ACLacl@';
    
    if (password === correctPassword) {
      setPasswordModalVisible(false);
      setPassword('');
      navigate(`/project/${pendingProject.id}`);
      setPendingProject(null);
      message.success('密碼正確，正在進入專案...');
    } else {
      message.error('密碼錯誤，請重新輸入');
      setPassword('');
    }
  };

  // 取消密碼輸入
  const handlePasswordCancel = () => {
    setPasswordModalVisible(false);
    setPassword('');
    setPendingProject(null);
  };

  // 側邊欄選單事件
  const onAppSettings = () => message.info('尚未實作應用程式設定');
  const onUserClick = () => message.info('尚未實作用戶頁面');
  const handleCreateProject = () => setCreateModalVisible(true);
  
  const handleCreateSuccess = (newProject) => {
    setCreateModalVisible(false);
    window.location.reload();
  };


  if (loading) return <LoadingSpinner />;

  const customSideMenu = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="sidebar-title">
        {APP_CONFIG.HOME_SIDEBAR_TITLE}
      </div>
      <Button 
        className="sidebar-menu-item" 
        type="text" 
        icon={<PlusOutlined />} 
        onClick={handleCreateProject}
        style={{
          background: 'var(--primary-gradient)',
          color: 'white',
          borderRadius: '8px',
          margin: '4px 0',
          fontWeight: 600,
          boxShadow: 'var(--shadow-primary)',
          border: '1px solid var(--border-primary)',
          transition: 'var(--transition-smooth)'
        }}
      >
        新增案場
      </Button>
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
      
      <CreateProjectModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* 密碼輸入模態框 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LockOutlined style={{ color: 'var(--text-accent)' }} />
            <span>專案密碼驗證</span>
          </div>
        }
        open={passwordModalVisible}
        onOk={handlePasswordSubmit}
        onCancel={handlePasswordCancel}
        okText="確認"
        cancelText="取消"
        className="modern-modal"
        maskClosable={false}
        okButtonProps={{
          disabled: !password.trim(),
          style: {
            background: 'var(--primary-gradient)',
            border: 'none',
            borderRadius: '8px'
          }
        }}
        cancelButtonProps={{
          style: {
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-primary)',
            color: 'var(--text-primary)',
            borderRadius: '8px'
          }
        }}
      >
        <div style={{ padding: '20px 0' }}>
          <Typography.Text style={{ 
            color: 'var(--text-secondary)', 
            marginBottom: '16px',
            display: 'block'
          }}>
            此專案需要密碼才能訪問，請輸入正確的密碼：
          </Typography.Text>
          
          <Input.Password
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="請輸入專案密碼"
            size="large"
            prefix={<LockOutlined style={{ color: 'var(--text-muted)' }} />}
            onPressEnter={handlePasswordSubmit}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '8px',
              color: 'var(--text-primary)'
            }}
            autoFocus
          />
          
          <Typography.Text style={{ 
            color: 'var(--text-muted)', 
            fontSize: '12px',
            marginTop: '8px',
            display: 'block'
          }}>
            專案名稱：{pendingProject?.name}
          </Typography.Text>
        </div>
      </Modal>
    </PageLayout>
  );
}
