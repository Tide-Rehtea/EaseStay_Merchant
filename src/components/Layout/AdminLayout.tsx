import React, { useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
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
} from "@ant-design/icons";
import {
  Layout,
  Menu,
  Button,
  theme,
  Avatar,
  Dropdown,
  Breadcrumb,
  Space,
  ConfigProvider,
} from "antd";

const { Header, Sider, Content } = Layout;

// 简化面包屑生成
const getSimplifiedBreadcrumb = (pathname: string, isAdmin: boolean) => {
  const items = [];

  // 根据路径生成面包屑
  if (pathname === "/dashboard") {
    items.push({ title: "首页" });
  } else if (pathname === "/merchant/hotels") {
    items.push({
      title: <Link to="/dashboard">首页</Link>,
    });
    items.push({ title: "酒店管理" });
  } else if (pathname === "/merchant/hotels/new") {
    items.push({
      title: <Link to="/dashboard">首页</Link>,
    });
    items.push({
      title: <Link to="/merchant/hotels">酒店管理</Link>,
    });
    items.push({ title: "添加酒店" });
  } else if (pathname.match(/^\/merchant\/hotels\/\d+$/)) {
    items.push({
      title: <Link to="/dashboard">首页</Link>,
    });
    items.push({
      title: <Link to="/merchant/hotels">酒店管理</Link>,
    });
    items.push({ title: "编辑酒店" });
  } else if (pathname.match(/^\/merchant\/hotelView\/\d+$/)) {
    items.push({
      title: <Link to="/dashboard">首页</Link>,
    });
    items.push({
      title: <Link to="/merchant/hotels">酒店管理</Link>,
    });
    items.push({ title: "酒店详情" });
  } else if (pathname === "/admin/pending") {
    items.push({
      title: <Link to="/dashboard">首页</Link>,
    });
    items.push({ title: "待审核" });
  } else if (pathname === "/admin/hotels") {
    items.push({
      title: <Link to="/dashboard">首页</Link>,
    });
    items.push({ title: "所有酒店" });
  } else if (pathname.match(/^\/admin\/hotels\/\d+$/)) {
    items.push({
      title: <Link to="/dashboard">首页</Link>,
    });
    items.push({
      title: <Link to="/admin/hotels">所有酒店</Link>,
    });
    items.push({ title: "酒店详情" });
  } else {
    // 默认情况：首页
    items.push({ title: "首页" });
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
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === "admin";

  // 商户菜单项 - 重组结构
  const merchantMenuItems = [
    {
      key: "hotel-management",
      icon: <BankOutlined />,
      label: "酒店管理",
      children: [
        {
          key: "/merchant/hotels",
          icon: <UnorderedListOutlined />,
          label: "我的酒店",
        },
        {
          key: "/merchant/hotels/new",
          icon: <PlusOutlined />,
          label: "添加酒店",
        },
      ],
    },
  ];

  // 管理员菜单项
  const adminMenuItems = [
    {
      key: "/admin/pending",
      icon: <CheckCircleOutlined />,
      label: "待审核",
    },
    {
      key: "/admin/hotels",
      icon: <AppstoreOutlined />,
      label: "所有酒店",
    },
  ];

  // 基础菜单项（所有角色都有）- 改为"首页"
  const baseMenuItems = [
    {
      key: "/dashboard",
      icon: <HomeOutlined />,
      label: "首页",
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
      key: "logout",
      label: "退出登录",
      icon: <LogoutOutlined />,
      onClick: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      },
    },
  ];

  // 自定义主题配置，优化菜单动画
  const menuTheme = {
    token: {
      colorPrimary,
      borderRadius: 6,
      motionDurationSlow: "0.2s",
      motionDurationMid: "0.15s",
      motionDurationFast: "0.1s",
    },
    components: {
      Menu: {
        itemHeight: 48,
        itemPaddingInline: 24,
        itemMarginBlock: 4,
        itemBorderRadius: 8,
        itemSelectedBg: "rgba(24, 144, 255, 0.1)",
        itemSelectedColor: colorPrimary,
        itemHoverBg: "rgba(255, 255, 255, 0.05)",
        itemActiveBg: "rgba(24, 144, 255, 0.15)",
        subMenuItemBg: "transparent",
        itemMarginInline: 12,
      },
    },
  };

  return (
    <Layout
      style={{ minHeight: "100vh", background: "#f0f2f5", overflow: "hidden" }}
    >
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={200}
        collapsedWidth={80}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            background: "#001529",
            padding: "0 16px",
            transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {/* 完整标题（展开时显示） */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              transition: "all 0.2s",
              opacity: collapsed ? 0 : 1,
              transform: `translateX(${collapsed ? "-20px" : "0"})`,
              visibility: collapsed ? "hidden" : "visible",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                background: "rgba(255,255,255,0.2)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: 16,
              }}
            >
              🏨
            </div>
            <span
              style={{
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: "0.5px",
              }}
            >
              易宿酒店管理
            </span>
          </div>

          {/* 折叠时显示的图标 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              left: 0,
              right: 0,
              opacity: collapsed ? 1 : 0,
              transition: "opacity 0.2s",
              visibility: collapsed ? "visible" : "hidden",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                background: "rgba(255,255,255,0.2)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              🏨
            </div>
          </div>
        </div>

        <ConfigProvider theme={menuTheme}>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={["/dashboard"]}
            selectedKeys={[location.pathname]}
            defaultOpenKeys={isAdmin ? [] : ["hotel-management"]}
            items={menuItems}
            onClick={({ key }) => {
              const menuItem = document.querySelector(
                `.ant-menu-item[data-menu-id*="${key}"]`,
              );
              if (menuItem) {
                menuItem.classList.add("menu-click-feedback");
                setTimeout(() => {
                  menuItem.classList.remove("menu-click-feedback");
                }, 300);
              }
              navigate(key);
            }}
            style={{
              borderRight: 0,
              padding: "12px 0",
            }}
          />
        </ConfigProvider>

        {/* 添加自定义CSS动画 */}
        <style>{`
          .ant-menu-dark .ant-menu-item,
          .ant-menu-dark .ant-menu-submenu-title {
            transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
            position: relative;
            overflow: hidden;
          }
          
          .ant-menu-dark .ant-menu-item-selected {
            background: linear-gradient(90deg, rgba(24, 144, 255, 0.1), rgba(24, 144, 255, 0.15)) !important;
            transform: translateX(4px);
            box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
          }
          
          .ant-menu-dark .ant-menu-item:hover {
            background: rgba(255, 255, 255, 0.08) !important;
            transform: translateX(2px);
          }
          
          .menu-click-feedback {
            animation: menu-click 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          
          @keyframes menu-click {
            0% {
              transform: scale(0.98);
              background: rgba(24, 144, 255, 0.2) !important;
            }
            50% {
              transform: scale(1.02);
            }
            100% {
              transform: scale(1);
            }
          }
          
          .ant-menu-dark .ant-menu-submenu-title {
            transition: all 0.3s ease !important;
          }
          
          .ant-menu-dark .ant-menu-submenu-open > .ant-menu-submenu-title {
            background: rgba(255, 255, 255, 0.05) !important;
          }
          
          .ant-menu-dark .ant-menu-sub .ant-menu-item {
            padding-left: 48px !important;
            margin: 2px 0 !important;
          }
          
          .ant-menu-dark .ant-menu-sub .ant-menu-item:hover {
            padding-left: 52px !important;
          }
          
          .ant-menu-dark .ant-menu-sub .ant-menu-item-selected {
            padding-left: 52px !important;
            border-left: 3px solid ${colorPrimary};
          }
          
          .ant-menu-item .anticon,
          .ant-menu-submenu-title .anticon {
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          
          .ant-menu-item:hover .anticon,
          .ant-menu-submenu-title:hover .anticon {
            transform: scale(1.1);
          }
          
          .ant-menu-item-selected .anticon {
            transform: scale(1.15);
            filter: drop-shadow(0 2px 4px rgba(24, 144, 255, 0.3));
          }
        `}</style>
      </Sider>

      {/* 右侧布局 - 固定为flex列布局 */}
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 200,
          transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden", // 防止整个右侧滚动
        }}
      >
        {/* 头部 - 固定高度，不滚动 */}
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: 64,
            borderBottom: "1px solid #f0f0f0",
            flexShrink: 0, // 防止被压缩
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 48,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
              className="menu-toggle-btn"
            />

            <Breadcrumb
              items={getSimplifiedBreadcrumb(location.pathname, isAdmin)}
              style={{ fontSize: 14 }}
            />
          </div>

          <Space>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  height: "100%",
                  padding: "0 8px",
                  transition: "all 0.2s",
                  borderRadius: 6,
                }}
                className="user-info-hover"
              >
                <Avatar
                  size="default"
                  style={{
                    backgroundColor: colorPrimary,
                    transition: "all 0.2s",
                  }}
                  icon={<UserOutlined />}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    lineHeight: "1.2",
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 500 }}>
                    {user?.email}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: isAdmin ? "#52c41a" : colorPrimary,
                    }}
                  >
                    {isAdmin ? "管理员" : "商户"}
                  </span>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* 内容区域 - 滚动区域 */}
        <Content
          style={{
            flex: 1, // 占据剩余空间
            overflow: "auto", // 只有内容区域滚动
            padding: "24px 16px",
            background: "#f0f2f5",
          }}
        >
          <div
            style={{
              minHeight: "100%",
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>

      {/* 全局动画样式 */}
      <style>{`
        .menu-toggle-btn:hover {
          background: rgba(0, 0, 0, 0.04) !important;
          transform: scale(1.05);
        }
        
        .menu-toggle-btn:active {
          transform: scale(0.95);
        }
        
        .user-info-hover:hover {
          background: rgba(0, 0, 0, 0.02);
        }
        
        .user-info-hover:hover .ant-avatar {
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
        }
        
        .ant-breadcrumb a {
          transition: all 0.2s;
        }
        
        .ant-breadcrumb a:hover {
          color: ${colorPrimary} !important;
          transform: translateY(-1px);
        }
      `}</style>
    </Layout>
  );
};

export default AdminLayout;
