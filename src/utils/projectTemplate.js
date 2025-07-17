import { supabase } from '../lib/supabaseClient';
import { dbUtils } from './database';

// 專案範本工具函數
export const projectTemplateUtils = {
  // 從專案1創建範本（用於新專案創建，但不包含密碼保護功能）
  async createTemplateFromProject1() {
    try {
      // 獲取專案1的基本資料
      const { data: project1, error: projectError } = await dbUtils.projects.getById(1);
      if (projectError) throw projectError;
      
      if (!project1) {
        throw new Error('找不到專案1的資料');
      }

      // 獲取專案1的保養設定
      const { data: maintenanceSettings, error: settingsError } = await supabase
        .from('maintainance_setting')
        .select('*')
        .eq('name', project1.name);
      
      if (settingsError) throw settingsError;

      // 獲取專案1的保養資料
      const { data: maintenanceData, error: dataError } = await dbUtils.maintenanceData.getByProject(project1.name);
      if (dataError) throw dataError;

      // 獲取專案1的保養照片資料
      const { data: maintenancePhotos, error: photoError } = await dbUtils.maintenancePhoto.getByProject(project1.name);
      if (photoError) throw photoError;

      // 創建範本物件
      const template = {
        projectData: {
          name: project1.name,
          unit: project1.unit,
          directions: project1.directions,
          photo_path: project1.photo_path
        },
        maintenanceSettings: maintenanceSettings || [],
        maintenanceData: maintenanceData || [],
        maintenancePhotos: maintenancePhotos || []
      };

      return { template, error: null };
    } catch (error) {
      console.error('創建範本失敗:', error);
      return { template: null, error };
    }
  },

  // 使用範本創建新專案
  async createProjectFromTemplate(templateName = '新專案') {
    try {
      // 獲取範本
      const { template, error: templateError } = await this.createTemplateFromProject1();
      if (templateError) throw templateError;

      // 使用用戶輸入的專案名稱，不添加後綴
      const uniqueName = templateName;

      // 檢查專案名稱是否已存在
      const { data: existingProjects, error: checkError } = await supabase
        .from('home_project_card')
        .select('name')
        .eq('name', uniqueName);
      
      if (checkError) throw checkError;
      
      if (existingProjects && existingProjects.length > 0) {
        throw new Error(`專案名稱 "${uniqueName}" 已存在，請使用不同的名稱`);
      }

      // 複製專案照片（如果存在）
      let newPhotoPath = null;
      if (template.projectData.photo_path) {
        try {
          // 下載原始照片
          const { data: photoData, error: downloadError } = await supabase.storage
            .from('home-project-card-photo')
            .download(template.projectData.photo_path);
          
          if (!downloadError && photoData) {
            // 生成新的照片路徑，使用專案名稱
            const fileExtension = template.projectData.photo_path.split('.').pop();
            const timestamp = new Date().getTime();
            newPhotoPath = `${templateName}_${timestamp}.${fileExtension}`;
            
            // 上傳新照片
            const { error: uploadError } = await supabase.storage
              .from('home-project-card-photo')
              .upload(newPhotoPath, photoData);
            
            if (uploadError) {
              console.warn('照片複製失敗，將使用預設照片:', uploadError);
              newPhotoPath = null;
            }
          }
        } catch (photoError) {
          console.warn('照片處理失敗，將使用預設照片:', photoError);
          newPhotoPath = null;
        }
      }

      // 創建新專案
      const baseUnit = (template.projectData.unit || '預設單位').replace(/_\d+_[a-z0-9]+$/i, '');
      const baseDirections = (template.projectData.directions || '預設說明').replace(/_\d+_[a-z0-9]+$/i, '');
      
      const newProjectData = {
        name: uniqueName,
        unit: baseUnit,
        directions: baseDirections,
        photo_path: newPhotoPath
      };

      console.log('準備創建專案，資料:', newProjectData);
      const { data: newProject, error: createError } = await dbUtils.projects.create(newProjectData);
      if (createError) {
        console.error('創建專案失敗，詳細錯誤:', createError);
        throw createError;
      }
      console.log('專案創建成功:', newProject);

      // 複製保養設定
      if (template.maintenanceSettings && template.maintenanceSettings.length > 0) {
        const newSettings = template.maintenanceSettings.map(setting => ({
          ...setting,
          id: undefined, // 移除原始ID讓資料庫自動生成
          name: uniqueName // 使用新專案名稱
        }));

        console.log('準備複製保養設定:', newSettings);
        const { error: settingsError } = await supabase
          .from('maintainance_setting')
          .insert(newSettings);
        
        if (settingsError) {
          console.warn('保養設定複製失敗:', settingsError);
        } else {
          console.log('保養設定複製成功');
        }
      }

      // 複製保養資料
      if (template.maintenanceData && template.maintenanceData.length > 0) {
        const newMaintenanceData = template.maintenanceData.map(data => ({
          ...data,
          id: undefined, // 移除原始ID讓資料庫自動生成
          project: uniqueName // 使用新專案名稱
        }));

        console.log('準備複製保養資料:', newMaintenanceData);
        const { error: dataError } = await supabase
          .from('maintainance_data')
          .insert(newMaintenanceData);
        
        if (dataError) {
          console.warn('保養資料複製失敗:', dataError);
        } else {
          console.log('保養資料複製成功');
        }
      }

      // 複製保養照片資料結構（不包含實際照片文件）
      if (template.maintenancePhotos && template.maintenancePhotos.length > 0) {
        const newMaintenancePhotos = template.maintenancePhotos.map(photo => ({
          project: uniqueName, // 使用新專案名稱
          project_name: uniqueName,
          floor: photo.floor,
          thing: photo.thing,
          location: photo.location,
          maintainance_time: photo.maintainance_time,
          maintainance_user: photo.maintainance_user,
          // 不複製 photo_path 和 photo_name，讓用戶重新上傳照片
          photo_path: null,
          photo_name: null,
          created_at: new Date().toISOString()
        }));

        console.log('準備複製保養照片結構:', newMaintenancePhotos);
        const { error: photoError } = await supabase
          .from('maintainance_photo')
          .insert(newMaintenancePhotos);
        
        if (photoError) {
          console.warn('保養照片結構複製失敗:', photoError);
        } else {
          console.log('保養照片結構複製成功');
        }
      }

      return { 
        project: newProject?.[0] || newProject, 
        error: null,
        message: `成功創建新專案: ${uniqueName}`
      };
    } catch (error) {
      console.error('使用範本創建專案失敗:', error);
      return { 
        project: null, 
        error,
        message: `創建專案失敗: ${error.message}`
      };
    }
  },

  // 獲取範本預覽資訊
  async getTemplatePreview() {
    try {
      const { template, error } = await this.createTemplateFromProject1();
      if (error) throw error;

      return {
        preview: {
          name: template.projectData.name,
          unit: template.projectData.unit,
          directions: template.projectData.directions,
          settingsCount: template.maintenanceSettings?.length || 0,
          dataCount: template.maintenanceData?.length || 0,
          photoCount: template.maintenancePhotos?.length || 0,
          hasPhoto: !!template.projectData.photo_path
        },
        error: null
      };
    } catch (error) {
      return {
        preview: null,
        error
      };
    }
  }
};