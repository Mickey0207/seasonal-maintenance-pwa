import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Spin, Typography, Button, Layout, Table } from 'antd';
import ProjectTopBar from '../components/ProjectTopBar';

export default function History() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    async function fetchProject() {
      setLoading(true);
      const { data, error } = await supabase.from('home_project_card').select('*').eq('id', id).single();
      if (!error && data) {
        setProject(data);
      } else {
        setProject(null);
      }
      setLoading(false);
    }
    fetchProject();
  }, [id]);

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

  useEffect(() => {
    async function fetchRecords() {
      setLoading(true);
      const { data, error } = await supabase
        .from('maintainance')
        .select('*')
        .eq('project_id', id)
        .order('time_start', { ascending: false });
      if (!error && data) {
        setRecords(data);
      } else {
        setRecords([]);
      }
      setLoading(false);
    }
    if (id) fetchRecords();
  }, [id]);

  const handleUserClick = () => navigate('/home');
  const handleHomeClick = () => navigate('/home');
  const handleHistory = () => {};
  const handleSeasonSetting = () => navigate(`/project/${id}/season-setting`);
  const handleInfoSetting = () => navigate(`/project/${id}/maintain-setting`);

  if (loading) return <Spin tip="載入中..." style={{ marginTop: 80 }} />;
  if (!project) return <div style={{ padding: 32 }}><Typography.Text type="danger">找不到專案資料</Typography.Text><br /><Button style={{ background: 'rgba(25, 118, 210, 0.15)' }} onClick={() => navigate('/home')}>回主畫面</Button></div>;

  const columns = [
    { title: '保養起始', dataIndex: 'time_start', key: 'time_start', render: t => t ? new Date(t).toLocaleString() : '-' },
    { title: '保養結束', dataIndex: 'time_finish', key: 'time_finish', render: t => t ? new Date(t).toLocaleString() : '-' },
    { title: '建立時間', dataIndex: 'created_at', key: 'created_at', render: t => t ? new Date(t).toLocaleString() : '-' },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--project-bg, #e3eafc)' }}>
      <ProjectTopBar
        userName={userName}
        projectName={project.name}
        id={id}
        onUserClick={handleUserClick}
        onHomeClick={() => navigate('/home')}
        onHistory={handleHistory}
        onSeasonSetting={handleSeasonSetting}
        onInfoSetting={handleInfoSetting}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />
      <Layout.Content style={{ width: '100vw', minHeight: 'calc(100vh - 64px)', padding: '32px 16px', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography.Title level={3}>{project.name} - 季保養歷史紀錄</Typography.Title>
        <Table
          dataSource={records}
          columns={columns}
          rowKey={r => r.id}
          style={{ width: 600, marginTop: 24 }}
          pagination={{ pageSize: 10 }}
        />
        <Button style={{ marginTop: 24, background: 'rgba(25, 118, 210, 0.15)' }} onClick={() => navigate(`/project/${id}`)}>回專案主頁</Button>
      </Layout.Content>
    </Layout>
  );
}