import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { Spin } from 'antd';

// 认证守卫
export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, checkAuth } = useAuth();
  const location = useLocation();

  // 检查认证状态
  React.useEffect(() => {
    const auth = checkAuth();
    if (!auth) {
      // 可以在这里触发重新登录
    }
  }, [checkAuth, location]);

  if (!isAuthenticated) {
    // 保存当前路径，登录后跳转回来
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};

// 角色守卫
export const RoleGuard: React.FC<{ 
  children: React.ReactNode;
  role: 'admin' | 'merchant';
}> = ({ children, role }) => {
  const { hasRole, user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!hasRole(role)) {
    // 权限不足，跳转到仪表板
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// 加载中组件
export const LoadingGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // 模拟加载
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return <>{children}</>;
};