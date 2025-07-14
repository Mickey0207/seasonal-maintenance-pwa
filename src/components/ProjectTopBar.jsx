import React from 'react';
import { Layout, Button, Typography, Dropdown, Drawer } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined, HistoryOutlined, ToolOutlined, MenuOutlined, HomeOutlined, FormOutlined } from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/constants';
import { authUtils } from '../utils/auth';

function ProjectTopBar({
  projectName = '',
  userName = '',
  onUserClick = () => {},
  onHomeClick = () => {},
  customSideMenu = null,
  noShadow = false,
  id = ''
}) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 767 });

  // 用戶下拉選單
  const userMenuItems = [
    {
      key: 'profile',
      icon: <SettingOutlined />,
      label: '設定使用者資料',
      onClick: onUserClick,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '登出',
      className: 'logout-item',
      onClick: async () => { 
        await authUtils.logout(); 
        navigate(ROUTES.LOGIN); 
      },
    },
  ];

  // 側邊欄內容
  const sideMenu = customSideMenu ? customSideMenu : (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="sidebar-title">{projectName}</div>
      <Button 
        className="sidebar-menu-item" 
        type="text" 
        icon={<HomeOutlined />} 
        onClick={onHomeClick}
      >
        主畫面
      </Button>
      <div style={{ height: 16 }} />
      <Button 
        className="sidebar-menu-item" 
        type="text" 
        icon={<FormOutlined />} 
        onClick={() => navigate(`/project/${id}`)}
      >
        本次季保養表單
      </Button>
      <Button 
        className="sidebar-menu-item" 
        type="text" 
        icon={<HistoryOutlined />} 
        onClick={() => navigate(`/project/${id}/history`)}
      >
        本次季保養歷史
      </Button>
      <div style={{ height: 16 }} />
      <Button 
        className="sidebar-menu-item" 
        type="text" 
        icon={<SettingOutlined />} 
        onClick={() => navigate(`/project/${id}/season-setting`)}
      >
        本次季保養設定
      </Button>
      <Button 
        className="sidebar-menu-item" 
        type="text" 
        icon={<ToolOutlined />} 
        onClick={() => navigate(`/project/${id}/maintain-setting`)}
      >
        保養資訊設定
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
    <>
      <Layout.Header className="modern-topbar">
        <div className="topbar-left">
          <Button 
            className="menu-trigger-btn" 
            type="text" 
            icon={<MenuOutlined />} 
            onClick={() => setDrawerOpen(true)} 
          />
        </div>
        
        <Typography.Title className="topbar-title" level={4}>
          {projectName}
        </Typography.Title>
        
        <div className="topbar-right">
          <Dropdown 
            menu={{ items: userMenuItems }}
            trigger={["click"]} 
            placement="bottomRight"
            dropdownRender={(menu) => (
              <div className="user-dropdown">
                {menu}
              </div>
            )}
          >
            <Button className="user-menu-trigger" type="text" icon={<UserOutlined />}>
              {userName || '用戶'}
            </Button>
          </Dropdown>
        </div>
      </Layout.Header>
      
      <Drawer 
        className="modern-sidebar"
        placement="left" 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)}
        width={280}
      >
        {sideMenu}
      </Drawer>
    </>
  );
}

export default ProjectTopBar;