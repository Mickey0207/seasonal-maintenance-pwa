import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button } from 'antd';
import PageLayout from '../components/layout/PageLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { useProject } from '../hooks/useProject';
import { ROUTES } from '../config/constants';

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userName } = useAuth();
  const { project, loading, error } = useProject(id);


  if (loading) return <LoadingSpinner />;
  if (error || !project) {
    return <ErrorMessage message="找不到專案資料" onBack={() => navigate(ROUTES.HOME)} />;
  }

  return (
    <PageLayout
      userName={userName}
      projectName={project.name}
      projectId={id}
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '400px',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        <div className="modern-card" style={{ 
          width: '100%', 
          textAlign: 'center',
          padding: '40px',
          animation: 'fadeInUp 0.6s ease-out'
        }}>
          <Typography.Title level={2} style={{ 
            color: 'var(--text-primary)', 
            marginBottom: 24,
            background: 'var(--primary-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {project.name}
          </Typography.Title>
          <div style={{ 
            marginBottom: 16, 
            fontSize: 18, 
            color: 'var(--text-secondary)' 
          }}>
            檢查單位：{project.unit}
          </div>
          <div style={{ 
            marginBottom: 32, 
            fontSize: 16, 
            color: 'var(--text-muted)',
            lineHeight: 1.6
          }}>
            檢查說明：{project.directions}
          </div>
          <Button 
            className="modern-btn-primary"
            type="primary" 
            size="large"
            onClick={() => navigate(ROUTES.HOME)}
          >
            回主畫面
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
