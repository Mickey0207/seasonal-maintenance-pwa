import { supabase } from '../lib/supabaseClient';

// 數據庫操作工具函數
export const dbUtils = {
  // 項目相關
  projects: {
    async getAll() {
      const { data, error } = await supabase
        .from('home_project_card')
        .select('*');
      return { data: data || [], error };
    },

    async getById(id) {
      const { data, error } = await supabase
        .from('home_project_card')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    },

    async create(project) {
      const { data, error } = await supabase
        .from('home_project_card')
        .insert([project]);
      return { data, error };
    },


  },

  // 用戶相關
  users: {
    async getAll() {
      const { data, error } = await supabase.from('user_names').select('user, email');
      return { data: data || [], error };
    },

    async getByEmail(email) {
      const { data, error } = await supabase
        .from('user_names')
        .select('user')
        .eq('email', email);
      return { data: data || [], error };
    },

    async create(userData) {
      const { data, error } = await supabase
        .from('user_names')
        .insert([userData]);
      return { data, error };
    },

    async checkUsernameExists(username) {
      const { data, error } = await supabase
        .from('user_names')
        .select('user')
        .eq('user', username);
      return { exists: data && data.length > 0, error };
    }
  },


  // 保養資料相關
  maintenanceData: {
    async create(record) {
      const { data, error } = await supabase
        .from('maintainance_data')
        .insert(record);
      return { data, error };
    },

    async getByProject(projectName) {
      const { data, error } = await supabase
        .from('maintainance_data')
        .select('*')
        .eq('project', projectName);
      return { data: data || [], error };
    },

    async getOptions(projectName) {
      const { data, error } = await supabase
        .from('maintainance_data')
        .select('floor, thing, location')
        .eq('project', projectName);
      
      return { data: data || [], error };
    },

    async delete(id) {
      const { data, error } = await supabase
        .from('maintainance_data')
        .delete()
        .eq('id', id);
      return { data, error };
    }
  },

  // 保養照片相關 (專門給 /project/1 使用)
  maintenancePhoto: {
    async getByProject(projectName) {
      const { data, error } = await supabase
        .from('maintainance_photo')
        .select('*')
        .eq('project', projectName)
        .order('created_at', { ascending: false })
        .limit(10000); // Increase row limit to fetch all records
      return { data: data || [], error };
    },
    async create(record) {
      try {
        const { files, addWatermark, ...recordData } = record;
        
        if (!files || files.length === 0) {
          return { success: false, error: '沒有檔案需要上傳' };
        }

        // Upload files to storage first
        const uploadedFiles = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${i}.${fileExt}`;
          const filePath = `${recordData.project_name}/${fileName}`;

          // Convert file to actual File object if needed
          let fileToUpload = file.originFileObj || file;
          
          // Add watermark if requested
          if (addWatermark && fileToUpload.type.startsWith('image/')) {
            try {
              fileToUpload = await dbUtils.maintenancePhoto.addWatermarkToImage(fileToUpload, recordData);
            } catch (error) {
              // Continue with original file if watermark fails
            }
          }

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('maintainance-data-photo')
            .upload(filePath, fileToUpload);

          if (uploadError) {
            return { success: false, error: `檔案上傳失敗: ${uploadError.message}` };
          }

          uploadedFiles.push({
            ...recordData,
            photo_path: filePath,
            photo_name: file.name
          });
        }

        // Insert records into database
        const { data, error } = await supabase
          .from('maintainance_photo')
          .insert(uploadedFiles);

        if (error) {
          return { success: false, error: `資料庫插入失敗: ${error.message}` };
        }

        return { success: true, data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    async addWatermarkToImage(file, recordData) {
      return new Promise((resolve, reject) => {
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          try {
            
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw original image
            ctx.drawImage(img, 0, 0);
            
            // Calculate font size
            const fontSize = Math.max(20, Math.min(img.width / 25, 50));
            
            // Set up text style
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 4;
            ctx.textAlign = 'left';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            
            // Create watermark text
            const line1 = `${recordData.project_name || 'N/A'} - ${recordData.floor || 'N/A'} - ${recordData.thing || 'N/A'} - ${recordData.location || 'N/A'}`;
            const line2 = `日期: ${recordData.maintainance_time || 'N/A'} | 人員: ${recordData.maintainance_user || 'N/A'}`;
            
            
            // Position text
            const x = 30;
            const y1 = canvas.height - fontSize - 30;
            const y2 = canvas.height - 15;
            
            // Draw first line
            ctx.strokeText(line1, x, y1);
            ctx.fillText(line1, x, y1);
            
            // Draw second line
            ctx.strokeText(line2, x, y2);
            ctx.fillText(line2, x, y2);
            
            
            // Convert to blob
            canvas.toBlob((blob) => {
              if (blob) {
                const watermarkedFile = new File([blob], file.name, { 
                  type: file.type,
                  lastModified: Date.now()
                });
                resolve(watermarkedFile);
              } else {
                reject(new Error('Failed to create blob from canvas'));
              }
            }, file.type, 0.95);
            
          } catch (error) {
            reject(error);
          }
        };
        
        img.onerror = (error) => {
          reject(error);
        };
        
        // Create object URL and load image
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;
        
        // Clean up object URL after a delay
        setTimeout(() => {
          URL.revokeObjectURL(objectUrl);
        }, 10000);
      });
    },

    async getByProject(projectName) {
      const { data, error } = await supabase
        .from('maintainance_photo')
        .select('*')
        .eq('project', projectName);
      return { data: data || [], error };
    },

    async getOptions(projectName) {
      const { data, error } = await supabase
        .from('maintainance_photo')
        .select('floor, thing, location')
        .eq('project', projectName);
      
      if (error) return { data: { floors: [], things: [], locations: [] }, error };
      
      const floors = [...new Set(data.map(item => item.floor).filter(Boolean))];
      const things = [...new Set(data.map(item => item.thing).filter(Boolean))];
      const locations = [...new Set(data.map(item => item.location).filter(Boolean))];
      
      return { data: { floors, things, locations }, error: null };
    },

    async delete(id) {
      const { data, error } = await supabase
        .from('maintainance_photo')
        .delete()
        .eq('id', id);
      return { data, error };
    }
  },

  // 保養設定相關
  maintenanceSettings: {
    async getByProject(projectName) {
      const { data, error } = await supabase
        .from('maintainance_setting')
        .select('*')
        .eq('name', projectName)
        .single();
      return { data, error };
    },

    async create(setting) {
      const { data, error } = await supabase
        .from('maintainance_setting')
        .insert(setting);
      return { data, error };
    },

    async update(projectName, setting) {
      const { data, error } = await supabase
        .from('maintainance_setting')
        .upsert(setting)
        .eq('name', projectName);
      return { data, error };
    }
  },

  // 存儲相關
  storage: {
    getImageUrl(bucket, path) {
      if (!path) return '';
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data?.publicUrl || '';
    },

    async uploadFile(bucket, path, file) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file);
      return { data, error };
    },

    async deleteImage(bucket, path) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .remove([path]);
      return { data, error };
    }
  }
};