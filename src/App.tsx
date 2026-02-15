import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import styled from 'styled-components';

// 引入Ant Design样式
import 'antd/dist/reset.css';

// 懒加载页面组件
const Login = React.lazy(() => import('./pages/Login/Login'));
const Register = React.lazy(() => import('./pages/Register/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard/Dashboard'));
const HotelList = React.lazy(() => import('./pages/HotelList/HotelList'));
const HotelEdit = React.lazy(() => import('./pages/HotelEdit/HotelEdit'));
const PendingReview = React.lazy(() => import('./pages/PendingReview/PendingReview'));
const AllHotels = React.lazy(() => import('./pages/AllHotels/AllHotels'));
const NotFound = React.lazy(() => import('./pages/NotFound/NotFound'));
const HotelView = React.lazy(() => import('./pages/HotelView/HotelView'));

// Layout组件
const AdminLayout = React.lazy(() => import('./components/Layout/AdminLayout'));

// 加载中组件
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  }}>
    <Spin size="large" tip="加载中..." />
  </div>
);

// 简单的认证检查
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// 简单的角色检查
const getUserRole = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    const user = JSON.parse(userStr);
    return user.role; // 'merchant' 或 'admin'
  } catch {
    return null;
  }
};

// 认证守卫组件
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// 角色守卫组件
const RoleGuard: React.FC<{ 
  children: React.ReactNode;
  role: 'admin' | 'merchant';
}> = ({ children, role }) => {
  const userRole = getUserRole();
  
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }
  
  if (userRole !== role) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// 全局样式容器
const AppContainer = styled.div`
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
`;

function App() {
  return (
    <AppContainer>
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 6,
            colorLink: '#1890ff',
          },
        }}
      >
        <AntdApp>
          <BrowserRouter>
            <Routes>
              {/* 公开路由 */}
              <Route path="/login" element={
                <React.Suspense fallback={<LoadingFallback />}>
                  <Login />
                </React.Suspense>
              } />
              
              <Route path="/register" element={
                <React.Suspense fallback={<LoadingFallback />}>
                  <Register />
                </React.Suspense>
              } />
              
              {/* 需要登录的路由 */}
              <Route path="/" element={
                <AuthGuard>
                  <React.Suspense fallback={<LoadingFallback />}>
                    <AdminLayout />
                  </React.Suspense>
                </AuthGuard>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                
                <Route path="dashboard" element={
                  <React.Suspense fallback={<LoadingFallback />}>
                    <Dashboard />
                  </React.Suspense>
                } />
                
                {/* 商户路由 */}
                <Route path="merchant/hotels" element={
                  <RoleGuard role="merchant">
                    <React.Suspense fallback={<LoadingFallback />}>
                      <HotelList />
                    </React.Suspense>
                  </RoleGuard>
                } />
                
                <Route path="merchant/hotels/new" element={
                  <RoleGuard role="merchant">
                    <React.Suspense fallback={<LoadingFallback />}>
                      <HotelEdit />
                    </React.Suspense>
                  </RoleGuard>
                } />
                
                <Route path="merchant/hotels/:id" element={
                  <RoleGuard role="merchant">
                    <React.Suspense fallback={<LoadingFallback />}>
                      <HotelEdit />
                    </React.Suspense>
                  </RoleGuard>
                } />

                <Route path="merchant/hotelView/:id" element={
                  <RoleGuard role="merchant">
                    <React.Suspense fallback={<LoadingFallback />}>
                      <HotelView />
                    </React.Suspense>
                  </RoleGuard>
                } />
                
                {/* 管理员路由 */}
                <Route path="admin/pending" element={
                  <RoleGuard role="admin">
                    <React.Suspense fallback={<LoadingFallback />}>
                      <PendingReview />
                    </React.Suspense>
                  </RoleGuard>
                } />
                
                <Route path="admin/hotels" element={
                  <RoleGuard role="admin">
                    <React.Suspense fallback={<LoadingFallback />}>
                      <AllHotels />
                    </React.Suspense>
                  </RoleGuard>
                } />
              </Route>
              
              {/* 404页面 */}
              <Route path="*" element={
                <React.Suspense fallback={<LoadingFallback />}>
                  <NotFound />
                </React.Suspense>
              } />
            </Routes>
          </BrowserRouter>
        </AntdApp>
      </ConfigProvider>
    </AppContainer>
  );
}

export default App;