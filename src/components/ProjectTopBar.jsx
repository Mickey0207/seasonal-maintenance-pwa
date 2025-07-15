import React from 'react';
import { Layout, Button, Typography, Dropdown, Drawer, message, Modal } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined, HistoryOutlined, ToolOutlined, MenuOutlined, HomeOutlined, FormOutlined, PlusOutlined, EyeOutlined, FileExcelOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/constants';
import { authUtils } from '../utils/auth';
import { dbUtils } from '../utils/database';

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
      title: '確認刪除所有季保養暫存資料',
      icon: <ExclamationCircleOutlined />,
      content: '您確定要刪除所有季保養暫存資料嗎？這將永久刪除 maintainance_data 和 maintainance_photo 表中的所有記錄，以及相關的照片文件。此操作無法復原！',
      okText: '確認刪除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 刪除 maintainance_data 中的所有資料
          const { data: allMaintenanceData, error: dataFetchError } = await dbUtils.maintenanceData.getByProject(projectName);
          if (dataFetchError) throw dataFetchError;
          for (const item of allMaintenanceData) {
            await dbUtils.maintenanceData.delete(item.id);
          }

          // 刪除 maintainance_photo 中的所有資料及相關照片
          const { data: allMaintenancePhotos, error: photoFetchError } = await dbUtils.maintenancePhoto.getByProject(projectName);
          if (photoFetchError) throw photoFetchError;
          for (const item of allMaintenancePhotos) {
            if (item.photo_path) {
              await dbUtils.storage.deleteImage('maintainance-data-photo', item.photo_path);
            }
            await dbUtils.maintenancePhoto.delete(item.id);
          }

          message.success('所有季保養暫存資料已成功刪除！');
          setDrawerOpen(false);
          window.location.reload(); // 重新載入頁面以更新資料
        } catch (error) {
          console.error('刪除所有季保養暫存資料失敗:', error);
          message.error(`刪除失敗: ${error.message || '未知錯誤'}`);
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
    // 如果直接關閉側邊欄（沒有點擊按鈕），重載網頁
    setTimeout(() => {
      window.location.reload();
    }, 100);
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
          if (window.location.pathname === '/home') {
            // 同頁面：重載網頁
            window.location.reload();
          } else {
            // 不同頁面：導向其他網頁
            navigate('/home');
          }
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
          if (window.location.pathname === `/project/${id}`) {
            // 同頁面：重載網頁
            window.location.reload();
          } else {
            // 不同頁面：導向其他網頁
            navigate(`/project/${id}`);
          }
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
          if (window.location.pathname === `/project/${id}/addmaintainancedata`) {
            // 同頁面：重載網頁
            window.location.reload();
          } else {
            // 不同頁面：導向其他網頁
            navigate(`/project/${id}/addmaintainancedata`);
          }
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
          if (window.location.pathname === `/project/${id}/viewmaintainancedata`) {
            // 同頁面：重載網頁
            window.location.reload();
          } else {
            // 不同頁面：導向其他網頁
            navigate(`/project/${id}/viewmaintainancedata`);
          }
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
          if (window.location.pathname === `/project/${id}/export-excel`) {
            // 同頁面：重載網頁
            window.location.reload();
          } else {
            // 不同頁面：導向其他網頁
            navigate(`/project/${id}/export-excel`);
          }
        }}
      >
        Excel匯出
      </Button>
      <div style={{ height: 16 }} />
      <Button 
        className="sidebar-menu-item" 
        type="text" 
        icon={<SettingOutlined />} 
        onClick={() => {
          setDrawerOpen(false);
          if (window.location.pathname === `/project/${id}/season-setting`) {
            // 同頁面：重載網頁
            window.location.reload();
          } else {
            // 不同頁面：導向其他網頁
            navigate(`/project/${id}/season-setting`);
          }
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
          if (window.location.pathname === `/project/${id}/maintain-setting`) {
            // 同頁面：重載網頁
            window.location.reload();
          } else {
            // 不同頁面：導向其他網頁
            navigate(`/project/${id}/maintain-setting`);
          }
        }}
      >
        保養資訊設定
      </Button>
      <div style={{ height: 16 }} />
      <Button 
        className="sidebar-menu-item" 
        type="text" 
        icon={<ExclamationCircleOutlined />} 
        onClick={handleDeleteAllMaintenanceData}
        style={{
          background: 'var(--danger-gradient)',
          color: 'white',
          borderRadius: '8px',
          margin: '4px 0',
          fontWeight: 600
        }}
      >
        刪除所有季保養暫存資料
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
        
        <div className="topbar-center" style={{ 
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center'
        }}>
          <Typography.Title className="topbar-title" level={4}>
            {projectName}
          </Typography.Title>
        </div>
        
        <div className="topbar-right" style={{ marginLeft: 'auto' }}>
          <Dropdown 
            menu={{ items: userMenuItems }}
            trigger={["click"]} 
            placement="bottomRight"
            popupRender={(menu) => (
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