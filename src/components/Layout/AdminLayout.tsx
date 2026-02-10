import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  AppstoreOutlined,
  UserOutlined,
  LogoutOutlined,
  PlusOutlined,
  UnorderedListOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Avatar, Dropdown, Breadcrumb, Space } from 'antd';

const { Header, Sider, Content } = Layout;

// 简化面包屑生成
const getSimplifiedBreadcrumb = (pathname: string, isAdmin: boolean) => {
  const items = [];
  
  // 根据路径生成面包屑
  if (pathname === '/dashboard') {
    items.push({ title: '首页' });
  } else if (pathname === '/merchant/hotels') {
    items.push({ 
      title: <Link to="/dashboard">首页</Link> 
    });
    items.push({ title: '酒店管理' });
  } else if (pathname === '/merchant/hotels/new') {
    items.push({ 
      title: <Link to="/dashboard">首页</Link> 
    });
    items.push({ 
      title: <Link to="/merchant/hotels">酒店管理</Link> 
    });
    items.push({ title: '添加酒店' });
  } else if (pathname.match(/^\/merchant\/hotels\/\d+$/)) {
    items.push({ 
      title: <Link to="/dashboard">首页</Link> 
    });
    items.push({ 
      title: <Link to="/merchant/hotels">酒店管理</Link> 
    });
    items.push({ title: '编辑酒店' });
  } else if (pathname === '/admin/pending') {
    items.push({ 
      title: <Link to="/dashboard">首页</Link> 
    });
    items.push({ title: '待审核' });
  } else if (pathname === '/admin/hotels') {
    items.push({ 
      title: <Link to="/dashboard">首页</Link> 
    });
    items.push({ title: '所有酒店' });
  } else if (pathname.match(/^\/admin\/hotels\/\d+$/)) {
    items.push({ 
      title: <Link to="/dashboard">首页</Link> 
    });
    items.push({ 
      title: <Link to="/admin/hotels">所有酒店</Link> 
    });
    items.push({ title: '酒店详情' });
  } else {
    // 默认情况：首页
    items.push({ title: '首页' });
  }
  
  return items;
};

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    token: { colorBgContainer, borderRadiusLG, colorPrimary },
  } = theme.useToken();

  // 获取用户信息
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === 'admin';

  // 商户菜单项 - 重组结构
  const merchantMenuItems = [
    {
      key: 'hotel-management',
      icon: <BankOutlined />,
      label: '酒店管理',
      children: [
        {
          key: '/merchant/hotels',
          icon: <UnorderedListOutlined />,
          label: '我的酒店',
        },
        {
          key: '/merchant/hotels/new',
          icon: <PlusOutlined />,
          label: '添加酒店',
        },
      ],
    },
  ];

  // 管理员菜单项
  const adminMenuItems = [
    {
      key: '/admin/pending',
      icon: <CheckCircleOutlined />,
      label: '待审核',
    },
    {
      key: '/admin/hotels',
      icon: <AppstoreOutlined />,
      label: '所有酒店',
    },
  ];

  // 基础菜单项（所有角色都有）- 改为"首页"
  const baseMenuItems = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: '首页',
    },
  ];

  // 组合菜单项
  let menuItems = [...baseMenuItems];
  if (isAdmin) {
    menuItems = [...menuItems, ...adminMenuItems];
  } else {
    menuItems = [...menuItems, ...merchantMenuItems];
  }

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={200}
        collapsedWidth={80}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div 
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            background: '#001529',
            padding: '0 16px',
            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          {/* 完整标题（展开时显示） */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            transition: 'all 0.2s',
            opacity: collapsed ? 0 : 1,
            transform: `translateX(${collapsed ? '-20px' : '0'})`,
            width: collapsed ? 0 : 'auto',
            minWidth: collapsed ? 0 : 'auto',
            visibility: collapsed ? 'hidden' : 'visible',
          }}>
            <div style={{
              width: 32,
              height: 32,
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: 16,
            }}>
              🏨
            </div>
            <span style={{
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: '0.5px',
            }}>
              易宿酒店管理
            </span>
          </div>
          
          {/* 折叠时显示的图标 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            left: 0,
            right: 0,
            opacity: collapsed ? 1 : 0,
            transition: 'opacity 0.2s',
            visibility: collapsed ? 'visible' : 'hidden',
          }}>
            <div style={{
              width: 40,
              height: 40,
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
            }}>
              🏨
            </div>
          </div>
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['/dashboard']}
          selectedKeys={[location.pathname]}
          defaultOpenKeys={isAdmin ? [] : ['hotel-management']}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            borderRight: 0,
          }}
        />
      </Sider>
      
      <Layout style={{ 
        marginLeft: collapsed ? 80 : 200,
        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        <Header style={{ 
          padding: '0 24px',
          background: colorBgContainer,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 64,
          borderBottom: '1px solid #f0f0f0',
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 16,
          }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
            
            <Breadcrumb
              items={getSimplifiedBreadcrumb(location.pathname, isAdmin)}
              style={{ fontSize: 14 }}
            />
          </div>
          
          <Space>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                cursor: 'pointer',
                height: '100%',
                padding: '0 8px',
              }}>
                <Avatar 
                  size="default"
                  style={{ 
                    backgroundColor: colorPrimary,
                  }}
                  icon={<UserOutlined />}
                />
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center',
                  lineHeight: '1.2',
                }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{user?.email}</span>
                  <span style={{
                    fontSize: 12,
                    color: isAdmin ? '#52c41a' : colorPrimary,
                  }}>
                    {isAdmin ? '管理员' : '商户'}
                  </span>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>
        
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;