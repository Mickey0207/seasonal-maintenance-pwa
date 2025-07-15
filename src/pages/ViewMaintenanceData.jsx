import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Spin, Alert, Tabs, Empty } from 'antd';
import { EyeOutlined, WarningOutlined } from '@ant-design/icons';
import PageLayout from '../components/layout/PageLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { useProject } from '../hooks/useProject';
import { dbUtils } from '../utils/database';
import { ROUTES } from '../config/constants';

const { Title, Text } = Typography;

export default function ViewMaintenanceData() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userName } = useAuth();
  const { project, loading, error } = useProject(id);
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [groupedData, setGroupedData] = useState({});

  useEffect(() => {
    if (project) {
      fetchMaintenanceData();
    }
  }, [project]);

  const fetchMaintenanceData = async () => {
    try {
      const { data, error } = await dbUtils.maintenanceData.getByProject(project.name);

      if (error) throw error;

      setMaintenanceData(data || []);
      groupDataByLocation(data || []);
    } catch (error) {
      console.error('獲取保養資料失敗:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const groupDataByLocation = (data) => {
    const grouped = {};
    
    data.forEach(item => {
      // 按檢查位置前綴分組
      const locationPrefix = item.location ? item.location.split(' ')[0] : '未分類';
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
    return dbUtils.storage.getImageUrl('maintainance-data-photo', path);
  };

  const renderMaintenanceCard = (item) => {
    const hasPhoto = item.photo_path;
    const cardStyle = {
      minWidth: 280,
      flexShrink: 0
    };

    return (
      <Card
        key={item.id}
        className={`modern-card ${hasPhoto ? '' : 'maintenance-card-missing'}`}
        style={cardStyle}
        cover={hasPhoto ? (
          <img
            alt="保養照片"
            src={getImageUrl(item.photo_path)}
            style={{ height: 160, objectFit: 'cover' }}
          />
        ) : (
          <div style={{ 
            height: 160, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 77, 79, 0.2)',
            color: '#ff4d4f'
          }}>
            <WarningOutlined style={{ fontSize: 48 }} />
          </div>
        )}
      >
        <Card.Meta
          title={
            <div style={{ color: hasPhoto ? 'var(--text-primary)' : '#ff4d4f' }}>
              {item.location}
            </div>
          }
          description={
            <div>
              <Text style={{ color: 'var(--text-secondary)' }}>
                檢查項目：{item.thing}
              </Text>
              <br />
              <Text style={{ color: 'var(--text-muted)' }}>
                樓層：{item.floor}
              </Text>
              <br />
              <Text style={{ color: 'var(--text-muted)' }}>
                新增日期：{item.create_at}
              </Text>
              <br />
              <Text style={{ color: 'var(--text-muted)' }}>
                保養者：{item.maintainance_user || '未填寫'}
              </Text>
              {!hasPhoto && (
                <div style={{ marginTop: 8, color: '#ff4d4f', fontSize: 12 }}>
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
        <div className="horizontal-scroll">
          {items.map((item, index) => (
            <div 
              key={item.id}
              className="animate-scaleIn"
              style={{
                animationDelay: `${(groupIndex * 0.1) + (index * 0.05)}s`,
                animationFillMode: 'both'
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
            <div className="gradient-text" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
              fontSize: '1.5rem',
              fontWeight: 600
            }}>
              👁️ 查看季保養資料
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