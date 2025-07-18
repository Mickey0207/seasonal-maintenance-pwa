import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Spin, Alert, Tabs, Empty, Checkbox, Button, Modal, message, App } from 'antd';
import { EyeOutlined, WarningOutlined, DeleteOutlined, SelectOutlined } from '@ant-design/icons';
import PageLayout from '../components/layout/PageLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { useProject } from '../hooks/useProject';
import { dbUtils } from '../utils/database';
import { supabase } from '../lib/supabaseClient';
import { ROUTES } from '../config/constants';
import '../styles/horizontal-scroll.css';

const { Title, Text } = Typography;

export default function ViewMaintenanceData() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userName } = useAuth();
  const { project, loading, error } = useProject(id);
  const { modal } = App.useApp();
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [groupedData, setGroupedData] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (project) {
      fetchMaintenanceData();
    }
  }, [project]);

  const fetchMaintenanceData = async () => {
    try {
      // Fetch all maintenance_data records
      const { data: maintenanceDataRecords, error: dataError } = await dbUtils.maintenanceData.getByProject(project.name);
      if (dataError) throw dataError;

      // Fetch all maintenance_photo records
      const { data: maintenancePhotoRecords, error: photoError } = await dbUtils.maintenancePhoto.getByProject(project.name);
      if (photoError) throw photoError;

      // Create a map for quick lookup of photos by a composite key
      const photoMap = new Map();
      maintenancePhotoRecords.forEach(photoItem => {
        // 使用 project, floor, thing, location 作為複合鍵
        const key = `${photoItem.project}_${photoItem.floor}_${photoItem.thing}_${photoItem.location}`;
        photoMap.set(key, photoItem);
      });

      // Combine data
      const combinedData = maintenanceDataRecords.map(dataItem => {
        const key = `${dataItem.project}_${dataItem.floor}_${dataItem.thing}_${dataItem.location}`;
        const photoItem = photoMap.get(key);

        return {
          ...dataItem, // All fields from maintenance_data
          photo_path: photoItem ? photoItem.photo_path : null, // Add photo_path if found
          photo_record_id: photoItem ? photoItem.id : null, // Store photo's ID
          // 使用 photoItem 的 maintainance_user 和 maintainance_time，如果沒有則使用 dataItem 的 creat_user 和 creat_at
          maintainance_user: photoItem ? photoItem.maintainance_user : dataItem.creat_user,
          maintainance_time: photoItem ? photoItem.maintainance_time : dataItem.creat_at,
        };
      });

      // 將有圖片的記錄排在最右側（最後面）
      const sortedData = (combinedData || []).sort((a, b) => {
        const aHasPhoto = a.photo_path && a.photo_path.trim() !== '';
        const bHasPhoto = b.photo_path && b.photo_path.trim() !== '';
        
        // 沒有圖片的排在前面（左側），有圖片的排在後面（右側）
        if (!aHasPhoto && bHasPhoto) return -1;
        if (aHasPhoto && !bHasPhoto) return 1;
        
        // 如果都有圖片或都沒有圖片，按建立時間排序（新的在前）
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });

      setMaintenanceData(sortedData);
      groupDataByLocation(sortedData);

    } catch (error) {
    } finally {
      setDataLoading(false);
    }
  };

  const groupDataByLocation = (data) => {
    const grouped = {};
    
    data.forEach(item => {
      // 只取 location 中的中文部分作為分類標題
      let locationPrefix = '未分類';
      if (item.location) {
        // 使用正則表達式匹配第一個出現的連續中文字符
        const chineseMatch = item.location.match(/[\u4e00-\u9fff]+/);
        locationPrefix = chineseMatch ? chineseMatch[0] : '未分類';
      }
      
      if (!grouped[locationPrefix]) {
        grouped[locationPrefix] = [];
      }
      grouped[locationPrefix].push(item);
    });

    // 按檢查位置後綴排序
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => {
        const aNum = extractNumber(a.location);
        const bNum = extractNumber(b.location);
        return aNum - bNum;
      });
    });

    setGroupedData(grouped);
  };

  const groupDataByThing = (data) => {
    const grouped = {};
    
    data.forEach(item => {
      const thing = item.thing || '未分類';
      if (!grouped[thing]) {
        grouped[thing] = [];
      }
      grouped[thing].push(item);
    });

    return grouped;
  };

  const extractNumber = (location) => {
    if (!location) return 0;
    const match = location.match(/(\d+)-(\d+)/);
    if (match) {
      return parseInt(match[1]) * 100 + parseInt(match[2]);
    }
    return 0;
  };

  const getImageUrl = (path) => {
    if (!path) {
      return null;
    }
    
    try {
      // 直接從 Supabase Storage 獲取公開 URL
      const { data } = supabase.storage
        .from('maintainance-data-photo')
        .getPublicUrl(path);
      
      return data.publicUrl;
    } catch (error) {
      return null;
    }
  };

  // 切換選擇模式
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedItems([]);
  };

  // 處理單個項目選擇
  const handleItemSelect = (itemId, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  // 全選/取消全選
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(maintenanceData.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  // 批量刪除季保養項目 (maintainance_data)
  const handleBatchDeleteData = async () => {
    if (selectedItems.length === 0) {
      message.warning('請先選擇要刪除的項目');
      return;
    }

    
    modal.confirm({
      title: <span style={{ color: 'var(--text-primary)' }}><DeleteOutlined /> 確認刪除季保養項目</span>,
      content: <span style={{ color: 'var(--text-secondary)' }}>您確定要刪除選中的 <strong style={{ color: 'var(--text-accent)' }}>{selectedItems.length}</strong> 個季保養項目嗎？這將刪除 maintainance_data 表中的資料記錄。</span>,
      okText: '確認',
      cancelText: '取消',
      okButtonProps: { danger: true },
      centered: true,
      className: 'modern-modal',
      onOk: async () => {
      setDeleteLoading(true);
      try {
        // 只刪除 maintainance_data 記錄
        for (const itemId of selectedItems) {
          await dbUtils.maintenanceData.delete(itemId);
        }
        
        Modal.success({
          title: '刪除成功',
          content: `成功刪除 ${selectedItems.length} 個季保養項目`,
          className: 'custom-success-modal'
        });
        setSelectedItems([]);
        setIsSelectionMode(false);
        // 重新獲取資料
        fetchMaintenanceData();
      } catch (error) {
        Modal.error({
          title: '刪除失敗',
          content: '操作失敗，請稍後再試',
          className: 'modern-modal'
        });
      } finally {
        setDeleteLoading(false);
      }
    },
    });
  };

  // 批量刪除本次季保養資料 (maintainance_photo)
  const handleBatchDeletePhoto = async () => {
    if (selectedItems.length === 0) {
      message.warning('請先選擇要刪除的項目');
      return;
    }

    console.log('準備顯示刪除本次季保養資料確認對話框');
    
    modal.confirm({
      title: <span style={{ color: 'var(--text-primary)' }}><DeleteOutlined /> 確認刪除本次季保養資料</span>,
      content: <span style={{ color: 'var(--text-secondary)' }}>您確定要刪除選中的 <strong style={{ color: 'var(--text-accent)' }}>{selectedItems.length}</strong> 個項目的照片資料嗎？這將刪除 maintainance_photo 表中的資料和相關照片文件。</span>,
      okText: '確認',
      cancelText: '取消',
      okButtonProps: { danger: true },
      centered: true,
      className: 'modern-modal',
      onOk: async () => {
      console.log('用戶確認刪除本次季保養資料');
      setDeleteLoading(true);
      try {
        // 刪除照片文件和 maintainance_photo 記錄
        for (const itemId of selectedItems) {
          const item = maintenanceData.find(data => data.id === itemId);
          if (item && item.photo_record_id) {
            // 刪除照片文件（如果存在）
            if (item.photo_path) {
              await dbUtils.storage.deleteImage('maintainance-data-photo', item.photo_path);
            }
            // 刪除 maintainance_photo 記錄
            await dbUtils.maintenancePhoto.delete(item.photo_record_id);
          }
        }
        
        Modal.success({
          title: '刪除成功',
          content: `成功刪除 ${selectedItems.length} 個本次季保養資料`,
          className: 'custom-success-modal'
        });
        setSelectedItems([]);
        setIsSelectionMode(false);
        // 重新獲取資料
        fetchMaintenanceData();
      } catch (error) {
        console.error('刪除本次季保養資料失敗:', error);
        Modal.error({
          title: '刪除失敗',
          content: '操作失敗，請稍後再試',
          className: 'modern-modal'
        });
      } finally {
        setDeleteLoading(false);
      }
    },
    });
  };

  const renderMaintenanceCard = (item) => {
    const hasPhoto = item.photo_path;
    const isSelected = selectedItems.includes(item.id);
    const cardStyle = {
      minWidth: 200,
      maxWidth: 220,
      flexShrink: 0,
      position: 'relative',
      border: isSelected ? '2px solid #1890ff' : undefined,
      boxShadow: isSelected ? '0 0 10px rgba(24, 144, 255, 0.3)' : undefined,
      margin: '0 8px'
    };

    return (
      <Card
        key={item.id}
        className={`modern-card compact-maintenance-card ${hasPhoto ? '' : 'maintenance-card-missing'}`}
        style={cardStyle}
        cover={
          <div style={{ position: 'relative' }}>
            {isSelectionMode && (
              <Checkbox
                checked={isSelected}
                onChange={(e) => handleItemSelect(item.id, e.target.checked)}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 10,
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '4px',
                  padding: '2px',
                  border: '1px solid var(--border-primary)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              />
            )}
            {hasPhoto ? (
              <img
                alt="保養照片"
                src={getImageUrl(item.photo_path)}
                style={{ height: 120, objectFit: 'cover', width: '100%' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : (
              <div style={{ 
                height: 120, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 77, 79, 0.2)',
                color: 'var(--text-danger)'
              }}>
                <WarningOutlined style={{ fontSize: 32 }} />
              </div>
            )}
          </div>
        }
      >
        <Card.Meta
          title={
            <div style={{ 
              color: hasPhoto ? 'var(--text-primary)' : 'var(--text-danger)',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '8px'
            }}>
              {item.location}
            </div>
          }
          description={
            <div>
              <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                檢查項目：{item.thing}
              </Text>
              <br />
              <Text style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                樓層：{item.floor}
              </Text>
              <br />
              <Text style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                新增日期：{item.maintainance_time}
              </Text>
              <br />
              <Text style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                保養者：{item.maintainance_user || '未填寫'}
              </Text>
              {!hasPhoto && (
                <div style={{ marginTop: 6, color: 'var(--text-danger)', fontSize: 10 }}>
                  ⚠️ 缺少照片資料
                </div>
              )}
            </div>
          }
        />
      </Card>
    );
  };

  const renderGroupedCards = (grouped) => {
    return Object.entries(grouped).map(([groupName, items], groupIndex) => (
      <div 
        key={groupName} 
        className="animate-slideInLeft"
        style={{ 
          marginBottom: 32,
          animationDelay: `${groupIndex * 0.1}s`,
          animationFillMode: 'both'
        }}
      >
        <Title level={4} className="gradient-text" style={{ 
          marginBottom: 16,
          borderLeft: '4px solid var(--text-accent)',
          paddingLeft: 12,
          fontSize: '1.3rem',
          fontWeight: 600
        }}>
          📂 {groupName}
        </Title>
        <div className="horizontal-scroll-container" style={{
          display: 'flex',
          overflowX: 'auto',
          overflowY: 'hidden',
          gap: '0px',
          padding: '8px 0',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--border-accent) transparent'
        }}>
          {items.map((item, index) => (
            <div 
              key={item.id}
              className="animate-scaleIn"
              style={{
                animationDelay: `${(groupIndex * 0.1) + (index * 0.05)}s`,
                animationFillMode: 'both',
                flexShrink: 0
              }}
            >
              {renderMaintenanceCard(item)}
            </div>
          ))}
        </div>
      </div>
    ));
  };

  if (loading) return <LoadingSpinner />;
  if (error || !project) {
    return <ErrorMessage message="找不到專案資料" onBack={() => navigate(ROUTES.HOME)} />;
  }

  const tabItems = [
    {
      key: 'location',
      label: '按檢查位置分類',
      children: dataLoading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : Object.keys(groupedData).length === 0 ? (
        <Empty description="暫無保養資料" />
      ) : (
        renderGroupedCards(groupedData)
      )
    },
    {
      key: 'thing',
      label: '按檢查項目分類',
      children: dataLoading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : maintenanceData.length === 0 ? (
        <Empty description="暫無保養資料" />
      ) : (
        renderGroupedCards(groupDataByThing(maintenanceData))
      )
    }
  ];

  return (
    <PageLayout
      userName={userName}
      projectName={project.name}
      projectId={id}
    >
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '20px'
      }}>
        <Card 
          className="modern-card glass-morphism animate-fadeInUp"
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="gradient-text" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                fontSize: '1.5rem',
                fontWeight: 600
              }}>
                👁️ 查看季保養資料
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {isSelectionMode && (
                  <>
                    <Checkbox
                      checked={selectedItems.length === maintenanceData.length && maintenanceData.length > 0}
                      indeterminate={selectedItems.length > 0 && selectedItems.length < maintenanceData.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      style={{ color: 'var(--text-primary)' }}
                    >
                      全選 ({selectedItems.length}/{maintenanceData.length})
                    </Checkbox>
                    <Button
                      type="primary"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        handleBatchDeleteData();
                      }}
                      loading={deleteLoading}
                      disabled={selectedItems.length === 0}
                      style={{ marginRight: 8 }}
                    >
                      刪除季保養項目 ({selectedItems.length})
                    </Button>
                    <Button
                      type="primary"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        handleBatchDeletePhoto();
                      }}
                      loading={deleteLoading}
                      disabled={selectedItems.length === 0}
                    >
                      刪除本次季保養資料 ({selectedItems.length})
                    </Button>
                  </>
                )}
                <Button
                  type={isSelectionMode ? "default" : "primary"}
                  icon={<SelectOutlined />}
                  onClick={toggleSelectionMode}
                >
                  {isSelectionMode ? '取消選擇' : '批量選擇'}
                </Button>
              </div>
            </div>
          }
          style={{ marginBottom: 24 }}
        >
          <Tabs 
            items={tabItems}
            defaultActiveKey="location"
            className="animate-slideInRight"
            style={{ 
              minHeight: 400,
              animationDelay: '0.3s',
              animationFillMode: 'both'
            }}
          />
        </Card>
      </div>
    </PageLayout>
  );
}