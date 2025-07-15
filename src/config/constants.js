// 應用程式常數配置
export const APP_CONFIG = {
  HOME_TOPBAR_TITLE: 'ACL 季保養',
  HOME_SIDEBAR_TITLE: 'ACL 季保養',
  APP_NAME: '季保養管理系統',
  APP_SHORT_NAME: '季保養'
};

export const ROUTES = {
  HOME: '/home',
  LOGIN: '/',
  REGISTER: '/register',
  PROJECT: '/project/:id',
  PROJECT_SEASON_SETTING: '/project/:id/season-setting',
  PROJECT_MAINTAIN_SETTING: '/project/:id/maintain-setting',
  PROJECT_ADD_MAINTENANCE_DATA: '/project/:id/addmaintainancedata',
  PROJECT_VIEW_MAINTENANCE_DATA: '/project/:id/viewmaintainancedata',
  PROJECT_EXPORT_EXCEL: '/project/:id/export-excel'
};

export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_DATA: 'user_data'
};