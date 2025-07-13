import React from 'react';
import { Layout, Button, Typography, Dropdown, Menu, Drawer } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined, HistoryOutlined, ToolOutlined, MenuOutlined, HomeOutlined, FormOutlined } from '@ant-design/icons';
// import { useTheme } from '../lib/ThemeContext';
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router-dom';

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

  // 頂端選單內容
  const menu = (
    <div className="project-top-bar__user-menu">
      <Button
        key="profile"
        icon={<SettingOutlined />}
        className="project-top-bar__user-menu-btn profile"
        type="text"
        onClick={onUserClick}
        style={{ textAlign: 'left', width: '100%' }}
      >
        設定使用者資料
      </Button>
      <Button
        key="logout"
        icon={<LogoutOutlined />}
        className="project-top-bar__user-menu-btn logout"
        type="text"
        onClick={() => { localStorage.clear(); navigate('/'); }}
        style={{ textAlign: 'left', width: '100%' }}
      >
        登出
      </Button>
    </div>
  );

  // 側邊欄內容可自訂
  const sideMenu = customSideMenu ? customSideMenu : (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ fontWeight: 800, fontSize: 22, color: '#1976d2', textAlign: 'center', margin: '32px 0 24px 0' }}>{projectName}</div>
      <Button className="sidebar-btn" type="text" icon={<HomeOutlined />} style={{ textAlign: 'left', fontSize: 18, marginBottom: 8 }} onClick={onHomeClick}>主畫面</Button>
      <div style={{ height: 8 }} />
      <hr style={{ margin: '8px 0' }} />
      <div style={{ height: 8 }} />
      <Button className="sidebar-btn" type="text" icon={<FormOutlined />} style={{ textAlign: 'left', fontSize: 18, marginBottom: 8 }} onClick={() => navigate(`/project/${id}`)}>本次季保養表單</Button>
      <Button className="sidebar-btn" type="text" icon={<HistoryOutlined />} style={{ textAlign: 'left', fontSize: 18, marginBottom: 8 }} onClick={() => navigate(`/project/${id}/history`)}>本次季保養歷史</Button>
      <div style={{ height: 8 }} />
      <hr style={{ margin: '8px 0' }} />
      <div style={{ height: 8 }} />
      <Button className="sidebar-btn" type="text" icon={<SettingOutlined />} style={{ textAlign: 'left', fontSize: 18, marginBottom: 8 }} onClick={() => navigate(`/project/${id}/season-setting`)}>本次季保養設定</Button>
      <Button className="sidebar-btn" type="text" icon={<ToolOutlined />} style={{ textAlign: 'left', fontSize: 18, marginBottom: 8 }} onClick={() => navigate(`/project/${id}/maintain-setting`)}>保養資訊設定</Button>
      <div style={{ flex: 1 }} />
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Button className="sidebar-btn" type="text" icon={<UserOutlined />} style={{ fontWeight: 700, fontSize: 18, color: '#1976d2' }} onClick={onUserClick}>{userName || '用戶'}</Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Layout.Header className="project-top-bar dark-theme" style={noShadow ? { boxShadow: 'none', borderBottom: 'none' } : {}}>
          <Button type="text" icon={<MenuOutlined />} style={{ fontSize: 24, marginRight: 8 }} onClick={() => setDrawerOpen(true)} />
          <Typography.Title level={4} style={{ margin: 0, flex: 1, textAlign: 'center', color: '#1976d2', fontWeight: 800, letterSpacing: 2 }}>{projectName}</Typography.Title>
          <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
            <Button type="text" icon={<UserOutlined />} className="topbar-menu-trigger">
              {userName || '用戶'}
            </Button>
          </Dropdown>
        </Layout.Header>
        <Drawer placement="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} className="sidebar" bodyStyle={{ padding: 0 }}>
          {sideMenu}
        </Drawer>
      </>
    );
  }

  // 桌機版
  return (
    <>
      <Layout.Header className="project-top-bar dark-theme" style={noShadow ? { boxShadow: 'none', borderBottom: 'none' } : {}}>
        {/* 左側：功能選單按鈕 */}
        <Button type="text" icon={<MenuOutlined />} style={{ fontSize: 24, marginRight: 16 }} onClick={() => setDrawerOpen(true)} />
        {/* 中間：專案名稱 */}
        <Typography.Title level={4} style={{ margin: 0, flex: 1, textAlign: 'center', color: '#1976d2', fontWeight: 800, letterSpacing: 2 }}>{projectName}</Typography.Title>
        {/* 右側：選單下拉 */}
        <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
          <Button type="text" icon={<UserOutlined />} className="topbar-menu-trigger">
            {userName || '用戶'}
          </Button>
        </Dropdown>
      </Layout.Header>
      <Drawer placement="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} className="sidebar" bodyStyle={{ padding: 0 }}>
        {sideMenu}
      </Drawer>
    </>
  );
}

export default ProjectTopBar;
