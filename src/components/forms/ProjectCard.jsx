import React from 'react';
import { Card, Typography } from 'antd';
import { dbUtils } from '../../utils/database';

const ProjectCard = ({ project, onClick, style = {} }) => {
  const getImageUrl = (imgPath) => {
    return dbUtils.storage.getImageUrl('home-project-card-photo', imgPath);
  };

  return (
    <Card
      className="modern-card"
      hoverable
      cover={project.photo_path ? 
        <img 
          alt="cover" 
          src={getImageUrl(project.photo_path)} 
          style={{ height: 160, objectFit: 'cover' }} 
        /> : null
      }
      onClick={() => onClick(project)}
      style={{ 
        height: 320, 
        ...style 
      }}
    >
      <Card.Meta
        title={
          <Typography.Title level={5} style={{ margin: 0, color: 'var(--text-primary)' }}>
            {project.name}
          </Typography.Title>
        }
        description={
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 8 }}>
              檢查單位：{project.unit}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.4 }}>
              檢查說明：{project.directions}
            </div>
          </div>
        }
      />
    </Card>
  );
};

export default ProjectCard;