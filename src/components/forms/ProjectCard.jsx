import React from 'react';
import { Card, Typography } from 'antd';
import { dbUtils } from '../../utils/database';

const ProjectCard = ({ project, onClick, style = {} }) => {
  const getImageUrl = (imgPath) => {
    return dbUtils.storage.getImageUrl('home-project-card-photo', imgPath);
  };

  return (
    <Card
      className="modern-card interactive-click glass-morphism"
      hoverable
      cover={project.photo_path ? 
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
          <img 
            alt="cover" 
            src={getImageUrl(project.photo_path)} 
            style={{ 
              height: 160, 
              width: '100%',
              objectFit: 'cover',
              transition: 'var(--transition-smooth)'
            }} 
          />
          <div className="animate-shimmer" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.3
          }} />
        </div> : 
        <div style={{ 
          height: 160, 
          background: 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '16px 16px 0 0',
          position: 'relative'
        }}>
          <Typography.Title level={1} style={{ 
            color: 'white', 
            margin: 0,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {project.name.charAt(0)}
          </Typography.Title>
        </div>
      }
      onClick={() => onClick(project)}
      style={{ 
        height: 320,
        cursor: 'pointer',
        transition: 'var(--transition-bounce)',
        ...style 
      }}
      bodyStyle={{
        padding: '20px',
        background: 'transparent'
      }}
    >
      <Card.Meta
        title={
          <Typography.Title 
            level={5} 
            className="gradient-text"
            style={{ 
              margin: 0,
              fontSize: '1.2rem',
              fontWeight: 600,
              marginBottom: '12px'
            }}
          >
            {project.name}
          </Typography.Title>
        }
        description={
          <div style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}>
            <div style={{ 
              color: 'var(--text-secondary)', 
              fontSize: 14, 
              marginBottom: 8,
              fontWeight: 500
            }}>
              🏢 檢查單位：{project.unit}
            </div>
            <div style={{ 
              color: 'var(--text-muted)', 
              fontSize: 14, 
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              📋 檢查說明：{project.directions}
            </div>
          </div>
        }
      />
    </Card>
  );
};

export default ProjectCard;