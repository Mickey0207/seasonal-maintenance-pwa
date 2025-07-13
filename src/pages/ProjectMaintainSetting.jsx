import React, { useEffect, useState } from 'react';
import { Form, Input, Button, DatePicker, message, Card, Modal } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { supabase } from '../lib/supabaseClient';
import ProjectTopBar from '../components/ProjectTopBar';
import { useNavigate, useParams } from 'react-router-dom';

export default function ProjectMaintainSetting() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({});
  const [projectInfo, setProjectInfo] = useState({ name: '', unit: '', directions: '' });
  const [userName, setUserName] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('success'); // 'success' | 'error'
  const navigate = useNavigate();

  useEffect(() => {
    // message.success('測試訊息'); // 測試用可移除
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
      } catch (e) {
        userError = e;
      }
      let email = userResult && userResult.user ? userResult.user.email : null;
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
        setProjectInfo(projectData);
      }
      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line
  }, []);

  // 表單送出時寫入 home_project_card
  const onFinish = async (values) => {
    setLoading(true);
    const { name, unit, directions } = values;
    const { error } = await supabase
      .from('home_project_card')
      .update({ name, unit, directions })
      .eq('id', 1);
    if (error) {
      setModalType('error');
      setModalMessage(`儲存失敗：${error.message || '未知錯誤'}`);
      setShowModal(true);
    } else {
      setModalType('success');
      setModalMessage('儲存成功');
      setShowModal(true);
      setProjectInfo({ name, unit, directions });
    }
    setLoading(false);
  };
  // ...existing code...

  return (
    <>
      <Modal
        open={showModal}
        onOk={() => setShowModal(false)}
        onCancel={() => setShowModal(false)}
        okText="確認"
        cancelButtonProps={{ style: { display: 'none' } }}
        centered
        width={340}
        bodyStyle={{ textAlign: 'center', fontSize: 18, padding: 32 }}
        title={modalType === 'success' ? '成功' : '錯誤'}
        afterClose={() => {
          // 若要導頁可在這裡加 navigate('/home')
        }}
      >
        {modalMessage}
      </Modal>
      <div style={{ minHeight: '100vh', width: '100vw', background: 'var(--background-color)', display: 'flex', flexDirection: 'column' }}>
        <ProjectTopBar
          projectName={projectInfo.name || "載入中..."}
          userName={userName}
          id={id}
          drawerOpen={drawerOpen}
          setDrawerOpen={setDrawerOpen}
        />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {(!projectInfo.name && !projectInfo.unit && !projectInfo.directions) ? (
            <div style={{ color: '#888', fontSize: 18 }}>載入中...</div>
          ) : (
            <Card style={{ width: 440, borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
              <h2 style={{ textAlign: 'center', marginBottom: 24 }}>保養資訊設定</h2>
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
                <Form.Item label="案場名稱" name="name" rules={[{ required: true, message: '請輸入案場名稱' }]}> 
                  <Input name="name" style={{ border: '2px solid #1976d2', borderRadius: 8, boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.08)' }} />
                </Form.Item>
                <Form.Item label="檢查單位" name="unit" rules={[{ required: true, message: '請輸入檢查單位' }]}> 
                  <Input name="unit" style={{ border: '2px solid #1976d2', borderRadius: 8, boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.08)' }} />
                </Form.Item>
                <Form.Item label="檢查說明" name="directions"> 
                  <Input.TextArea name="directions" autoSize style={{ border: '2px solid #1976d2', borderRadius: 8, boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.08)' }} />
                </Form.Item>
                {/* 已移除季別、保養時間起、保養時間迄欄位 */}
                <Form.Item>
                  <Button type="primary" htmlType="submit" block loading={loading} style={{ background: 'rgba(25, 118, 210, 0.15)' }}>儲存</Button>
                </Form.Item>
                {/* 已移除重置此案場的所有保養時間按鈕 */}
              </Form>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
