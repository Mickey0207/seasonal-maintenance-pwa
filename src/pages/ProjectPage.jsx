import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Form, Select, Card, message, Alert, FloatButton } from 'antd';
import { SaveOutlined, WarningOutlined, SettingOutlined } from '@ant-design/icons';
import PageLayout from '../components/layout/PageLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import SaveResultModal from '../components/ui/SaveResultModal';
import { useAuth } from '../hooks/useAuth';
import { useProject } from '../hooks/useProject';
import { dbUtils } from '../utils/database';
import { supabase } from '../lib/supabaseClient';
import { ROUTES } from '../config/constants';
import dayjs from 'dayjs';

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userName } = useAuth();
  const { project, loading, error } = useProject(id);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [allMaintenanceOptions, setAllMaintenanceOptions] = useState([]); // 儲存所有原始選項
  const [filteredThings, setFilteredThings] = useState([]); // 篩選後的檢查項目
  const [filteredLocations, setFilteredLocations] = useState([]); // 篩選後的檢查位置
  const [submittedLocations, setSubmittedLocations] = useState([]); // 儲存已提交的樓層、檢查項目、檢查位置組合
  const [availableFloors, setAvailableFloors] = useState([]); // 儲存最終可用的樓層選項
  const [photoFile, setPhotoFile] = useState(null); // 儲存單張照片
  const [photoPreview, setPhotoPreview] = useState(''); // 照片預覽URL
  const [enableWatermark, setEnableWatermark] = useState(true); // 浮水印開關
  const [showSettingAlert, setShowSettingAlert] = useState(false);
  const [settingDisabled, setSettingDisabled] = useState(false);
  const [saveResultVisible, setSaveResultVisible] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (project) {
      checkMaintenanceSetting();
      fetchMaintenanceOptions();
      fetchSubmittedLocations(); // Fetch submitted locations
      form.setFieldsValue({
        maintainance_time: dayjs().format('YYYY-MM-DD'),
        maintainance_user: userName
      });
    }
  }, [project, userName, form]);

  // 清理照片預覽 URL
  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  // 監聽表單變更和浮水印開關，更新預覽
  useEffect(() => {
    if (photoFile && enableWatermark) {
      updatePreview();
    }
  }, [enableWatermark]);

  // 監聽表單欄位變更，更新預覽
  const handleFormChange = (changedValues, allValues) => {
    if ('floor' in changedValues) {
      form.setFieldsValue({ thing: undefined, location: undefined });
    }
    if ('thing' in changedValues) {
      form.setFieldsValue({ location: undefined });
    }
    // Always re-filter options after any value change
    filterOptions();
    
    // 如果有照片且啟用浮水印，更新預覽
    if (photoFile && enableWatermark) {
      setTimeout(() => updatePreview(), 100); // 延遲一點確保表單值已更新
    }
  };

  const checkMaintenanceSetting = async () => {
    try {
      const { data, error } = await dbUtils.maintenanceSettings.getByProject(project.name);

      if (error && error.code !== 'PGRST116') {
        return;
      }

      const today = dayjs();
      if (!data) {
        setShowSettingAlert(true);
        setSettingDisabled(true);
      } else if (data.time_start && data.time_finish) {
        const startDate = dayjs(data.time_start);
        const endDate = dayjs(data.time_finish);
        
        if (today.isBefore(startDate) || today.isAfter(endDate)) {
          setShowSettingAlert(true);
          setSettingDisabled(true);
        }
      }
    } catch (error) {
      // Silent error handling
    }
  };

  const fetchMaintenanceOptions = async () => {
    try {
      const { data, error } = await dbUtils.maintenanceData.getOptions(project.name);
      if (error) throw error;
      setAllMaintenanceOptions(data);
    } catch (error) {
    }
  };

  const fetchSubmittedLocations = async () => {
    try {
      const { data, error } = await dbUtils.maintenancePhoto.getByProject(project.name);
      if (error) throw error;
      // Store submitted locations as a set of composite keys (floor_thing_location)
      const submitted = new Set(data.map(item => `${item.floor}_${item.thing}_${item.location}`));
      setSubmittedLocations(Array.from(submitted));
    } catch (error) {
    }
  };

  const filterOptions = useCallback(() => {

    const currentSelectedFloor = form.getFieldValue('floor');
    const currentSelectedThing = form.getFieldValue('thing');


    const submittedSet = new Set(submittedLocations);

    // Step 1: Determine truly available locations for the currently selected floor and thing
    let newFilteredLocations = [];
    if (currentSelectedFloor && currentSelectedThing) {
      newFilteredLocations = allMaintenanceOptions
        .filter(item => item.floor === currentSelectedFloor && item.thing === currentSelectedThing)
        .map(item => item.location)
        .filter(Boolean) // Remove null/undefined/empty strings
        .filter(location => {
          const compositeKey = `${currentSelectedFloor}_${currentSelectedThing}_${location}`;
          return !submittedSet.has(compositeKey);
        });
      setFilteredLocations([...new Set(newFilteredLocations)]);
    } else {
      setFilteredLocations([]);
    }

    // Step 2: Determine truly available things for the currently selected floor
    // A thing is available if, for its floor, it has at least one unsubmitted location
    let newFilteredThings = [];
    if (currentSelectedFloor) {
      const thingsForSelectedFloor = allMaintenanceOptions
        .filter(item => item.floor === currentSelectedFloor)
        .map(item => item.thing)
        .filter(Boolean); // Remove null/undefined/empty strings

      newFilteredThings = [...new Set(thingsForSelectedFloor.filter(thing => {
        const hasAvailableLocation = allMaintenanceOptions
          .filter(item => item.floor === currentSelectedFloor && item.thing === thing)
          .some(item => {
            const compositeKey = `${currentSelectedFloor}_${thing}_${item.location}`;
            return !submittedSet.has(compositeKey);
          });
        return hasAvailableLocation;
      }))];
      setFilteredThings(newFilteredThings);
    } else {
      setFilteredThings([]);
    }

    // Step 3: Determine truly available floors
    // A floor is available if it has at least one thing that has at least one unsubmitted location
    const trulyAvailableFloors = new Set();
    allMaintenanceOptions.forEach(option => {
      const floor = option.floor;
      if (!floor) return; // Skip if floor is null/undefined

      const thingsForThisFloor = allMaintenanceOptions
        .filter(item => item.floor === floor)
        .map(item => item.thing)
        .filter(Boolean); // Remove null/undefined/empty strings

      const hasAvailableThingInFloor = thingsForThisFloor.some(thing => {
        const hasAvailableLocationForThisThing = allMaintenanceOptions
          .filter(item => item.floor === floor && item.thing === thing)
          .some(item => {
            const compositeKey = `${floor}_${thing}_${item.location}`;
            return !submittedSet.has(compositeKey);
          });
        return hasAvailableLocationForThisThing;
      });

      if (hasAvailableThingInFloor) {
        trulyAvailableFloors.add(floor);
      }
    });
    setAvailableFloors(Array.from(trulyAvailableFloors));

  }, [allMaintenanceOptions, form, submittedLocations]);

  useEffect(() => {
    // Ensure filterOptions runs when dependencies change, and also on initial load if data is present
    // or if project is loaded and data is empty (to correctly set initial empty states)
    if (project && (allMaintenanceOptions.length > 0 || submittedLocations.length > 0 || (allMaintenanceOptions.length === 0 && submittedLocations.length === 0))) {
      filterOptions();
    }
  }, [allMaintenanceOptions, submittedLocations, filterOptions, project]);

  // 生成帶浮水印的預覽圖片
  const generatePreviewWithWatermark = async (file) => {
    if (!enableWatermark) {
      return URL.createObjectURL(file);
    }

    try {
      const formValues = form.getFieldsValue();
      const watermarkedFile = await addWatermarkToPhoto(file, formValues);
      return URL.createObjectURL(watermarkedFile);
    } catch (error) {
      // 如果浮水印失敗，返回原始圖片
      return URL.createObjectURL(file);
    }
  };

  // 處理照片選擇
  const handlePhotoChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setPhotoFile(file);
        // 創建帶浮水印的預覽URL
        const previewUrl = await generatePreviewWithWatermark(file);
        setPhotoPreview(previewUrl);
      } else {
        message.error('請選擇圖片檔案');
      }
    }
  };

  // 更新預覽圖片（當表單變更或浮水印開關變更時）
  const updatePreview = async () => {
    if (photoFile) {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
      const newPreviewUrl = await generatePreviewWithWatermark(photoFile);
      setPhotoPreview(newPreviewUrl);
    }
  };

  // 移除照片
  const removePhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(null);
    setPhotoPreview('');
  };

  // 添加浮水印到圖片
  const addWatermarkToPhoto = async (file, formData) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          canvas.width = img.width;
          canvas.height = img.height;

          // 繪製原始圖片
          ctx.drawImage(img, 0, 0);

          // 浮水印內容
          const watermarkLines = [
            `案場名稱: ${project?.name || formData.project || ''}`,
            `檢查項目: ${formData.thing || ''}`,
            `檢查位置: ${formData.location || ''}`,
            `檢查日期: ${formData.maintainance_time || dayjs().format('YYYY/MM/DD')}`
          ];

          // 計算字體大小和間距
          const baseFontSize = Math.max(16, Math.min(img.width / 40, 24));
          const fontSize = baseFontSize * 1.25;
          const lineHeight = fontSize + 6;
          const padding = 30;

          // 計算浮水印背景尺寸
          ctx.font = `${fontSize}px Arial`;
          const maxTextWidth = Math.max(...watermarkLines.map(line => ctx.measureText(line).width));
          const backgroundWidth = maxTextWidth + padding * 2;
          const backgroundHeight = watermarkLines.length * lineHeight + padding * 2;

          // 浮水印位置（右下角，貼齊下緣）
          const bgX = canvas.width - backgroundWidth - 20; // 右邊距離邊緣 20px
          const bgY = canvas.height - backgroundHeight; // 貼齊下緣，無下邊距

          // 繪製灰色背景
          ctx.fillStyle = 'rgba(128, 128, 128, 0.8)';
          ctx.fillRect(bgX, bgY, backgroundWidth, backgroundHeight);

          // 設定文字樣式
          ctx.font = `${fontSize}px Arial`;
          ctx.fillStyle = 'white';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';

          // 繪製浮水印文字
          watermarkLines.forEach((line, index) => {
            const textX = bgX + padding;
            const textY = bgY + padding + (index * lineHeight);
            ctx.fillText(line, textX, textY);
          });


          // 轉換為檔案
          canvas.toBlob((blob) => {
            if (blob) {
              const watermarkedFile = new File([blob], file.name, { type: file.type });
              resolve(watermarkedFile);
            } else {
              reject(new Error('無法創建浮水印圖片'));
            }
          }, file.type, 0.9);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('圖片載入失敗'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (values) => {
    if (!photoFile) {
      message.error('請選擇一張照片');
      return;
    }

    setSubmitting(true);

    try {
      let fileToUpload = photoFile;

      // 如果啟用浮水印，添加浮水印
      if (enableWatermark) {
        fileToUpload = await addWatermarkToPhoto(photoFile, values);
      }

      // 上傳照片到 Supabase Storage
      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      // 使用專案 ID 作為資料夾路徑
      const filePath = `${project.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('maintainance-data-photo')
        .upload(filePath, fileToUpload);

      if (uploadError) {
        throw new Error(`照片上傳失敗: ${uploadError.message}`);
      }

      // 從 maintainance_data 表中查找匹配的資料
      const { data: maintenanceData, error: queryError } = await supabase
        .from('maintainance_data')
        .select('company, direction')
        .eq('project', project.name)
        .eq('floor', values.floor)
        .eq('thing', values.thing)
        .eq('location', values.location)
        .single();


      // 準備要插入的資料
      const insertData = {
        project: project.name,
        floor: values.floor,
        thing: values.thing,
        location: values.location,
        maintainance_user: values.maintainance_user,
        maintainance_time: values.maintainance_time,
        photo_path: filePath,
        direction: maintenanceData?.direction || '季保養檢查',
        company: maintenanceData?.company || '維護公司'
      };


      // 儲存保養資料到資料庫 (使用 maintainance_photo 表)
      const { data, error } = await supabase
        .from('maintainance_photo')
        .insert(insertData);


      if (error) {
        throw new Error(`資料庫儲存失敗: ${error.message}`);
      }

      // 檢查是否成功插入（即使 data 為 null，只要沒有 error 就算成功）
      if (!error) {
        setSaveSuccess(true);
        setSaveMessage('保養資料已成功儲存！');
        form.resetFields();
        form.setFieldsValue({
          maintainance_time: dayjs().format('YYYY-MM-DD'),
          maintainance_user: userName
        });
        removePhoto();
        await fetchSubmittedLocations();
      } else {
        setSaveSuccess(false);
        setSaveMessage(error?.message || '儲存失敗，請重試');
      }
      setSaveResultVisible(true);
    } catch (error) {
      setSaveSuccess(false);
      setSaveMessage(error.message || '儲存失敗，請重試');
      setSaveResultVisible(true);
    } finally {
      setSubmitting(false);
    }
  };


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
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '20px'
      }}>
        {showSettingAlert && (
          <Alert
            message="保養設定提醒"
            description="此專案尚未設定保養期間或目前不在保養期間內，請先進行設定。"
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            style={{ marginBottom: 16 }}
            action={
              <Button
                size="small"
                type="primary"
                onClick={() => navigate(`${ROUTES.PROJECT_MAINTAIN_SETTING}/${id}`)}
              >
                前往設定
              </Button>
            }
          />
        )}

        <Card 
          className="modern-card glass-morphism animate-fadeInUp"
          title={
            <div style={{ 
              fontSize: '1.8rem', 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <span style={{ 
                fontSize: '2rem',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
              }}>🔧</span>
              季保養作業系統
            </div>
          }
          style={{ 
            marginBottom: 32,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            onValuesChange={handleFormChange}
            disabled={settingDisabled}
            className="animate-slideInLeft"
            style={{ 
              maxWidth: '700px', 
              margin: '0 auto',
              animationDelay: '0.2s',
              animationFillMode: 'both',
              padding: '20px'
            }}
          >
            <Form.Item
              label={
                <span style={{ 
                  color: 'var(--text-primary)', 
                  fontWeight: 600,
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '20px' }}>🏢</span>
                  樓層選擇
                </span>
              }
              name="floor"
              rules={[{ required: true, message: '請選擇樓層' }]}
            >
              <Select
                placeholder="🔍 請選擇樓層"
                options={availableFloors.map(floor => ({ label: floor, value: floor }))}
                style={{ 
                  width: '100%',
                  height: '48px'
                }}
                className="modern-select"
              />
            </Form.Item>

            <Form.Item
              label={
                <span style={{ 
                  color: 'var(--text-primary)', 
                  fontWeight: 600,
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '20px' }}>🔍</span>
                  檢查項目
                </span>
              }
              name="thing"
              rules={[{ required: true, message: '請選擇檢查項目' }]}
            >
              <Select
                placeholder="⚙️ 請選擇檢查項目"
                options={filteredThings.map(thing => ({ label: thing, value: thing }))}
                style={{ 
                  width: '100%',
                  height: '48px'
                }}
                className="modern-select"
              />
            </Form.Item>

            <Form.Item
              label={
                <span style={{ 
                  color: 'var(--text-primary)', 
                  fontWeight: 600,
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '20px' }}>📍</span>
                  檢查位置
                </span>
              }
              name="location"
              rules={[{ required: true, message: '請選擇檢查位置' }]}
            >
              <Select
                placeholder="🎯 請選擇檢查位置"
                options={filteredLocations.map(location => ({ label: location, value: location }))}
                style={{ 
                  width: '100%',
                  height: '48px'
                }}
                className="modern-select"
              />
            </Form.Item>

            <Form.Item
              label={
                <span style={{ 
                  color: 'var(--text-primary)', 
                  fontWeight: 600,
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '20px' }}>📅</span>
                  保養日期
                </span>
              }
              name="maintainance_time"
              rules={[{ required: true, message: '請輸入保養日期' }]}
            >
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  value={form.getFieldValue('maintainance_time') || ''}
                  onChange={(e) => form.setFieldValue('maintainance_time', e.target.value)}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '12px 16px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '500',
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    color: '#333',
                    colorScheme: 'none',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    e.target.style.background = 'rgba(102, 126, 234, 0.05)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e1e5e9';
                    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                    e.target.style.background = 'rgba(255,255,255,0.8)';
                  }}
                />
                <style jsx>{`
                  input[type="date"]::-webkit-calendar-picker-indicator {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 6px;
                    padding: 4px;
                    cursor: pointer;
                    filter: invert(1);
                  }
                  input[type="date"]::-webkit-calendar-picker-indicator:hover {
                    background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
                    transform: scale(1.1);
                  }
                  input[type="date"]::-webkit-inner-spin-button,
                  input[type="date"]::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                  }
                `}</style>
              </div>
            </Form.Item>

            <Form.Item
              label={
                <span style={{ 
                  color: 'var(--text-primary)', 
                  fontWeight: 600,
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '20px' }}>👤</span>
                  保養人員
                </span>
              }
              name="maintainance_user"
              rules={[{ required: true, message: '請輸入保養人員' }]}
            >
              <input
                type="text"
                placeholder="👨‍🔧 請輸入保養人員姓名"
                value={form.getFieldValue('maintainance_user') || ''}
                onChange={(e) => form.setFieldValue('maintainance_user', e.target.value)}
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '12px 16px',
                  border: '2px solid #e1e5e9',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  background: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  color: '#333'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  e.target.style.background = 'rgba(102, 126, 234, 0.05)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e1e5e9';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                  e.target.style.background = 'rgba(255,255,255,0.8)';
                }}
              />
            </Form.Item>


            <Form.Item
              label={
                <span style={{ 
                  color: 'var(--text-primary)', 
                  fontWeight: 600,
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '20px' }}>📷</span>
                  照片上傳
                </span>
              }
              required
            >
              <div style={{ 
                border: photoFile ? '3px solid #52c41a' : '3px dashed #667eea', 
                borderRadius: '16px', 
                padding: '24px', 
                textAlign: 'center',
                background: photoFile 
                  ? 'linear-gradient(135deg, rgba(82, 196, 26, 0.1) 0%, rgba(82, 196, 26, 0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                boxShadow: photoFile 
                  ? '0 8px 32px rgba(82, 196, 26, 0.2)'
                  : '0 8px 32px rgba(102, 126, 234, 0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {!photoFile ? (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      style={{ display: 'none' }}
                      id="photo-upload"
                    />
                    <label 
                      htmlFor="photo-upload" 
                      style={{ 
                        cursor: 'pointer',
                        display: 'block',
                        padding: '32px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <div style={{ 
                        fontSize: '64px', 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '20px',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                      }}>📸</div>
                      <div style={{ 
                        fontSize: '20px', 
                        fontWeight: 600,
                        color: '#667eea',
                        marginBottom: '8px'
                      }}>點擊上傳照片</div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#8c8c8c',
                        fontWeight: 500
                      }}>支援 JPG、PNG、WEBP 等格式</div>
                      <div style={{
                        marginTop: '16px',
                        padding: '8px 16px',
                        background: 'rgba(102, 126, 234, 0.1)',
                        borderRadius: '20px',
                        display: 'inline-block',
                        fontSize: '12px',
                        color: '#667eea',
                        fontWeight: 600
                      }}>
                        ✨ 支援自動浮水印
                      </div>
                    </label>
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    {/* 4:3 比例的圖片容器 */}
                    <div 
                      style={{ 
                        position: 'relative',
                        width: '100%',
                        paddingBottom: '75%', // 4:3 比例 (3/4 = 0.75)
                        overflow: 'hidden',
                        borderRadius: '12px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => document.getElementById('photo-upload').click()}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
                      }}
                    >
                      <img 
                        src={photoPreview} 
                        alt="預覽" 
                        style={{ 
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover', // 填滿容器並保持比例
                          borderRadius: '12px'
                        }} 
                      />
                      
                      {/* 懸停提示 */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0';
                      }}
                      >
                        <div style={{
                          color: 'white',
                          fontSize: '18px',
                          fontWeight: '600',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📸</div>
                          點擊重新選擇照片
                        </div>
                      </div>

                      {/* 刪除按鈕 */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto();
                        }}
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          border: 'none',
                          background: 'rgba(255, 77, 79, 0.9)',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(255, 77, 79, 0.4)',
                          zIndex: 10,
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.1)';
                          e.target.style.boxShadow = '0 6px 16px rgba(255, 77, 79, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                          e.target.style.boxShadow = '0 4px 12px rgba(255, 77, 79, 0.4)';
                        }}
                      >
                        ×
                      </button>
                    </div>
                    
                    {/* 照片資訊 */}
                    <div style={{ 
                      marginTop: '16px', 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                      <div style={{ 
                        fontSize: '16px', 
                        color: '#52c41a',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '20px' }}>✅</span>
                        {photoFile.name}
                      </div>
                    </div>
                    
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      style={{ display: 'none' }}
                      id="photo-upload"
                    />
                  </div>
                )}
              </div>
            </Form.Item>

            <Form.Item>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                padding: '20px',
                background: enableWatermark 
                  ? 'linear-gradient(135deg, rgba(82, 196, 26, 0.1) 0%, rgba(82, 196, 26, 0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(140, 140, 140, 0.1) 0%, rgba(140, 140, 140, 0.05) 100%)',
                borderRadius: '16px',
                border: enableWatermark ? '2px solid #52c41a' : '2px solid #d9d9d9',
                transition: 'all 0.3s ease',
                boxShadow: enableWatermark 
                  ? '0 4px 16px rgba(82, 196, 26, 0.2)'
                  : '0 4px 16px rgba(0,0,0,0.05)',
                cursor: 'pointer'
              }}
              onClick={() => setEnableWatermark(!enableWatermark)}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: enableWatermark 
                    ? 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)'
                    : '#d9d9d9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: enableWatermark ? '0 2px 8px rgba(82, 196, 26, 0.3)' : 'none'
                }}>
                  {enableWatermark && (
                    <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>✓</span>
                  )}
                </div>
                <label style={{ 
                  color: 'var(--text-primary)', 
                  fontWeight: 600,
                  cursor: 'pointer',
                  margin: 0,
                  fontSize: '16px',
                  flex: 1
                }}>
                  <span style={{ fontSize: '20px', marginRight: '8px' }}>🏷️</span>
                  自動添加浮水印
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#8c8c8c', 
                    marginTop: '4px',
                    fontWeight: 400
                  }}>
                    包含案場名稱、檢查項目、位置、日期等資訊
                  </div>
                </label>
              </div>
            </Form.Item>

            <Form.Item style={{ marginTop: '32px' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                disabled={settingDisabled}
                icon={<SaveOutlined style={{ fontSize: '20px' }} />}
                size="large"
                style={{
                  width: '100%',
                  height: '64px',
                  fontSize: '18px',
                  fontWeight: 700,
                  background: submitting 
                    ? 'linear-gradient(135deg, #bfbfbf 0%, #8c8c8c 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '16px',
                  boxShadow: submitting 
                    ? '0 4px 16px rgba(0,0,0,0.1)'
                    : '0 8px 32px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (!submitting && !settingDisabled) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!submitting && !settingDisabled) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.4)';
                  }
                }}
              >
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '12px'
                }}>
                  {submitting ? (
                    <>
                      <span style={{ 
                        display: 'inline-block',
                        width: '20px',
                        height: '20px',
                        border: '2px solid #ffffff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></span>
                      正在儲存資料...
                    </>
                  ) : (
                    <>
                      <SaveOutlined style={{ fontSize: '20px' }} />
                      💾 儲存保養資料
                    </>
                  )}
                </span>
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <FloatButton
          icon={<SettingOutlined />}
          tooltip="專案設定"
          onClick={() => navigate(`${ROUTES.PROJECT_MAINTAIN_SETTING}/${id}`)}
          style={{
            right: 24,
            bottom: 24
          }}
        />

        <SaveResultModal
          visible={saveResultVisible}
          success={saveSuccess}
          message={saveMessage}
          onClose={() => setSaveResultVisible(false)}
        />

      </div>
    </PageLayout>
  );
}