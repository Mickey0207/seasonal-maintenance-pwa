import React, { useEffect, useState, useRef } from 'react';
import { Form, Input, Button, DatePicker, message, Card, Modal } from 'antd';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SaveResultModal from '../components/ui/SaveResultModal';
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
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [photoPath, setPhotoPath] = useState(null);
  const fileInputRef = useRef();
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
      // 取得案場資訊，包含 photo_path
      const { data: projectData } = await supabase
        .from('home_project_card')
        .select('name, unit, directions, photo_path')
        .eq('id', projectId)
        .single();
      if (projectData) {
        setProjectInfo(projectData);
        if (projectData.photo_path) {
          setPhotoPath(projectData.photo_path);
          // 使用與 ProjectCard 相同的方式生成圖片 URL
          try {
            const { data } = supabase.storage.from('home-project-card-photo').getPublicUrl(projectData.photo_path);
            if (data?.publicUrl) {
              setPreviewUrl(data.publicUrl);
            }
          } catch (error) {
            console.error('獲取圖片 URL 失敗:', error);
          }
        }
      }
      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line
  }, []);

  // 清除專案資料夾中的所有照片
  const clearProjectPhotos = async (projectId) => {
    try {
      // 列出該專案資料夾中的所有檔案
      const { data: files, error: listError } = await supabase.storage
        .from('home-project-card-photo')
        .list(projectId.toString());

      if (listError) {
        console.error('列出檔案失敗:', listError);
        return;
      }

      if (files && files.length > 0) {
        // 建立要刪除的檔案路徑列表
        const filesToDelete = files.map(file => `${projectId}/${file.name}`);
        
        // 批量刪除檔案
        const { error: deleteError } = await supabase.storage
          .from('home-project-card-photo')
          .remove(filesToDelete);

        if (deleteError) {
          console.error('刪除檔案失敗:', deleteError);
        } else {
          console.log(`已清除專案 ${projectId} 的 ${filesToDelete.length} 個檔案`);
        }
      }
    } catch (error) {
      console.error('清除照片時發生錯誤:', error);
    }
  };

  // 上傳新照片
  const uploadNewPhoto = async (projectId, file) => {
    try {
      // 生成唯一檔案名
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `project_${projectId}_${timestamp}.${fileExtension}`;
      const filePath = `${projectId}/${fileName}`;

      // 上傳檔案到 Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('home-project-card-photo')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      console.log(`新照片已上傳: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error('上傳照片失敗:', error);
      throw error;
    }
  };

  // 表單送出時寫入 home_project_card
  const onFinish = async (values) => {
    setLoading(true);
    const { name, unit, directions } = values;
    const projectId = id || 1; // 使用頁面ID作為專案ID
    
    try {
      // 1. 清除該專案ID資料夾中的所有照片
      await clearProjectPhotos(projectId);

      // 2. 上傳新照片（如果有的話）
      let uploadedPhotoPath = '';
      if (uploadFile) {
        uploadedPhotoPath = await uploadNewPhoto(projectId, uploadFile);
      }

      // 3. 更新資料表，將檔案路徑寫入對應的專案ID列
      const { error } = await supabase
        .from('home_project_card')
        .update({ 
          name, 
          unit, 
          directions, 
          photo_path: uploadedPhotoPath 
        })
        .eq('id', projectId);

      if (error) {
        setSaveSuccess(false);
        setModalMessage(`儲存失敗：${error.message || '未知錯誤'}`);
        setSaveResultVisible(true);
      } else {
        setSaveSuccess(true);
        setModalMessage('保養資訊已儲存，照片已更新');
        setSaveResultVisible(true);
        setProjectInfo({ name, unit, directions });
        setPhotoPath(uploadedPhotoPath);
        setUploadFile(null);
        
        // 更新預覽圖片
        if (uploadedPhotoPath) {
          try {
            const { data } = supabase.storage.from('home-project-card-photo').getPublicUrl(uploadedPhotoPath);
            if (data?.publicUrl) {
              setPreviewUrl(data.publicUrl);
            }
          } catch (error) {
            console.error('獲取新圖片 URL 失敗:', error);
          }
        } else {
          setPreviewUrl(null);
        }
      }
    } catch (error) {
      console.error('處理失敗:', error);
      setSaveSuccess(false);
      setModalMessage(`處理失敗：${error.message || '未知錯誤'}`);
      setSaveResultVisible(true);
    } finally {
      setLoading(false);
    }
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
        className={modalType === 'success' ? 'custom-success-modal' : 'modern-modal'}
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
          onHomeClick={() => navigate('/home')}
          drawerOpen={drawerOpen}
          setDrawerOpen={setDrawerOpen}
        />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {(!projectInfo.name && !projectInfo.unit && !projectInfo.directions) ? (
            <LoadingSpinner tip="載入專案資料中..." />
          ) : (
            <Card className="glass-morphism animate-fadeInUp" style={{ 
              width: 440, 
              borderRadius: 16, 
              boxShadow: 'var(--shadow-intense)',
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border-primary)'
            }}>
              <h2 className="gradient-text" style={{ 
                textAlign: 'center', 
                marginBottom: 24,
                fontSize: '1.5rem',
                fontWeight: 600
              }}>
                🔧 保養資訊設定
              </h2>
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
                <Form.Item 
                  label={<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>🏢 案場名稱</span>}
                  name="name" 
                  rules={[{ required: true, message: '請輸入案場名稱' }]}
                > 
                  <Input 
                    name="name" 
                    className="interactive-hover"
                    style={{ 
                      height: '48px',
                      borderRadius: '12px',
                      fontSize: '16px'
                    }} 
                  />
                </Form.Item>
                <Form.Item 
                  label={<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>🏭 檢查單位</span>}
                  name="unit" 
                  rules={[{ required: true, message: '請輸入檢查單位' }]}
                > 
                  <Input 
                    name="unit" 
                    className="interactive-hover"
                    style={{ 
                      height: '48px',
                      borderRadius: '12px',
                      fontSize: '16px'
                    }} 
                  />
                </Form.Item>
                <Form.Item 
                  label={<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>📋 檢查說明</span>}
                  name="directions"
                > 
                  <Input.TextArea 
                    name="directions" 
                    autoSize 
                    className="interactive-hover"
                    style={{ 
                      borderRadius: '12px',
                      fontSize: '16px'
                    }} 
                  />
                </Form.Item>
                {/* 圖片上傳欄位 */}
                <Form.Item 
                  label={<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>📸 上傳案場圖片</span>}
                >
                  <div 
                    className="interactive-hover"
                    style={{
                      border: '2px dashed var(--border-primary)',
                      borderRadius: '12px',
                      padding: '20px',
                      textAlign: 'center',
                      background: 'var(--bg-tertiary)',
                      cursor: 'pointer',
                      transition: 'var(--transition-smooth)',
                      minHeight: '120px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="案場圖片預覽" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '200px',
                          borderRadius: '8px',
                          objectFit: 'cover'
                        }} 
                      />
                    ) : (
                      <div className="animate-bounce" style={{
                        color: 'var(--text-accent)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <div style={{ fontSize: '2rem' }}>📸</div>
                        <div style={{ fontWeight: 500 }}>點擊上傳案場圖片</div>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        setUploadFile(file);
                        const reader = new FileReader();
                        reader.onload = ev => {
                          setPreviewUrl(ev.target.result);
                        };
                        reader.readAsDataURL(file);
                      } else {
                        // 若沒有選擇新檔案，若資料庫有圖片則顯示 publicUrl
                        if (photoPath) {
                          try {
                            const { data } = supabase.storage.from('home-project-card-photo').getPublicUrl(photoPath);
                            if (data?.publicUrl) {
                              setPreviewUrl(data.publicUrl);
                            }
                          } catch (error) {
                            console.error('獲取圖片 URL 失敗:', error);
                            setPreviewUrl(null);
                          }
                        } else {
                          setPreviewUrl(null);
                        }
                        setUploadFile(null);
                      }
                    }}
                  />
                </Form.Item>
                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    block 
                    loading={loading} 
                    className="interactive-click neon-glow"
                    style={{
                      height: '52px',
                      fontSize: '18px',
                      fontWeight: 600,
                      borderRadius: '12px',
                      background: 'var(--success-gradient)',
                      border: 'none',
                      boxShadow: 'var(--shadow-success)'
                    }}
                  >
                    儲存設定
                  </Button>
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
