
import React, { useState, useEffect } from 'react';
import ThemeSwitchBtn from '../components/ThemeSwitchBtn';
// import HomeSidebar from '../components/HomeSidebar';
import { Drawer } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useTheme } from '../lib/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Layout, Card, Row, Col, Dropdown, Menu, Button, Typography, message } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined, PlusOutlined, HistoryOutlined, ToolOutlined } from '@ant-design/icons';
import { supabase } from '../lib/supabaseClient';

// 主畫面


export default function Home() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();


  // 取得專案卡片資料
  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      const { data, error } = await supabase.from('home_project_card').select('*');
      console.log('home_project_card 資料:', data, error);
      if (!error && data) {
        if (data.length === 0) {
          // 自動新增一筆預設資料
          const defaultProject = {
            name: '預設案場',
            unit: '預設單位',
            directions: '這是自動建立的預設專案卡片',
            photo_path: '',
          };
          const { error: insertError } = await supabase.from('home_project_card').insert([defaultProject]);
          if (!insertError) {
            // 新增後重新取得資料
            const { data: newData } = await supabase.from('home_project_card').select('*');
            setProjects(newData || []);
          } else {
            setProjects([]);
          }
        } else {
          setProjects(data);
        }
      } else {
        setProjects([]);
      }
      setLoading(false);
    }
    fetchProjects();
  }, []);

  // 取得當前登入者 user_names 的 user 欄位
  useEffect(() => {
    async function fetchUserName() {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setUserName('');
        return;
      }
      const email = user.email;
      if (!email) {
        setUserName('');
        return;
      }
      const { data, error } = await supabase.from('user_names').select('user').eq('email', email).single();
      if (!error && data && data.user) {
        setUserName(data.user);
      } else {
        setUserName(email);
      }
    }
    fetchUserName();
  }, []);

  // 用戶選單
  const userMenu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={() => { localStorage.clear(); navigate('/'); }}>
        登出
      </Menu.Item>
    </Menu>
  );

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

  // 取得圖片 URL
  const getImageUrl = (imgPath) => {
    if (!imgPath) return '';
    return supabase.storage.from('home-project-card-photo').getPublicUrl(imgPath).publicUrl;
  };

  // 側邊欄選單
  const onAppSettings = () => {
    setDrawerOpen(false);
    message.info('尚未實作應用程式設定');
  };
  const onSeasonSetting = () => {
    setDrawerOpen(false);
    message.info('尚未實作季保養設定');
  };
  const onInfoSetting = () => {
    setDrawerOpen(false);
    message.info('尚未實作保養資訊設定');
  };
  const onUserClick = () => {
    setDrawerOpen(false);
    message.info('尚未實作用戶頁面');
  };
  const projectName = projects[0]?.name || '專案名稱';
  const homesideMenu = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ fontWeight: 800, fontSize: 22, color: '#1976d2', textAlign: 'center', margin: '32px 0 24px 0' }}>{projectName}</div>
      <Button type="text" icon={<SettingOutlined />} style={{ textAlign: 'left', width: '100%', fontSize: 18, marginBottom: 8 }} onClick={onAppSettings}>應用程式設定</Button>
      <div style={{ flex: 1 }} />
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Button type="text" icon={<UserOutlined />} style={{ fontWeight: 700, fontSize: 18, color: '#1976d2' }} onClick={onUserClick}>{userName || '用戶'}</Button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--main-bg, #e3f0ff)' }}>
      <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
        {/* 頂端列 */}
        <div className={`home-top-bar${theme === 'dark' ? ' dark-theme' : ''}`}> 
          {/* 左側：功能選單按鈕 */}
          <Button type="text" icon={<MenuOutlined />} style={{ fontSize: 24, marginRight: 16 }} onClick={() => setDrawerOpen(true)} />
          {/* 中間：標題 */}
          <Typography.Title level={3} style={{ margin: 0, flex: 1, textAlign: 'center', color: '#1976d2', fontWeight: 800, letterSpacing: 2 }}>ACL 季保養</Typography.Title>
          {/* 右側：主題切換按鈕與用戶名 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ThemeSwitchBtn style={{ position: 'static', fontSize: 22 }} />
            <Dropdown overlay={userMenu} trigger={['click']}>
              <Button type="text" style={{ fontWeight: 700, fontSize: 18, padding: 0, color: '#1976d2' }} icon={<UserOutlined />}>
                {userName || '用戶'}
              </Button>
            </Dropdown>
          </div>
        </div>
        {/* Drawer 側邊欄 */}
        <Drawer placement="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={260} bodyStyle={{ padding: 0, background: theme === 'dark' ? '#23262f' : '#fff' }}>
          {homesideMenu}
        </Drawer>
        <Layout.Content style={{ width: '100vw', maxWidth: '100vw', minHeight: 'calc(100vh - 72px)', padding: '32px 16px', margin: 0 }}>
          <Row gutter={[24, 24]} style={{ width: '100%' }}>
            {/* 新增卡片 */}
            <Col xs={24} sm={12} md={8} lg={6} key="add">
              <Card
                hoverable
                style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #1976d2', color: '#1976d2' }}
                onClick={handleAddCard}
              >
                <PlusOutlined style={{ fontSize: 48, marginBottom: 12 }} />
                <div style={{ fontSize: 20, fontWeight: 700 }}>新增案場</div>
              </Card>
            </Col>
            {/* 專案卡片 */}
            {projects.map(project => (
              <Col xs={24} sm={12} md={8} lg={6} key={project.id}>
                <Card
                  hoverable
                  cover={project.photo_path ? <img alt="cover" src={getImageUrl(project.photo_path)} style={{ height: 120, objectFit: 'cover' }} /> : null}
                  onClick={() => handleCardClick(project)}
                  style={{ height: 260, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <Typography.Title level={5} style={{ marginBottom: 8 }}>{project.name}</Typography.Title>
                  <div style={{ color: '#888', fontSize: 14, marginBottom: 4 }}>檢查單位：{project.unit}</div>
                  <div style={{ color: '#555', fontSize: 15, flex: 1 }}>檢查說明：{project.directions}</div>
                </Card>
              </Col>
            ))}
          </Row>
        </Layout.Content>
      </Layout>
    </div>
  );
}
