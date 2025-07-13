import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

import { Spin, Typography, Button, Layout, Form, Input, DatePicker, message } from 'antd';
import ProjectTopBar from '../components/ProjectTopBar';

export default function ProjectPage() {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 取得專案資料
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

  // 取得 userName
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

  // 按鈕事件
  const handleUserClick = () => navigate('/home');
  const handleHomeClick = () => navigate('/home');
  const handleHistory = () => {/* TODO: 實作歷史頁面跳轉 */};
  const handleSeasonSetting = () => {};
  const handleInfoSetting = () => { navigate(`/project/${id}/maintain-setting`); };

  // 季保養表單送出
  const handleSeasonFormFinish = async (values) => {
    setSaving(true);
    const { time_start, time_finish } = values;
    const { error } = await supabase.from('maintainance').insert({
      project_id: project.id,
      time_start: time_start ? time_start.format('YYYY-MM-DD HH:mm:ss') : null,
      time_finish: time_finish ? time_finish.format('YYYY-MM-DD HH:mm:ss') : null,
    });
    setSaving(false);
    if (!error) {
      message.success('保養時間已儲存');
      form.resetFields(['time_start', 'time_finish']);
    } else {
      message.error('儲存失敗: ' + error.message);
    }
  };

  if (loading) return <Spin tip="載入中..." style={{ marginTop: 80 }} />;
  if (!project) return <div style={{ padding: 32 }}><Typography.Text type="danger">找不到專案資料</Typography.Text><br /><Button style={{ background: 'rgba(25, 118, 210, 0.15)' }} onClick={() => navigate('/home')}>回主畫面</Button></div>;

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
        <Typography.Title level={3}>{project.name}</Typography.Title>
        <div>單位：{project.unit}</div>
        <div>說明：{project.directions}</div>
        {/* 季保養設定表單已移至獨立頁面 SeasonSetting */}
        <Button style={{ marginTop: 24, background: 'rgba(25, 118, 210, 0.15)' }} onClick={() => navigate('/home')}>回主畫面</Button>
      </Layout.Content>
    </Layout>
  );
}
