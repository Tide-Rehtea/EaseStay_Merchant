import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store/modules/auth';

export const useAuth = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  // 检查认证状态
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      return false;
    }
    
    try {
      const user = JSON.parse(userStr);
      return { token, user };
    } catch {
      return false;
    }
  };

  // 重定向到登录页
  const redirectToLogin = (redirectUrl?: string) => {
    const url = redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login';
    navigate(url);
  };

  // 检查权限
  const hasRole = (role: 'admin' | 'merchant') => {
    return user?.role === role;
  };

  // 获取用户信息
  const getUserInfo = () => {
    return user;
  };

  // 自动刷新token（如果需要）
  useEffect(() => {
    const checkToken = () => {
      const auth = checkAuth();
      if (!auth && isAuthenticated) {
        logout();
        redirectToLogin(window.location.pathname);
      }
    };

    // 每分钟检查一次token
    const interval = setInterval(checkToken, 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, logout, navigate]);

  return {
    isAuthenticated,
    user,
    checkAuth,
    redirectToLogin,
    hasRole,
    getUserInfo,
    logout,
  };
};