// Dashboard.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Row,
  Col,
  Button,
  Space,
  List,
  Avatar,
  Flex,
  Badge,
  Skeleton,
  Statistic,
  Empty,
} from "antd";
import {
  HomeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  PlusOutlined,
  ArrowRightOutlined,
  DollarOutlined,
  CalendarOutlined,
  TeamOutlined,
  StarOutlined,
  ApartmentOutlined,
  UserOutlined,
  AuditOutlined,
  ShopOutlined,
  GlobalOutlined,
  BarChartOutlined,
  SettingOutlined,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import dayjs from "dayjs";
import { api } from "@/api";

const { Title, Text } = Typography;

// 样式组件（保持你原有的样式）
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const WelcomeCard = styled(Card)`
  border-radius: 20px;
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  color: white;
  border: none;

  .ant-card-body {
    padding: 32px;
  }

  h1, h2, h3, h4, h5, p {
    color: white;
    margin: 0;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  transition: all 0.3s;
  border: 1px solid #f0f0f0;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(24, 144, 255, 0.12);
    border-color: #1890ff;
  }

  .ant-card-body {
    padding: 24px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    font-size: 24px;
  }

  .stat-value {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .stat-title {
    color: #8c8c8c;
    font-size: 14px;
  }
`;

const QuickActionCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  transition: all 0.3s;
  cursor: pointer;
  border: 1px solid #f0f0f0;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(24, 144, 255, 0.12);
    border-color: #1890ff;

    .action-icon {
      background: #1890ff;
      color: white;
    }
  }

  .ant-card-body {
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .action-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: #f0f5ff;
    color: #1890ff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    transition: all 0.3s;
  }

  .action-info {
    flex: 1;

    h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
    }

    p {
      margin: 0;
      color: #8c8c8c;
      font-size: 13px;
    }
  }
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-top: 18px;

  .left {
    display: flex;
    align-items: center;
    gap: 12px;

    .icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #1890ff;
    }

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
  }
`;

const HotelItem = styled.div`
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #f5f5f5;

    .hotel-name {
      color: #1890ff;
    }
  }

  &:last-child {
    border-bottom: none;
  }
`;

const StatusBadge = styled(Badge)`
  .ant-badge-status-dot {
    width: 8px;
    height: 8px;
  }
