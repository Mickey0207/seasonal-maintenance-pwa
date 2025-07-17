import React from 'react';
import { Layout, Button, Typography, Dropdown, Drawer, message, Modal } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined, HistoryOutlined, ToolOutlined, MenuOutlined, HomeOutlined, FormOutlined, PlusOutlined, EyeOutlined, FileExcelOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/constants';
import { authUtils } from '../utils/auth';
import { dbUtils } from '../utils/database';
import { supabase } from '../lib/supabaseClient';

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

  const handleDeleteAllMaintenanceData = () => {
    Modal.confirm({
      title: '確認刪除所有季保養資料',
      icon: <ExclamationCircleOutlined />,
      content: '您確定要刪除所有季保養資料嗎？這將永久刪除以下資料：\n• maintainance_photo 表中的所有照片記錄\n• maintainance_setting 表中的所有設定資料\n• 相關的照片文件\n\n此操作無法復原！',
      okText: '確認刪除',
      okType: 'danger',
      cancelText: '取消',
      className: 'modern-modal',
      onOk: async () => {
        try {
          // 1. 刪除 maintainance_photo 中的所有資料及相關照片
          const { data: allMaintenancePhotos, error: photoFetchError } = await dbUtils.maintenancePhoto.getByProject(projectName);
          if (photoFetchError) throw photoFetchError;
          
          for (const item of allMaintenancePhotos) {
            if (item.photo_path) {
              await dbUtils.storage.deleteImage('maintainance-data-photo', item.photo_path);
            }
            await dbUtils.maintenancePhoto.delete(item.id);
          }

          // 2. 刪除 maintainance_setting 中該專案的所有設定資料
          const { error: settingDeleteError } = await supabase
            .from('maintainance_setting')
            .delete()
            .eq('name', projectName);
          
          if (settingDeleteError) {
            console.error('刪除設定資料失敗:', settingDeleteError);
            throw settingDeleteError;
          }

          message.success({
            content: '刪除成功！所有季保養資料（照片和設定）已成功刪除',
            duration: 3
          });
          setDrawerOpen(false);
          // 使用 navigate 重新載入當前頁面，避免卡住
          setTimeout(() => {
            navigate(0);
          }, 1000);
        } catch (error) {
          console.error('刪除所有季保養資料失敗:', error);
          message.error({
            content: `刪除失敗: ${error.message || '未知錯誤'}`,
            duration: 3
          });
        }
      },
      onCancel() {
        console.log('取消刪除');
      },
    });
  };

  // 處理側邊欄關閉
  const handleDrawerClose = () => {
    setDrawerOpen(false);
    // 移除自動重載，避免網頁卡住
  };


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
      style: {
        background: 'var(--danger-gradient)',
        color: 'white',
        borderRadius: '8px',
        margin: '4px 0',
        fontWeight: 600
      }
    },
  ];

  // 側邊欄內容
  const sideMenu = customSideMenu ? customSideMenu : (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Button 
        className="sidebar-menu-item" 
        type="text" 
        icon={<HomeOutlined />} 
        onClick={() => {
          setDrawerOpen(false);
          navigate('/home');
        }}
      >
        主畫面
      </Button>
      <div style={{ height: 16 }} />
      <Button 
        className="sidebar-menu-item" 
        type="text" 
        icon={<FormOutlined />} 
        onClick={() => {
          setDrawerOpen(false);
          navigate(`/project/${id}`);
        }}
      >
        本次季保養表單
      </Button>
      <Button 
        className="sidebar-menu-item" 
        type="text" 
        icon={<PlusOutlined />} 
        onClick={() => {
          setDrawerOpen(false);
          navigate(`/project/${id}/addmaintainancedata`);
        }}
      >
        新增季保養資料
      </Button>
      <Button 
        className="sidebar-menu-item" 
        type="text" 
        icon={<EyeOutlined />} 
        onClick={() => {
          setDrawerOpen(false);
          navigate(`/project/${id}/viewmaintainancedata`);
        }}
      >
        查看季保養資料
      </Button>
      <Button 
        className="sidebar-menu-item" 
        type="text" 
        icon={<FileExcelOutlined />} 
        onClick={() => {
          setDrawerOpen(false);
          navigate(`/project/${id}/export-excel`);
        }}
      >
        Excel匯出
      </Button>
      <div className="sidebar-divider" />
      <Button 
        className="sidebar-menu-item" 
        type="text" 
        icon={<SettingOutlined />} 
        onClick={() => {
          setDrawerOpen(false);
          navigate(`/project/${id}/season-setting`);
        }}
      >
        本次季保養設定
      </Button>
      <Button 
        className="sidebar-menu-item" 
        type="text" 
        icon={<ToolOutlined />} 
        onClick={() => {
          setDrawerOpen(false);
          navigate(`/project/${id}/maintain-setting`);
        }}
      >
        保養資訊設定
      </Button>
      <div className="sidebar-divider" />
      <Button 
        className="sidebar-menu-item delete-all-data-btn" 
        type="text" 
        icon={<ExclamationCircleOutlined />} 
        onClick={handleDeleteAllMaintenanceData}
        style={{
          background: 'var(--danger-gradient)',
          color: 'white',
          borderRadius: '8px',
          margin: '4px 0',
          fontWeight: 600,
          boxShadow: 'var(--shadow-danger)',
          border: '1px solid var(--border-danger)',
          transition: 'var(--transition-smooth)'
        }}
      >
        刪除所有季保養資料
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
      <Layout.Header className="unified-topbar modern-topbar">
        <div className="topbar-container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: '0 24px',
          position: 'relative'
        }}>
          {/* 左側：選單按鈕 */}
          <div className="topbar-left" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            minWidth: '120px'
          }}>
            <Button 
              className="menu-trigger-btn interactive-click" 
              type="text" 
              icon={<MenuOutlined />} 
              onClick={() => setDrawerOpen(true)}
              style={{ 
                color: 'var(--text-primary)',
                fontSize: '18px',
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                transition: 'var(--transition-smooth)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />
          </div>
          
          {/* 中央：標題 */}
          <div className="topbar-center" style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Typography.Title 
              className="unified-topbar-title gradient-text animate-fadeInDown" 
              level={4}
              style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: 700,
                background: 'var(--primary-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
              onClick={() => navigate(ROUTES.HOME)}
            >
              {projectName || '季保養管理系統'}
            </Typography.Title>
          </div>
          
          {/* 右側：用戶選單 */}
          <div className="topbar-right" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '120px',
            justifyContent: 'flex-end'
          }}>
            {/* 用戶信息顯示 */}
            <div className="user-info" style={{
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
                {userName || '用戶'}
              </span>
            </div>
            
            {/* 用戶選單按鈕 */}
            <Dropdown 
              menu={{ items: userMenuItems }}
              trigger={["click"]} 
              placement="bottomRight"
              overlayClassName="unified-dropdown"
              popupRender={(menu) => (
                <div className="user-dropdown">
                  {menu}
                </div>
              )}
            >
              <Button 
                className="user-menu-trigger interactive-click neon-glow" 
                type="text" 
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  height: '44px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  transition: 'var(--transition-bounce)'
                }}
              >
                <UserOutlined style={{ fontSize: '16px' }} />
              </Button>
            </Dropdown>
          </div>
        </div>
      </Layout.Header>
      
      <Drawer 
        title="選單"
        className="modern-sidebar"
        placement="left" 
        open={drawerOpen} 
        onClose={handleDrawerClose}
        width={280}
      >
        {sideMenu}
      </Drawer>
    </>
  );
}

export default ProjectTopBar;