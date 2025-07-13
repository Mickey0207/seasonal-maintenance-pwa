


import React, { useEffect, useState } from 'react';
import { Form, Input, Button, DatePicker, message, Card } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { supabase } from '../lib/supabaseClient';
import ProjectTopBar from '../components/ProjectTopBar';
import { useNavigate, useParams } from 'react-router-dom';

export default function SeasonSetting() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({});
  const [projectInfo, setProjectInfo] = useState({ name: '', unit: '', directions: '' });
  const [userName, setUserName] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // 固定使用 id = 1 (數字)
      const projectId = 1;
      // 取得目前登入者 user 資訊
      let userResult = null;
      let userError = null;
      try {
        const { data, error } = await supabase.auth.getUser();
        userResult = data;
        userError = error;
        if (userError) {
          console.error('取得 user 失敗:', userError);
        }
        console.log('目前登入 user id:', userResult?.user?.id);
      } catch (e) {
        console.error('getUser 發生例外:', e);
      }
      // 取得用戶名稱
      if (userResult?.user) {
        const email = userResult.user.email;
        if (!email) {
          setUserName('用戶');
        } else {
          try {
            const { data, error } = await supabase.from('user_names').select('user').eq('email', email).single();
            if (!error && data && data.user) {
              setUserName(data.user);
            } else if (email) {
              setUserName(email);
            } else {
              setUserName('用戶');
            }
          } catch (e) {
            if (email) {
              setUserName(email);
            } else {
              setUserName('用戶');
            }
          }
        }
      } else {
        setUserName('用戶');
      }
      if (!projectId) {
        setLoading(false);
        return;
      }
      // 取得案場資訊
      const { data: projectData } = await supabase
        .from('home_project_card')
        .select('name, unit, directions')
        .eq('id', projectId)
        .single();
      if (projectData) {
        setProjectInfo({
          name: projectData.name || '',
          unit: projectData.unit || '',
          directions: projectData.directions || '',
        });

        // 將案場名稱寫入 maintainance_setting 的 name 欄位
        try {
          await supabase
            .from('maintainance_setting')
            .upsert({ name: projectData.name });
        } catch (e) {
          console.error('寫入 maintainance_setting 失敗:', e);
        }
      }
      // 取得季保養設定
      const { data: maintainData } = await supabase
        .from('maintainance_setting')
        .select('*')
        .eq('project_id', projectId)
        .single();
      if (maintainData) {
        setInitialValues({
          year_q: maintainData.year_q || '',
          time_start: maintainData.time_start ? dayjs(maintainData.time_start) : null,
          time_finish: maintainData.time_finish ? dayjs(maintainData.time_finish) : null,
        });
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    const projectId = 1;
    const payload = {
      name: projectInfo.name,
      year_q: values.year_q,
      time_start: values.time_start ? values.time_start.format('YYYY-MM-DD') : null,
      time_finish: values.time_finish ? values.time_finish.format('YYYY-MM-DD') : null,
    };
    console.log('寫入 maintainance_setting payload:', payload);
    const { error: settingError } = await supabase
      .from('maintainance_setting')
      .upsert(payload, { onConflict: ['name', 'year_q'] });
    if (settingError) {
      console.error('maintainance_setting upsert error:', settingError);
      message.error('儲存失敗');
    } else {
      message.success('儲存成功');
    }
    setLoading(false);
  };

  // 統一側邊欄事件
  const handleUserClick = () => navigate('/home');
  const handleHistory = () => {};
  const handleSeasonSetting = () => {};
  const handleInfoSetting = () => { navigate(`/project/${id}/maintain-setting`); };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: 'var(--background-color)', display: 'flex', flexDirection: 'column' }}>
      <ProjectTopBar
        userName={userName}
        projectName={projectInfo.name}
        id={id}
        onUserClick={handleUserClick}
        onHistory={handleHistory}
        onSeasonSetting={handleSeasonSetting}
        onInfoSetting={handleInfoSetting}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {(!projectInfo.name && !projectInfo.unit && !projectInfo.directions) ? (
          <div style={{ color: '#888', fontSize: 18 }}>載入中...</div>
        ) : (
          <Card style={{ width: 440, borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: 24 }}>本次季保養設定</h2>
            <Form
              layout="vertical"
              key={projectInfo.name + projectInfo.unit + projectInfo.directions + (initialValues.year_q || '')}
              initialValues={{
                ...initialValues,
                name: projectInfo.name,
                unit: projectInfo.unit,
                directions: projectInfo.directions
              }}
              onFinish={onFinish}
            >
              <Form.Item label="案場名稱" name="name">
                <Input disabled />
              </Form.Item>
              <Form.Item label="檢查單位" name="unit">
                <Input disabled />
              </Form.Item>
              <Form.Item label="檢查說明" name="directions">
                <Input.TextArea disabled autoSize />
              </Form.Item>
              <Form.Item label="季別" name="year_q" rules={[{ required: true, message: '請輸入季別' }]}> 
                <Input placeholder="例如：2024 Q3" />
              </Form.Item>
              <Form.Item label="保養時間起" name="time_start" rules={[{ required: true, message: '請選擇保養開始時間' }]}> 
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
              <Form.Item label="保養時間迄" name="time_finish" rules={[{ required: true, message: '請選擇保養結束時間' }]}> 
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>儲存</Button>
              </Form.Item>
              <Form.Item>
                <Button
                  danger
                  block
                  onClick={async () => {
                    if (!projectInfo.name) {
                      message.error('找不到案場名稱');
                      return;
                    }
                    setLoading(true);
                    try {
                      const { error } = await supabase
                        .from('maintainance_setting')
                        .delete()
                        .eq('name', projectInfo.name);
                      if (error) {
                        message.error('重置失敗');
                      } else {
                        message.success('已重置所有保養時間');
                      }
                    } catch (e) {
                      message.error('重置時發生錯誤');
                    }
                    setLoading(false);
                  }}
                  style={{ marginTop: 8 }}
                >
                  重置此案場的所有保養時間
                </Button>
              </Form.Item>
            </Form>
          </Card>
        )}
      </div>
    </div>
  );
}
