import React from 'react';
import type { RouteObject } from 'react-router-dom';

// 懒加载页面组件
const Login = React.lazy(() => import('@pages/Login/Login'));
const Register = React.lazy(() => import('@pages/Register/Register'));
const Dashboard = React.lazy(() => import('@pages/Dashboard/Dashboard'));
const HotelList = React.lazy(() => import('@pages/HotelList/HotelList'));
const HotelEdit = React.lazy(() => import('@pages/HotelEdit/HotelEdit'));
const PendingReview = React.lazy(() => import('@pages/PendingReview/PendingReview'));
const AllHotels = React.lazy(() => import('@pages/AllHotels/AllHotels'));
const NotFound = React.lazy(() => import('@pages/NotFound/NotFound'));

// Layout组件
const AdminLayout = React.lazy(() => import('@components/Layout/AdminLayout'));

// 权限守卫组件
import { AuthGuard, RoleGuard } from './guards';

export const routes: RouteObject[] = [
  {
    path: '/login',
    element: (
      <React.Suspense fallback={<div>加载中...</div>}>
        <Login />
      </React.Suspense>
    ),
  },
  {
    path: '/register',
    element: (
      <React.Suspense fallback={<div>加载中...</div>}>
        <Register />
      </React.Suspense>
    ),
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <React.Suspense fallback={<div>加载中...</div>}>
          <AdminLayout />
        </React.Suspense>
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: (
          <React.Suspense fallback={<div>加载中...</div>}>
            <Dashboard />
          </React.Suspense>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <React.Suspense fallback={<div>加载中...</div>}>
            <Dashboard />
          </React.Suspense>
        ),
      },
      // 商户路由
      {
        path: 'merchant/hotels',
        element: (
          <RoleGuard role="merchant">
            <React.Suspense fallback={<div>加载中...</div>}>
              <HotelList />
            </React.Suspense>
          </RoleGuard>
        ),
      },
      {
        path: 'merchant/hotels/new',
        element: (
          <RoleGuard role="merchant">
            <React.Suspense fallback={<div>加载中...</div>}>
              <HotelEdit />
            </React.Suspense>
          </RoleGuard>
        ),
      },
      {
        path: 'merchant/hotels/:id',
        element: (
          <RoleGuard role="merchant">
            <React.Suspense fallback={<div>加载中...</div>}>
              <HotelEdit />
            </React.Suspense>
          </RoleGuard>
        ),
      },
      // 管理员路由
      {
        path: 'admin/pending',
        element: (
          <RoleGuard role="admin">
            <React.Suspense fallback={<div>加载中...</div>}>
              <PendingReview />
            </React.Suspense>
          </RoleGuard>
        ),
      },
      {
        path: 'admin/hotels',
        element: (
          <RoleGuard role="admin">
            <React.Suspense fallback={<div>加载中...</div>}>
              <AllHotels />
            </React.Suspense>
          </RoleGuard>
        ),
      },
    ],
  },
  {
    path: '*',
    element: (
      <React.Suspense fallback={<div>加载中...</div>}>
        <NotFound />
      </React.Suspense>
    ),
  },
];