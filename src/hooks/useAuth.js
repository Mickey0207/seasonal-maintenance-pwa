import { useState, useEffect } from 'react';
import { authUtils } from '../utils/auth';

// 自定義認證 Hook
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const { user: currentUser } = await authUtils.getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          const name = await authUtils.getUserName();
          setUserName(name);
        }
      } catch (error) {
        console.error('獲取用戶資料失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const logout = async () => {
    await authUtils.logout();
    setUser(null);
    setUserName('');
  };

  return {
    user,
    userName,
    loading,
    logout,
    isAuthenticated: !!user
  };
};