import React from 'react';
import { Layout, Button, Dropdown, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, MenuOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config/constants';
import { authUtils } from '../../utils/auth';

const UnifiedTopBar = ({ 
  userName, 
  projectName, 
  projectId, 
  customSideMenu, 
  noShadow = false,
  isMobile = false 
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authUtils.logout();
    navigate(ROUTES.LOGIN);
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '個人資料',
      onClick: () => {
        // 可以添加個人資料頁面
      }
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '設定',
      onClick: () => {
        if (projectId) {
          navigate(`${ROUTES.PROJECT_MAINTAIN_SETTING}/${projectId}`);
        }
      }
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '登出',
      onClick: handleLogout,
      danger: true
    }
  ];

  return (
    <Layout.Header 
      className={`unified-topbar ${noShadow ? 'no-shadow' : ''}`}
    >
      <div className="topbar-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        padding: isMobile ? '0 16px' : '0 24px',
        position: 'relative'
      }}>
        {/* 左側：選單按鈕 */}
        <div className="topbar-left" style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '8px' : '16px',
          minWidth: isMobile ? '60px' : '120px'
        }}>
          {/* 選單按鈕 */}
          {customSideMenu && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => {
                // 觸發側邊選單
                if (customSideMenu.onToggle) {
                  customSideMenu.onToggle();
                }
              }}
              className="menu-trigger-btn interactive-click"
              style={{
                color: 'var(--text-primary)',
                fontSize: '18px',
                width: isMobile ? '40px' : '44px',
                height: isMobile ? '40px' : '44px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                transition: 'var(--transition-smooth)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />
          )}
        </div>

        {/* 中央：標題 */}
        <div className="topbar-center" style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h1 
            className="unified-topbar-title gradient-text animate-fadeInDown"
            style={{
              margin: 0,
              fontSize: isMobile ? '18px' : '24px',
              fontWeight: 700,
              background: 'var(--primary-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)',
              textAlign: 'center'
            }}
            onClick={() => navigate(ROUTES.HOME)}
          >
            {projectName || '季保養管理系統'}
          </h1>
          
          {/* 副標題 */}
          {projectName && !isMobile && (
            <div style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              marginTop: '2px',
              fontWeight: 500,
              textAlign: 'center'
            }}>
              🏢 專案管理平台
            </div>
          )}
        </div>

        {/* 右側：用戶區域 */}
        <div className="topbar-right" style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '8px' : '12px',
          minWidth: isMobile ? '60px' : '120px',
          justifyContent: 'flex-end'
        }}>
          {/* 用戶信息 */}
          {userName && !isMobile && (
            <div className="user-info animate-slideInRight" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              background: 'transparent',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              transition: 'var(--transition-smooth)'
            }}>
              <span style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '14px',
                fontWeight: 500
              }}>
                👋
              </span>
              <span style={{ 
                color: 'var(--text-primary)', 
                fontSize: '14px',
                fontWeight: 600,
                maxWidth: '80px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {userName}
              </span>
            </div>
          )}

          {/* 用戶選單 */}
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={['click']}
            overlayClassName="unified-dropdown"
          >
            <Button
              type="text"
              className="user-menu-trigger interactive-click neon-glow"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                height: isMobile ? '40px' : '44px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                transition: 'var(--transition-bounce)',
                width: isMobile ? '40px' : 'auto'
              }}
            >
              <Avatar 
                size={isMobile ? 24 : 28}
                icon={<UserOutlined />}
                style={{
                  background: 'var(--primary-gradient)',
                  border: '2px solid var(--border-accent)'
                }}
              />
              {!isMobile && (
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: 600,
                  maxWidth: '80px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {userName || '用戶'}
                </span>
              )}
            </Button>
          </Dropdown>
        </div>
      </div>
    </Layout.Header>
  );
};

export default UnifiedTopBar;