import { supabase } from '../lib/supabaseClient';
import { dbUtils } from './database';

// 專案範本工具函數
export const projectTemplateUtils = {
  // 從專案1創建範本
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

      // 創建範本物件
      const template = {
        projectData: {
          name: project1.name,
          unit: project1.unit,
          directions: project1.directions,
          photo_path: project1.photo_path
        },
        maintenanceSettings: maintenanceSettings || []
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

      // 生成唯一的專案名稱和標識符
      const timestamp = new Date().getTime();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const uniqueName = `${templateName}_${timestamp}`;
      const uniqueIdentifier = `${timestamp}_${randomSuffix}`;

      // 複製專案照片（如果存在）
      let newPhotoPath = null;
      if (template.projectData.photo_path) {
        try {
          // 下載原始照片
          const { data: photoData, error: downloadError } = await supabase.storage
            .from('home-project-card-photo')
            .download(template.projectData.photo_path);
          
          if (!downloadError && photoData) {
            // 生成新的照片路徑
            const fileExtension = template.projectData.photo_path.split('.').pop();
            newPhotoPath = `${uniqueIdentifier}.${fileExtension}`;
            
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
      const newProjectData = {
        name: uniqueName,
        unit: `${template.projectData.unit || '預設單位'}_${uniqueIdentifier}`, // 確保單位也是唯一的
        directions: template.projectData.directions || '預設說明',
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