`;

// 类型定义
interface MerchantStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  offline: number;
}

interface AdminStats {
  total_hotels: number;
  pending_hotels: number;
  approved_hotels: number;
  total_merchants: number;
}

interface Hotel {
  id: string;
  name: string;
  name_en?: string;
  star: number;
  price: number;
  status: 'pending' | 'approved' | 'rejected' | 'offline';
  images?: string[];
  merchant?: {
    id: number;
    email: string;
  };
  merchant_name?: string;
  created_at: string;
  updated_at: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'merchant' | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  
  // 商户统计数据
  const [merchantStats, setMerchantStats] = useState<MerchantStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    offline: 0,
  });

  // 管理员统计数据
  const [adminStats, setAdminStats] = useState<AdminStats>({
    total_hotels: 0,
    pending_hotels: 0,
    approved_hotels: 0,
    total_merchants: 0,
  });

  // 获取用户信息
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserRole(user?.role || 'merchant');
    }
  }, []);

  // 获取数据
  useEffect(() => {
    if (userRole === 'admin') {
      fetchAdminDashboardData();
    } else if (userRole === 'merchant') {
      fetchMerchantDashboardData();
    }
  }, [userRole]);

  // 商户数据获取
  const fetchMerchantDashboardData = async () => {
    setLoading(true);
    try {
      // 调用 /api/hotels/my-hotels
      const response = await api.hotel.getMyHotels({ page: 1, limit: 10 });
      if (response.success) {
        setHotels(response.data.hotels);
        
        const hotels = response.data.hotels;
        setMerchantStats({
          total: response.data.pagination.total,
          pending: hotels.filter((h: Hotel) => h.status === "pending").length,
          approved: hotels.filter((h: Hotel) => h.status === "approved").length,
          rejected: hotels.filter((h: Hotel) => h.status === "rejected").length,
          offline: hotels.filter((h: Hotel) => h.status === "offline").length,
        });
      }
    } catch (error) {
      console.error("获取商户数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 管理员数据获取
  const fetchAdminDashboardData = async () => {
    setLoading(true);
    try {
      // 并行获取多个数据
      const [statsRes, hotelsRes, pendingRes] = await Promise.all([
        api.admin.getStatistics(),           // GET /api/admin/statistics
        api.admin.getAllHotels({ page: 1, limit: 10 }),  // GET /api/admin/hotels
        api.admin.getPendingHotels({ page: 1, limit: 1 }), // GET /api/admin/hotels/pending
      ]);

      if (statsRes.success) {
        setAdminStats(statsRes.data);
      }

      if (hotelsRes.success) {
        setHotels(hotelsRes.data.hotels);
      }

    } catch (error) {
      console.error("获取管理员数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 获取当前时间问候语
  const getGreeting = () => {
    const hour = dayjs().hour();
    if (hour < 6) return "凌晨好";
    if (hour < 12) return "早上好";
    if (hour < 14) return "中午好";
    if (hour < 18) return "下午好";
    if (hour < 22) return "晚上好";
    return "深夜好";
  };

  // 获取用户名称
  const getUsername = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user?.username || user?.email?.split("@")[0] || "用户";
    }
    return "用户";
  };

  // 统计数据配置（根据角色不同）
  const getStatsConfig = () => {
    if (userRole === 'admin') {
      return [
        {
          title: "平台酒店总数",
          value: adminStats.total_hotels,
          icon: <GlobalOutlined />,
          color: "#1890ff",
          bgColor: "#e6f7ff",
          trend: "+12%", // 可选：同比变化
          trendIcon: <RiseOutlined />,
        },
        {
          title: "入驻商户",
          value: adminStats.total_merchants,
          icon: <TeamOutlined />,
          color: "#52c41a",
          bgColor: "#f6ffed",
          trend: "+5",
          trendIcon: <RiseOutlined />,
        },
        {
          title: "待审核酒店",
          value: adminStats.pending_hotels,
          icon: <ClockCircleOutlined />,
          color: "#fa8c16",
          bgColor: "#fff7e6",
          trend: adminStats.pending_hotels > 0 ? "需处理" : "无待办",
          trendIcon: adminStats.pending_hotels > 0 ? <FallOutlined /> : <CheckCircleOutlined />,
        },
        {
          title: "已通过酒店",
          value: adminStats.approved_hotels,
          icon: <CheckCircleOutlined />,
          color: "#722ed1",
          bgColor: "#f9f0ff",
        },
      ];
    }

    // 商户视图
    return [
      {
        title: "我的酒店",
        value: merchantStats.total,
        icon: <ApartmentOutlined />,
        color: "#1890ff",
        bgColor: "#e6f7ff",
      },
      {
        title: "待审核",
        value: merchantStats.pending,
        icon: <ClockCircleOutlined />,
        color: "#fa8c16",
        bgColor: "#fff7e6",
      },
      {
        title: "已通过",
        value: merchantStats.approved,
        icon: <CheckCircleOutlined />,
        color: "#52c41a",
        bgColor: "#f6ffed",
      },
      {
        title: "已拒绝/下线",
        value: merchantStats.rejected + merchantStats.offline,
        icon: <CloseCircleOutlined />,
        color: "#ff4d4f",
        bgColor: "#fff2f0",
      },
    ];
  };

  // 快捷操作（根据角色不同）
  const getQuickActions = () => {
    if (userRole === 'admin') {
      return [
        {
          title: "审核酒店",
          description: `${adminStats.pending_hotels} 个酒店待审核`,
          icon: <AuditOutlined />,
          path: "/admin/pending",
          badge: adminStats.pending_hotels > 0 ? adminStats.pending_hotels : undefined,
        },
        {
          title: "商户管理",
          description: `共 ${adminStats.total_merchants} 个入驻商户`,
          icon: <TeamOutlined />,
          path: "/admin/merchants",
        },
        {
          title: "所有酒店",
          description: `平台共 ${adminStats.total_hotels} 家酒店`,
          icon: <GlobalOutlined />,
          path: "/admin/hotels",
        },
        {
          title: "系统设置",
          description: "平台配置管理",
          icon: <SettingOutlined />,
          path: "/admin/settings",
        },
      ];
    }

    // 商户快捷操作
    return [
      {
        title: "添加新酒店",
        description: "创建新的酒店信息，提交审核",
        icon: <PlusOutlined />,
        path: "/merchant/hotels/new",
      },
      {
        title: "我的酒店",
        description: `共 ${merchantStats.total} 家酒店`,
        icon: <ApartmentOutlined />,
        path: "/merchant/hotels",
      },
      {
        title: "待审核酒店",
        description: `${merchantStats.pending} 个酒店等待审核`,
        icon: <ClockCircleOutlined />,
        path: "/merchant/hotels?status=pending",
        badge: merchantStats.pending > 0 ? merchantStats.pending : undefined,
      },
    ];
  };

  // 获取列表配置
  const getListConfig = () => {
    if (userRole === 'admin') {
      return {
        title: "最近提交的酒店",
        viewAllPath: "/admin/hotels",
        viewItemPath: (id: string) => `/admin/hotels/${id}`,
        emptyText: "暂无酒店数据",
        showMerchant: true, // 管理员列表显示商户信息
      };
    }
    return {
      title: "最近更新的酒店",
      viewAllPath: "/merchant/hotels",
      viewItemPath: (id: string) => `/merchant/hotelView/${id}`,
      emptyText: "暂无酒店数据",
      showMerchant: false,
    };
  };

  const statsConfig = getStatsConfig();
  const quickActions = getQuickActions();
  const listConfig = getListConfig();
  const username = getUsername();

  if (loading) {
    return (
      <PageContainer>
        <Skeleton active paragraph={{ rows: 8 }} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* 欢迎卡片 */}
      <WelcomeCard>
        <Flex justify="space-between" align="center">
          <div>
            <Title level={2} style={{ color: "white", marginBottom: 8 }}>
              {getGreeting()}，{username}！
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 16 }}>
              {userRole === 'admin' 
                ? `欢迎回到管理后台，今日有 ${adminStats.pending_hotels} 个待审核项`
                : `欢迎回到易宿酒店管理后台${
                    merchantStats.pending > 0 
                      ? `，您有 ${merchantStats.pending} 个酒店正在等待审核` 
                      : ''
                  }`
              }
            </Text>
          </div>
          <div>
            <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>
              {dayjs().format("YYYY年MM月DD日 dddd")}
            </Text>
          </div>
        </Flex>
      </WelcomeCard>

      {/* 快捷操作 */}
      <Row gutter={[24, 24]}>
        {quickActions.map((action, index) => (
          <Col xs={24} sm={12} md={userRole === 'admin' ? 6 : 8} key={index}>
            <Badge.Ribbon 
              text={action.badge} 
              color="red" 
              style={{ display: action.badge ? 'block' : 'none' }}
            >
              <QuickActionCard onClick={() => navigate(action.path)}>
                <div className="action-icon">{action.icon}</div>
                <div className="action-info">
                  <h4>{action.title}</h4>
                  <p>{action.description}</p>
                </div>
                <ArrowRightOutlined style={{ color: "#d9d9d9" }} />
              </QuickActionCard>
            </Badge.Ribbon>
          </Col>
        ))}
      </Row>

      {/* 统计数据 */}
      <StatsGrid>
        {statsConfig.map((stat, index) => (
          <StatCard key={index}>
            <div
              className="stat-icon"
              style={{ background: stat.bgColor, color: stat.color }}
            >
              {stat.icon}
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-title">{stat.title}</div>
            {stat.trend && (
              <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
                <span style={{ color: stat.trendIcon?.type === RiseOutlined ? '#52c41a' : '#ff4d4f' }}>
                  {stat.trendIcon}
                </span>
                <span style={{ marginLeft: 4 }}>{stat.trend}</span>
              </div>
            )}
          </StatCard>
        ))}
      </StatsGrid>

      {/* 内容区域 */}
      <Row gutter={24}>
        {/* 最近更新的酒店 */}
        <Col xs={24} lg={userRole === 'admin' ? 24 : 16}>
          <Card
            title={
              <SectionTitle>
                <div className="left">
                  <div className="icon">
                    <ApartmentOutlined />
                  </div>
                  <h3>{listConfig.title}</h3>
                </div>
                {hotels.length > 0 && (
                  <Button
                    type="link"
                    onClick={() => navigate(listConfig.viewAllPath)}
                  >
                    查看全部 <ArrowRightOutlined />
                  </Button>
                )}
              </SectionTitle>
            }
            bordered={false}
            style={{ borderRadius: 16 }}
          >
            {hotels.length > 0 ? (
              hotels.slice(0, 5).map((hotel) => (
                <HotelItem
                  key={hotel.id}
                  onClick={() => navigate(listConfig.viewItemPath(hotel.id))}
                >
                  <Flex justify="space-between" align="center">
                    <Flex gap={12} align="center">
                      <Avatar
                        size={48}
                        shape="square"
                        src={
                          hotel.images?.[0]
                            ? hotel.images[0].startsWith("http")
                              ? hotel.images[0]
                              : `http://localhost:3001${hotel.images[0]}`
                            : null
                        }
                        icon={!hotel.images?.[0] && <ApartmentOutlined />}
                        style={{ borderRadius: 8 }}
                      />
                      <div>
                        <div
                          style={{ fontWeight: 600, marginBottom: 4 }}
                          className="hotel-name"
                        >
                          {hotel.name}
                        </div>
                        <Space size={16} wrap>
                          {listConfig.showMerchant && hotel.merchant && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              <UserOutlined style={{ marginRight: 4 }} />
                              {hotel.merchant.email}
                            </Text>
                          )}
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <StarOutlined style={{ marginRight: 4, color: "#faad14" }} />
                            {hotel.star}星
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <DollarOutlined style={{ marginRight: 4, color: "#ff4d4f" }} />
                            ¥{hotel.price}/晚起
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <CalendarOutlined style={{ marginRight: 4 }} />
                            {dayjs(hotel.updated_at).format("MM-DD")}
                          </Text>
                        </Space>
                      </div>
                    </Flex>
                    <Space>
                      <StatusBadge
                        status={
                          hotel.status === "pending"
                            ? "warning"
                            : hotel.status === "approved"
                              ? "success"
                              : hotel.status === "rejected"
                                ? "error"
                                : "default"
                        }
                        text={
                          <span
                            style={{
                              color:
                                hotel.status === "pending"
                                  ? "#fa8c16"
                                  : hotel.status === "approved"
                                    ? "#52c41a"
                                    : hotel.status === "rejected"
                                      ? "#ff4d4f"
                                      : "#8c8c8c",
                              fontSize: 12,
                            }}
                          >
                            {hotel.status === "pending"
                              ? "待审核"
                              : hotel.status === "approved"
                                ? "已通过"
                                : hotel.status === "rejected"
                                  ? "已拒绝"
                                  : "已下线"}
                          </span>
                        }
                      />
                      <Button type="text" size="small" icon={<EyeOutlined />} />
                    </Space>
                  </Flex>
                </HotelItem>
              ))
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={listConfig.emptyText}
              >
                {userRole === 'merchant' && (
                  <Button
                    type="primary"
                    onClick={() => navigate("/merchant/hotels/new")}
                    icon={<PlusOutlined />}
                  >
                    立即添加酒店
                  </Button>
                )}
              </Empty>
            )}
          </Card>
        </Col>

        {/* 右侧信息 - 只对商户显示 */}
        {userRole === 'merchant' && (
          <Col xs={24} lg={8}>
            {/* 审核状态说明 */}
            <Card
              title={
                <SectionTitle>
                  <div className="left">
                    <div className="icon">
                      <AuditOutlined />
                    </div>
                    <h3>审核状态说明</h3>
                  </div>
                </SectionTitle>
              }
              bordered={false}
              style={{ borderRadius: 16 }}
            >
              <List
                itemLayout="horizontal"
                dataSource={[
                  {
                    status: "待审核",
                    color: "warning",
                    icon: <ClockCircleOutlined />,
                    desc: "酒店已提交，等待管理员审核",
                  },
                  {
                    status: "已通过",
                    color: "success",
                    icon: <CheckCircleOutlined />,
                    desc: "审核通过，酒店已上线",
                  },
                  {
                    status: "已拒绝",
                    color: "error",
                    icon: <CloseCircleOutlined />,
                    desc: "审核未通过，请查看拒绝原因",
                  },
                  {
                    status: "已下线",
                    color: "default",
                    icon: <EyeOutlined />,
                    desc: "酒店已下线，可重新提交",
                  },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={item.icon}
                          style={{
                            background:
                              item.color === "warning"
                                ? "#fff7e6"
                                : item.color === "success"
                                  ? "#f6ffed"
                                  : item.color === "error"
                                    ? "#fff2f0"
                                    : "#f5f5f5",
                            color:
                              item.color === "warning"
                                ? "#fa8c16"
                                : item.color === "success"
                                  ? "#52c41a"
                                  : item.color === "error"
                                    ? "#ff4d4f"
                                    : "#8c8c8c",
                          }}
                        />
                      }
                      title={item.status}
                      description={item.desc}
                    />
                  </List.Item>
                )}
              />
            </Card>

            {/* 快捷帮助卡片 - 商户专用 */}
            <Card 
              style={{ marginTop: 24, borderRadius: 16 }}
              bordered={false}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Title level={5}>💡 使用提示</Title>
                  <Text type="secondary">
                    • 提交酒店后需要等待管理员审核<br />
                    • 审核通过后酒店才会在用户端显示<br />
                    • 修改酒店信息后会重新进入审核状态
                  </Text>
                </div>
                <Button 
                  type="primary" 
                  block 
                  icon={<PlusOutlined />}
                  onClick={() => navigate("/merchant/hotels/new")}
                >
                  快速添加酒店
                </Button>
              </Space>
            </Card>
          </Col>
        )}
      </Row>
    </PageContainer>
  );
};

export default Dashboard;