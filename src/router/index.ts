import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { routes } from './routes';
import { LoadingGuard } from './guards';

// 创建路由
const router = createBrowserRouter(routes);

const Router: React.FC = () => {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <AntdApp>
        <LoadingGuard>
          <RouterProvider router={router} />
        </LoadingGuard>
      </AntdApp>
    </ConfigProvider>
  );
};

export default Router;