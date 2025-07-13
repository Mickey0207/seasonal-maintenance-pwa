import React from 'react';
import { Layout, Button, Typography, Dropdown, Menu, Drawer } from 'antd';
import { UserOutlined, HistoryOutlined, SettingOutlined, ToolOutlined, MenuOutlined, BulbOutlined, MoonOutlined } from '@ant-design/icons';
import { useTheme } from '../lib/ThemeContext';
import { useMediaQuery } from 'react-responsive';

export default function ProjectTopBar({ userName, projectName, onUserClick, onHistory, onSeasonSetting, onInfoSetting, drawerOpen, setDrawerOpen }) {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const { theme, toggleTheme } = useTheme();

  // 側邊欄內容
  const sideMenu = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ fontWeight: 800, fontSize: 22, color: '#1976d2', textAlign: 'center', margin: '32px 0 24px 0' }}>{projectName}</div>
      <Button type="text" icon={<HistoryOutlined />} style={{ textAlign: 'left', width: '100%', fontSize: 18, marginBottom: 8 }} onClick={onHistory}>本次季保養歷史</Button>
      <Button type="text" icon={<SettingOutlined />} style={{ textAlign: 'left', width: '100%', fontSize: 18, marginBottom: 8 }} onClick={onSeasonSetting}>本次季保養設定</Button>
      <Button type="text" icon={<ToolOutlined />} style={{ textAlign: 'left', width: '100%', fontSize: 18, marginBottom: 8 }} onClick={onInfoSetting}>保養資訊設定</Button>
      <div style={{ flex: 1 }} />
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Button type="text" icon={<UserOutlined />} style={{ fontWeight: 700, fontSize: 18, color: '#1976d2' }} onClick={onUserClick}>{userName || '用戶'}</Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Layout.Header className={`project-top-bar${theme === 'dark' ? ' dark-theme' : ''}`.replace('project-top-bar dark-theme', 'project-top-bar dark-theme')}> 
          <Button type="text" icon={<MenuOutlined />} style={{ fontSize: 24, marginRight: 8 }} onClick={() => setDrawerOpen(true)} />
          <Typography.Title level={4} style={{ margin: 0, flex: 1, textAlign: 'center', color: '#1976d2', fontWeight: 800, letterSpacing: 2 }}>{projectName}</Typography.Title>
          <Button
            type="text"
            icon={theme === 'dark' ? <BulbOutlined /> : <MoonOutlined />}
            style={{ fontSize: 22, marginLeft: 4 }}
            onClick={toggleTheme}
            aria-label="切換主題"
          />
        </Layout.Header>
        <Drawer placement="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={260} bodyStyle={{ padding: 0 }}>
          {sideMenu}
        </Drawer>
      </>
    );
  }

  // 桌機版
  return (
    <>
      <Layout.Header className={`project-top-bar${theme === 'dark' ? ' dark-theme' : ''}`.replace('project-top-bar dark-theme', 'project-top-bar dark-theme')}> 
        {/* 左側：功能選單按鈕 */}
        <Button type="text" icon={<MenuOutlined />} style={{ fontSize: 24, marginRight: 16 }} onClick={() => setDrawerOpen(true)} />
        {/* 中間：專案名稱 */}
        <Typography.Title level={4} style={{ margin: 0, flex: 1, textAlign: 'center', color: '#1976d2', fontWeight: 800, letterSpacing: 2 }}>{projectName}</Typography.Title>
        {/* 主題切換按鈕 */}
        <Button
          type="text"
          icon={theme === 'dark' ? <BulbOutlined /> : <MoonOutlined />}
          style={{ fontSize: 22, marginLeft: 4 }}
          onClick={toggleTheme}
          aria-label="切換主題"
        />
        {/* 右側：用戶名 */}
        <Button type="text" style={{ fontWeight: 700, fontSize: 18, padding: 0, color: '#1976d2', marginLeft: 16 }} icon={<UserOutlined />} onClick={onUserClick}>
          {userName || '用戶'}
        </Button>
      </Layout.Header>
      <Drawer placement="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={260} bodyStyle={{ padding: 0 }}>
        {sideMenu}
      </Drawer>
    </>
  );
}
