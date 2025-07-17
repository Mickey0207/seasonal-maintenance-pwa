import { useState, useEffect, useCallback, useMemo } from 'react';
import { authUtils } from '../utils/auth';

// 自定義認證 Hook
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const { user: currentUser } = await authUtils.getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        const name = await authUtils.getUserName();
        setUserName(name);
      }
    } catch (error) {
      // Silent error handling in production
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const logout = useCallback(async () => {
    await authUtils.logout();
    setUser(null);
    setUserName('');
  }, []);

  const authData = useMemo(() => ({
    user,
    userName,
    loading,
    logout,
    isAuthenticated: !!user
  }), [user, userName, loading, logout]);

  return authData;
};