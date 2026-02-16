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
  Avatar,
  Flex,
  Badge,
  Skeleton,
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
  GlobalOutlined,
  RiseOutlined,
  FallOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import dayjs from "dayjs";
import { api } from "@/api";
import type { ResHotel } from "@/api/types";

const { Title, Text } = Typography;

// 样式组件
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 8px 0;
`;

const WelcomeCard = styled(Card)`
  border-radius: 20px;
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  color: white;
  border: none;

  .ant-card-body {
    padding: 32px;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  p {
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
  text-align: center;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(24, 144, 255, 0.12);
    border-color: #1890ff;
  }

  .ant-card-body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
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
    line-height: 1.4;
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
  height: 100%;

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
    flex-shrink: 0;
  }

  .action-info {
    flex: 1;
    min-width: 0;

    h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    p {
      margin: 0;
      color: #8c8c8c;
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 4px 0;

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
      font-size: 18px;
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

const StatusTag = styled.span<{ color: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: ${(props) => {
    switch (props.color) {
      case "success":
        return "#f6ffed";
      case "warning":
        return "#fff7e6";
      case "error":
        return "#fff2f0";
      default:
        return "#f5f5f5";
    }
  }};
  color: ${(props) => {
    switch (props.color) {
      case "success":
        return "#52c41a";
      case "warning":
        return "#fa8c16";
      case "error":
        return "#ff4d4f";
      default:
        return "#8c8c8c";
    }
  }};
  border: 1px solid
    ${(props) => {
      switch (props.color) {
        case "success":
          return "#b7eb8f";
        case "warning":
          return "#ffd591";
        case "error":
          return "#ffccc7";
        default:
          return "#d9d9d9";
      }
    }};
`;

// 类型定义
interface MerchantStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  published: number;
  unpublished: number;
}

interface AdminStats {
  total_hotels: number;
  review_stats: {
    pending: number;
    approved: number;
    rejected: number;
  };
  publish_stats: {
    published: number;
    unpublished: number;
  };
  total_merchants: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"admin" | "merchant" | null>(null);
  const [hotels, setHotels] = useState<ResHotel[]>([]);

  // 商户统计数据
  const [merchantStats, setMerchantStats] = useState<MerchantStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    published: 0,
    unpublished: 0,
  });

  // 管理员统计数据
  const [adminStats, setAdminStats] = useState<AdminStats>({
    total_hotels: 0,
    review_stats: {
      pending: 0,
      approved: 0,
      rejected: 0,
    },
    publish_stats: {
      published: 0,
      unpublished: 0,
    },
    total_merchants: 0,
  });

  // 获取用户信息
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user?.role || "merchant");
      } catch (error) {
        console.error("解析用户信息失败:", error);
      }
    }
  }, []);

  // 获取数据
  useEffect(() => {
    if (userRole === "admin") {
      fetchAdminDashboardData();
    } else if (userRole === "merchant") {
      fetchMerchantDashboardData();
    }
  }, [userRole]);

  // 商户数据获取
  const fetchMerchantDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.hotel.getMyHotels({ page: 1, limit: 100 });
      if (response.success) {
        const hotels = response.data.hotels;
        setHotels(hotels.slice(0, 10));

        setMerchantStats({
          total: response.data.pagination.total,
          pending: hotels.filter((h: ResHotel) => h.review_status === "pending")
            .length,
          approved: hotels.filter(
            (h: ResHotel) => h.review_status === "approved",
          ).length,
          rejected: hotels.filter(
            (h: ResHotel) => h.review_status === "rejected",
          ).length,
          published: hotels.filter(
            (h: ResHotel) => h.publish_status === "published",
          ).length,
          unpublished: hotels.filter(
            (h: ResHotel) => h.publish_status === "unpublished",
          ).length,
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
      const [statsRes, hotelsRes] = await Promise.all([
        api.admin.getStatistics(),
        api.admin.getAllHotels({ page: 1, limit: 10 }),
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
      try {
        const user = JSON.parse(userStr);
        return user?.username || user?.email?.split("@")[0] || "用户";
      } catch (error) {
        return "用户";
      }
    }
    return "用户";
  };

  // 统计数据配置（根据角色不同）
  const getStatsConfig = () => {
    if (userRole === "admin") {
      return [
        {
          title: "平台酒店总数",
          value: adminStats.total_hotels,
          icon: <GlobalOutlined />,
          color: "#1890ff",
          bgColor: "#e6f7ff",
        },
        {
          title: "入驻商户",
          value: adminStats.total_merchants,
          icon: <TeamOutlined />,
          color: "#52c41a",
          bgColor: "#f6ffed",
        },
        {
          title: "待审核酒店",
          value: adminStats.review_stats.pending,
          icon: <ClockCircleOutlined />,
          color: "#fa8c16",
          bgColor: "#fff7e6",
        },
        {
          title: "已发布酒店",
          value: adminStats.publish_stats.published,
          icon: <PlayCircleOutlined />,
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
        title: "已发布",
        value: merchantStats.published,
        icon: <PlayCircleOutlined />,
        color: "#52c41a",
        bgColor: "#f6ffed",
      },
      {
        title: "未发布",
        value: merchantStats.unpublished,
        icon: <PauseCircleOutlined />,
        color: "#8c8c8c",
        bgColor: "#f5f5f5",
      },
    ];
  };

  // 快捷操作（根据角色不同）- 移除了系统设置
  const getQuickActions = () => {
    if (userRole === "admin") {
      return [
        {
          title: "审核酒店",
          description: `${adminStats.review_stats.pending} 个酒店待审核`,
          icon: <AuditOutlined />,
          path: "/admin/pending",
          badge:
            adminStats.review_stats.pending > 0
              ? adminStats.review_stats.pending
              : undefined,
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
      ];
    }

    // 商户快捷操作
    return [
      {
        title: "添加新酒店",
        description: "创建新酒店信息，提交审核",
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
        path: "/merchant/hotels?review_status=pending",
        badge: merchantStats.pending > 0 ? merchantStats.pending : undefined,
      },
      {
        title: "已发布酒店",
        description: `${merchantStats.published} 个酒店已发布`,
        icon: <PlayCircleOutlined />,
        path: "/merchant/hotels?publish_status=published",
      },
    ];
  };

  // 获取列表配置
  const getListConfig = () => {
    if (userRole === "admin") {
      return {
        title: "最近提交的酒店",
        viewAllPath: "/admin/hotels",
        viewItemPath: (id: string) => `/admin/hotels/${id}`,
        emptyText: "暂无酒店数据",
        showMerchant: true,
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

  // 获取状态显示 - 修复已发布状态显示问题
  const getStatusDisplay = (hotel: ResHotel) => {
    const statuses = [];

    // 审核状态
    if (hotel.review_status === "pending") {
      statuses.push(
        <StatusTag key="review" color="warning">
          待审核
        </StatusTag>,
      );
    } else if (hotel.review_status === "approved") {
      statuses.push(
        <StatusTag key="review" color="success">
          审核通过
        </StatusTag>,
      );
    } else if (hotel.review_status === "rejected") {
      statuses.push(
        <StatusTag key="review" color="error">
          已拒绝
        </StatusTag>,
      );
    }

    // 发布状态 - 只有当审核通过时才显示发布状态
    if (hotel.review_status === "approved") {
      if (hotel.publish_status === "published") {
        statuses.push(
          <StatusTag key="publish" color="success">
            已发布
          </StatusTag>,
        );
      } else if (hotel.publish_status === "unpublished") {
        statuses.push(
          <StatusTag key="publish" color="default">
            未发布
          </StatusTag>,
        );
      }
    }

    return (
      <Space size={[8, 0]} wrap>
        {statuses}
      </Space>
    );
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
        <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
          <div>
            <Title level={2} style={{ color: "white", marginBottom: 8 }}>
              {getGreeting()}，{username}！
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 16 }}>
              {userRole === "admin"
                ? `欢迎回到管理后台，今日有 ${adminStats.review_stats.pending} 个待审核项`
                : `欢迎回到易宿酒店管理后台${
                    merchantStats.pending > 0
                      ? `，您有 ${merchantStats.pending} 个酒店正在等待审核`
                      : ""
                  }`}
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
          <Col xs={24} sm={12} md={userRole === "admin" ? 8 : 6} key={index}>
            {action.badge ? (
              <Badge.Ribbon text={action.badge} color="red">
                <QuickActionCard onClick={() => navigate(action.path)}>
                  <div className="action-icon">{action.icon}</div>
                  <div className="action-info">
                    <h4>{action.title}</h4>
                    <p>{action.description}</p>
                  </div>
                  <ArrowRightOutlined
                    style={{ color: "#d9d9d9", flexShrink: 0 }}
                  />
                </QuickActionCard>
              </Badge.Ribbon>
            ) : (
              <QuickActionCard onClick={() => navigate(action.path)}>
                <div className="action-icon">{action.icon}</div>
                <div className="action-info">
                  <h4>{action.title}</h4>
                  <p>{action.description}</p>
                </div>
                <ArrowRightOutlined
                  style={{ color: "#d9d9d9", flexShrink: 0 }}
                />
              </QuickActionCard>
            )}
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
          </StatCard>
        ))}
      </StatsGrid>

      {/* 最近更新的酒店列表 */}
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
              onClick={() =>
                navigate(listConfig.viewItemPath(String(hotel.id)))
              }
            >
              <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
                <Flex
                  gap={12}
                  align="center"
                  style={{ minWidth: 200, flex: 1 }}
                >
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
                    style={{ borderRadius: 8, flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{ fontWeight: 600, marginBottom: 4 }}
                      className="hotel-name"
                    >
                      {hotel.name}
                    </div>
                    <Space size={[16, 8]} wrap>
                      {listConfig.showMerchant && hotel.merchant && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <UserOutlined style={{ marginRight: 4 }} />
                          {hotel.merchant.email}
                        </Text>
                      )}
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <StarOutlined
                          style={{ marginRight: 4, color: "#faad14" }}
                        />
                        {hotel.star}星
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <DollarOutlined
                          style={{ marginRight: 4, color: "#ff4d4f" }}
                        />
                        ¥{hotel.price}/晚起
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        {dayjs(hotel.updated_at).format("MM-DD")}
                      </Text>
                    </Space>
                  </div>
                </Flex>
                <Flex align="center" gap={8} style={{ flexShrink: 0 }}>
                  {getStatusDisplay(hotel)}
                  <Button type="text" size="small" icon={<EyeOutlined />} />
                </Flex>
              </Flex>
            </HotelItem>
          ))
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={listConfig.emptyText}
            style={{ margin: "32px 0" }}
          >
            {userRole === "merchant" && (
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
    </PageContainer>
  );
};

export default Dashboard;
