import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IMAGE_BASE } from "@/config/constants";
import {
  Card,
  Typography,
  Spin,
  message,
  Result,
  Button,
  Flex,
  Space,
  Divider,
  Tag,
  Row,
  Col,
  Descriptions,
  Image,
  Rate,
  Tabs,
  Badge,
  Alert,
  Tooltip,
  Statistic,
  Empty,
  Carousel,
} from "antd";
import {
  EditOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  DollarOutlined,
  TagOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StarOutlined,
  WifiOutlined,
  CarOutlined,
  CoffeeOutlined,
  FireOutlined,
  ShoppingOutlined,
  BankOutlined,
  ExpandOutlined,
  HeartOutlined,
  SwapOutlined,
  TeamOutlined,
  SafetyOutlined,
  SmileOutlined,
  ToolOutlined,
  MedicineBoxOutlined,
  CustomerServiceOutlined,
  GiftOutlined,
  FundOutlined,
  CloudOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import dayjs from "dayjs";
import { api } from "@/api";
import type { ResHotel } from "@/api/types";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// ==================== 样式组件 ====================
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 100vh;
`;

const GlassCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 24px 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
  }
`;

const PageHeaderContainer = styled(GlassCard)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const ContentCard = styled(Card)`
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.5);
  overflow: hidden;

  .ant-card-body {
    padding: 0;
  }

  .ant-tabs-nav {
    padding: 0 32px;
    margin: 0;
    background: #fff;
    border-bottom: 1px solid #f0f0f0;
  }

  .ant-tabs-tab {
    padding: 20px 24px;
    margin: 0;
    transition: all 0.3s;
    font-size: 16px;

    &:hover {
      color: #1890ff;
    }

    .anticon {
      margin-right: 8px;
      font-size: 18px;
    }
  }

  .ant-tabs-tab-active {
    .anticon {
      color: #1890ff;
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 600px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
`;

const StatusTagGroup = styled(Flex)`
  gap: 8px;
  flex-wrap: wrap;
`;

const StatusTag = styled(Tag)<{ $type: 'review' | 'publish'; $status: string }>`
  padding: 8px 20px;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  
  ${props => {
    if (props.$type === 'review') {
      switch (props.$status) {
        case 'pending':
          return `
            background: linear-gradient(135deg, #fff7e6, #ffe7ba);
            color: #fa8c16;
            border: 1px solid #ffd591;
          `;
        case 'approved':
          return `
            background: linear-gradient(135deg, #f6ffed, #d9f7be);
            color: #52c41a;
            border: 1px solid #b7eb8f;
          `;
        case 'rejected':
          return `
            background: linear-gradient(135deg, #fff2f0, #ffccc7);
            color: #f5222d;
            border: 1px solid #ffa39e;
          `;
      }
    } else {
      return props.$status === 'published'
        ? `
            background: linear-gradient(135deg, #e6f7ff, #bae7ff);
            color: #1890ff;
            border: 1px solid #91d5ff;
          `
        : `
            background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
            color: #8c8c8c;
            border: 1px solid #d9d9d9;
          `;
    }
  }}
`;

const Section = styled.div`
  padding: 32px;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, #1890ff, #36cfc9);
    border-radius: 4px;
  }

  .icon-wrapper {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #e6f7ff, #bae7ff);
    border-radius: 16px;
    color: #1890ff;
    font-size: 24px;
  }

  h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #1f1f1f;
  }
`;

const GallerySection = styled(Section)`
  background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
`;

const MainImage = styled.div`
  width: 100%;
  height: 500px;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  margin-bottom: 24px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: scale(1.01);
    box-shadow: 0 20px 60px rgba(24, 144, 255, 0.3);

    .image-overlay {
      opacity: 1;
    }
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
    color: white;
    font-size: 48px;
    backdrop-filter: blur(2px);
  }
`;

const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
  margin-top: 20px;
`;

const Thumbnail = styled.div<{ $active: boolean }>`
  aspect-ratio: 16/9;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  border: 4px solid ${props => props.$active ? '#1890ff' : 'transparent'};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: all 0.3s;
  position: relative;

  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 16px 32px rgba(24, 144, 255, 0.25);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.$active ? 'rgba(24, 144, 255, 0.1)' : 'none'};
    pointer-events: none;
  }
`;

const RoomCard = styled.div`
  background: #fff;
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 20px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: #1890ff;
    box-shadow: 0 12px 40px rgba(24, 144, 255, 0.15);
    transform: translateY(-2px);
  }
`;

const RoomPrice = styled.div`
  padding: 14px 24px;
  border-radius: 40px;
  display: inline-block;

  .price {
    color: #ff4d4f;
    font-size: 32px;
    font-weight: 700;
    font-family: 'PingFang SC', 'Arial', sans-serif;
  }

  .unit {
    color: #8c8c8c;
    font-size: 15px;
    margin-left: 8px;
    font-weight: 400;
  }
`;

const InfoCard = styled(Card)`
  border-radius: 20px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  height: fit-content;

  .ant-card-head {
    border-bottom: 1px solid #f0f0f0;
    padding: 0 24px;
    min-height: 64px;
    background: linear-gradient(135deg, #fafafa, #f5f5f5);
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
  }

  .ant-card-head-title {
    font-size: 18px;
    font-weight: 600;
    color: #1f1f1f;
  }

  .ant-card-body {
    padding: 24px;
  }
`;

const FacilityTag = styled(Tag)`
  padding: 8px 18px;
  border-radius: 40px;
  font-size: 14px;
  margin: 4px;
  border: 1px solid #d9d9d9;
  background: #fff;
  color: #595959;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: #f0f7ff;
    border-color: #1890ff;
    color: #1890ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(24, 144, 255, 0.2);

    .anticon {
      color: #1890ff;
    }
  }

  .anticon {
    color: #595959;
    transition: color 0.2s;
    font-size: 14px;
  }
`;

const CompactStatistic = styled(Statistic)`
  .ant-statistic-title {
    font-size: 14px;
    color: #8c8c8c;
    margin-bottom: 4px;
  }

  .ant-statistic-content {
    font-size: 20px;
    font-weight: 600;
    color: #1f1f1f;
  }
`;

const TwoColumnLayout = styled(Row)`
  gap: 24px;

  @media (max-width: 1200px) {
    flex-direction: column;
  }
`;

const LeftColumn = styled(Col)`
  flex: 2;
  min-width: 0;
`;

const RightColumn = styled(Col)`
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const StickyInfoCard = styled(InfoCard)`
  position: sticky;
  top: 24px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f5f5;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #d9d9d9;
    border-radius: 3px;

    &:hover {
      background: #bfbfbf;
    }
  }
`;

const FacilityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 8px;
`;

const TagGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 8px;
`;

const MetaInfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px dashed #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .meta-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border-radius: 12px;
    color: #1890ff;
    font-size: 18px;
  }

  .meta-content {
    flex: 1;

    .meta-label {
      font-size: 13px;
      color: #8c8c8c;
      margin-bottom: 4px;
    }

    .meta-value {
      font-size: 16px;
      font-weight: 600;
      color: #1f1f1f;
    }
  }
`;

// ==================== 工具函数 ====================
const getImageUrl = (path: string) => {
  if (!path) return '';
  return path.startsWith("http") ? path : `${IMAGE_BASE}${path}`;
};

// 房内设施映射
const roomFacilityMap: Record<string, { label: string; icon: React.ReactNode }> = {
  wifi: { label: "Wi-Fi", icon: <WifiOutlined /> },
  tv: { label: "电视", icon: <FundOutlined /> },
  "air-conditioner": { label: "空调", icon: <CloudOutlined /> },
  fridge: { label: "冰箱", icon: <ShoppingOutlined /> },
  safe: { label: "保险箱", icon: <SafetyOutlined /> },
  hairdryer: { label: "吹风机", icon: <ToolOutlined /> },
  bathtub: { label: "浴缸", icon: <SmileOutlined /> },
  jacuzzi: { label: "按摩浴缸", icon: <MedicineBoxOutlined /> },
  balcony: { label: "阳台", icon: <HomeOutlined /> },
  kitchen: { label: "厨房", icon: <FireOutlined /> },
  microwave: { label: "微波炉", icon: <ThunderboltOutlined /> },
  "coffee-machine": { label: "咖啡机", icon: <CoffeeOutlined /> },
  desk: { label: "办公桌", icon: <CustomerServiceOutlined /> },
  sofa: { label: "沙发", icon: <TeamOutlined /> },
  wardrobe: { label: "衣柜", icon: <GiftOutlined /> },
  breakfast: { label: "早餐", icon: <CoffeeOutlined /> },
};

// 酒店设施映射
const facilityMap: Record<string, { label: string; icon: React.ReactNode }> = {
  wifi: { label: "Wi-Fi", icon: <WifiOutlined /> },
  parking: { label: "停车场", icon: <CarOutlined /> },
  gym: { label: "健身房", icon: <FundOutlined /> },
  pool: { label: "游泳池", icon: <SmileOutlined /> },
  spa: { label: "水疗中心", icon: <MedicineBoxOutlined /> },
  breakfast: { label: "早餐", icon: <CoffeeOutlined /> },
  restaurant: { label: "餐厅", icon: <FireOutlined /> },
  bar: { label: "酒吧", icon: <GiftOutlined /> },
  concierge: { label: "礼宾服务", icon: <CustomerServiceOutlined /> },
  laundry: { label: "洗衣服务", icon: <ToolOutlined /> },
  "airport-shuttle": { label: "机场班车", icon: <CarOutlined /> },
  "business-center": { label: "商务中心", icon: <BankOutlined /> },
  "meeting-rooms": { label: "会议室", icon: <TeamOutlined /> },
  "disabled-access": { label: "无障碍设施", icon: <SafetyOutlined /> },
  "pet-friendly": { label: "宠物友好", icon: <HeartOutlined /> },
  "smoke-free": { label: "禁烟", icon: <CloseCircleOutlined /> },
  "family-rooms": { label: "家庭房", icon: <HomeOutlined /> },
  "24h-front-desk": { label: "24小时前台", icon: <ClockCircleOutlined /> },
  "luggage-storage": { label: "行李寄存", icon: <ShoppingOutlined /> },
  elevator: { label: "电梯", icon: <SwapOutlined /> },
  "airport-transfer": { label: "机场接送", icon: <CarOutlined /> },
  "tour-desk": { label: "旅游咨询", icon: <GlobalOutlined /> },
  "currency-exchange": { label: "货币兑换", icon: <DollarOutlined /> },
};

// ==================== 组件 ====================
interface HotelViewProps {
  adminActions?: (hotel: ResHotel) => React.ReactNode;
}

const HotelView: React.FC<HotelViewProps> = ({ adminActions }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === "admin";

  const [loading, setLoading] = useState(true);
  const [hotel, setHotel] = useState<ResHotel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    if (id) {
      fetchHotelDetail(parseInt(id));
    }
  }, [id]);

  const fetchHotelDetail = async (hotelId: number) => {
    setLoading(true);
    try {
      const response = await api.hotel.getById(hotelId);
      if (response.success) {
        setHotel(response.data.hotel);
        if (response.data.hotel.images?.length > 0) {
          setSelectedImage(response.data.hotel.images[0]);
        }
      } else {
        setError("获取酒店信息失败");
      }
    } catch (error: any) {
      console.error("获取酒店详情失败:", error);
      setError(error.message || "获取酒店信息失败");
    } finally {
      setLoading(false);
    }
  };

  // 获取最低价格
  const lowestPrice = hotel?.room_type?.reduce(
    (min, room) => Math.min(min, room.price),
    Infinity
  ) || 0;

  // 获取状态标签
  const getReviewStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: <ClockCircleOutlined />, text: '待审核' };
      case 'approved':
        return { icon: <CheckCircleOutlined />, text: '审核通过' };
      case 'rejected':
        return { icon: <CloseCircleOutlined />, text: '已拒绝' };
      default:
        return { icon: null, text: status };
    }
  };

  const getPublishStatusInfo = (status: string) => {
    return status === 'published'
      ? { icon: <PlayCircleOutlined />, text: '已发布' }
      : { icon: <PauseCircleOutlined />, text: '未发布' };
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <Spin size="large" tip="加载酒店信息..." wrapperClassName="custom-spin">
            <div style={{ padding: 50 }} />
          </Spin>
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (error || !hotel) {
    return (
      <PageContainer>
        <Result
          status="error"
          title="加载失败"
          subTitle={error || "酒店不存在或已被删除"}
          extra={[
            <Button
              key="back"
              type="primary"
              onClick={() => navigate(isAdmin ? "/admin/hotels" : "/merchant/hotels")}
              icon={<ArrowLeftOutlined />}
              size="large"
              shape="round"
              style={{ height: 48, padding: "0 32px" }}
            >
              返回酒店列表
            </Button>,
          ]}
        />
      </PageContainer>
    );
  }

  const reviewInfo = getReviewStatusInfo(hotel.review_status);
  const publishInfo = getPublishStatusInfo(hotel.publish_status);

  return (
    <PageContainer>
      {/* 头部区域 */}
      <PageHeaderContainer>
        <Flex align="center" gap={16} wrap="wrap">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(isAdmin ? "/admin/hotels" : "/merchant/hotels")}
            size="large"
            shape="round"
          >
            返回列表
          </Button>

          <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
            {hotel.name}
          </Title>

          <StatusTagGroup>
            <StatusTag $type="review" $status={hotel.review_status}>
              {reviewInfo.icon}
              {reviewInfo.text}
            </StatusTag>
            
            <StatusTag $type="publish" $status={hotel.publish_status}>
              {publishInfo.icon}
              {publishInfo.text}
            </StatusTag>
          </StatusTagGroup>
        </Flex>

        <Flex align="center" gap={12}>
          {adminActions && adminActions(hotel)}
          {!isAdmin && (
            <Tooltip title={hotel.review_status === "pending" ? "审核中不可编辑" : "编辑酒店信息"}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(`/merchant/hotels/${id}`)}
                disabled={hotel.review_status === "pending"}
                size="large"
                shape="round"
                style={{
                  height: 48,
                  padding: "0 32px",
                  background: "linear-gradient(135deg, #1890ff, #36cfc9)",
                  border: "none",
                  boxShadow: "0 8px 24px rgba(24, 144, 255, 0.35)",
                }}
              >
                编辑酒店
              </Button>
            </Tooltip>
          )}
        </Flex>
      </PageHeaderContainer>

      {/* 拒绝原因提示 */}
      {hotel.reject_reason && (
        <Alert
          message={
            <Flex align="center" gap={8}>
              <CloseCircleOutlined />
              <span style={{ fontWeight: 600 }}>审核拒绝原因</span>
            </Flex>
          }
          description={hotel.reject_reason}
          type="error"
          showIcon
          closable
          style={{ 
            borderRadius: 16,
            border: 'none',
            boxShadow: '0 8px 24px rgba(245, 34, 45, 0.15)',
          }}
        />
      )}

      {/* 主要内容区域 */}
      <ContentCard>
        <Tabs defaultActiveKey="1" size="large">
          {/* 基本信息标签页 */}
          <TabPane
            tab={
              <span>
                <HomeOutlined />
                基本信息
              </span>
            }
            key="1"
          >
            {/* 图片展示区 */}
            {hotel.images && hotel.images.length > 0 ? (
              <GallerySection>
                <MainImage onClick={() => setPreviewVisible(true)}>
                  <img src={getImageUrl(selectedImage)} alt="酒店主图" />
                  <div className="image-overlay">
                    <ExpandOutlined />
                  </div>
                </MainImage>

                <ThumbnailGrid>
                  {hotel.images.map((img, index) => (
                    <Thumbnail
                      key={index}
                      $active={selectedImage === img}
                      onClick={() => setSelectedImage(img)}
                    >
                      <img src={getImageUrl(img)} alt={`缩略图${index + 1}`} />
                    </Thumbnail>
                  ))}
                </ThumbnailGrid>

                <Image
                  style={{ display: "none" }}
                  preview={{
                    visible: previewVisible,
                    src: getImageUrl(selectedImage),
                    onVisibleChange: setPreviewVisible,
                  }}
                />
              </GallerySection>
            ) : (
              <Section>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="暂无酒店图片"
                />
              </Section>
            )}

            {/* 详细内容区域 - 两列布局 */}
            <Section>
              <TwoColumnLayout>
                {/* 左侧主内容 */}
                <LeftColumn span={16}>
                  {/* 位置信息 */}
                  <SectionHeader>
                    <div className="icon-wrapper">
                      <EnvironmentOutlined />
                    </div>
                    <h3>位置信息</h3>
                  </SectionHeader>

                  <Paragraph style={{ fontSize: 16, marginBottom: 16, lineHeight: 1.8 }}>
                    {hotel.address}
                  </Paragraph>

                  {hotel.nearby_attractions && (
                    <Paragraph type="secondary" style={{ fontSize: 15 }}>
                      <TagOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                      附近景点/商圈：{hotel.nearby_attractions}
                    </Paragraph>
                  )}

                  <Divider style={{ margin: "32px 0" }} />

                  {/* 房型与价格 */}
                  <SectionHeader>
                    <div className="icon-wrapper">
                      <DollarOutlined />
                    </div>
                    <h3>房型与价格</h3>
                  </SectionHeader>

                  <Flex align="center" gap={16} style={{ marginBottom: 28 }}>
                    <RoomPrice>
                      <span className="price">¥{lowestPrice.toLocaleString()}</span>
                      <span className="unit">起/晚</span>
                    </RoomPrice>
                    <Text type="secondary">
                      共 {hotel.room_type?.length || 0} 种房型
                    </Text>
                  </Flex>

                  {hotel.room_type?.length > 0 ? (
                    hotel.room_type.map((room, index) => (
                      <RoomCard key={index}>
                        <Row gutter={[24, 16]} align="middle">
                          <Col xs={24} md={8}>
                            <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
                              {room.type}
                            </Title>
                          </Col>
                          <Col xs={24} md={6}>
                            <Text strong style={{ fontSize: 28, color: "#ff4d4f" }}>
                              ¥{room.price.toLocaleString()}
                            </Text>
                            <Text type="secondary"> /晚</Text>
                          </Col>
                          <Col xs={24} md={10}>
                            {room.description && (
                              <Text type="secondary" style={{ fontSize: 14 }}>
                                {room.description}
                              </Text>
                            )}
                          </Col>
                        </Row>

                        {room.facilities && room.facilities.length > 0 && (
                          <Flex wrap="wrap" gap={8} style={{ marginTop: 20 }}>
                            {room.facilities.map((facility) => {
                              const facilityInfo = roomFacilityMap[facility] || {
                                label: facility,
                                icon: <AppstoreOutlined />,
                              };
                              return (
                                <FacilityTag key={facility}>
                                  {facilityInfo.icon}
                                  {facilityInfo.label}
                                </FacilityTag>
                              );
                            })}
                          </Flex>
                        )}
                      </RoomCard>
                    ))
                  ) : (
                    <Empty description="暂无房型信息" />
                  )}
                </LeftColumn>

                {/* 右侧侧边栏 */}
                <RightColumn span={8}>
                  <StickyInfoCard title="酒店信息概览">
                    <MetaInfoItem>
                      <div className="meta-icon">
                        <StarOutlined />
                      </div>
                      <div className="meta-content">
                        <div className="meta-label">酒店星级</div>
                        <div className="meta-value">
                          <Rate disabled defaultValue={hotel.star} style={{ fontSize: 14 }} />
                        </div>
                      </div>
                    </MetaInfoItem>

                    <MetaInfoItem>
                      <div className="meta-icon">
                        <CalendarOutlined />
                      </div>
                      <div className="meta-content">
                        <div className="meta-label">开业时间</div>
                        <div className="meta-value">
                          {dayjs(hotel.open_date).format("YYYY年MM月")}
                        </div>
                      </div>
                    </MetaInfoItem>

                    <MetaInfoItem>
                      <div className="meta-icon">
                        <SwapOutlined />
                      </div>
                      <div className="meta-content">
                        <div className="meta-label">最后更新</div>
                        <div className="meta-value">
                          {dayjs(hotel.updated_at).format("YYYY-MM-DD")}
                        </div>
                      </div>
                    </MetaInfoItem>

                    <MetaInfoItem>
                      <div className="meta-icon">
                        <FileTextOutlined />
                      </div>
                      <div className="meta-content">
                        <div className="meta-label">创建时间</div>
                        <div className="meta-value">
                          {dayjs(hotel.created_at).format("YYYY-MM-DD")}
                        </div>
                      </div>
                    </MetaInfoItem>

                    {hotel.discount && hotel.discount < 1 && (
                      <>
                        <Divider style={{ margin: "8px 0" }} />
                        <MetaInfoItem>
                          <div className="meta-icon" style={{ background: '#fff2f0', color: '#ff4d4f' }}>
                            <TagOutlined />
                          </div>
                          <div className="meta-content">
                            <div className="meta-label">限时优惠</div>
                            <div className="meta-value" style={{ color: "#ff4d4f" }}>
                              {(hotel.discount * 10).toFixed(0)}折
                              {hotel.discount_description && (
                                <Text type="secondary" style={{ fontSize: 13, marginLeft: 8 }}>
                                  {hotel.discount_description}
                                </Text>
                              )}
                            </div>
                          </div>
                        </MetaInfoItem>
                      </>
                    )}
                  </StickyInfoCard>

                  {/* 设施与服务 */}
                  {hotel.facilities && hotel.facilities.length > 0 && (
                    <InfoCard title="设施与服务">
                      <FacilityGrid>
                        {hotel.facilities.map((facility) => {
                          const facilityInfo = facilityMap[facility] || {
                            label: facility,
                            icon: <AppstoreOutlined />,
                          };
                          return (
                            <FacilityTag key={facility} style={{ margin: 0, justifyContent: 'center' }}>
                              {facilityInfo.icon}
                              {facilityInfo.label}
                            </FacilityTag>
                          );
                        })}
                      </FacilityGrid>
                    </InfoCard>
                  )}

                  {/* 酒店标签 */}
                  {hotel.tags && hotel.tags.length > 0 && (
                    <InfoCard title="酒店标签">
                      <TagGrid>
                        {hotel.tags.map((tag) => (
                          <Tag
                            key={tag}
                            color="blue"
                            style={{
                              padding: "8px 12px",
                              margin: 0,
                              textAlign: "center",
                              borderRadius: 30,
                              fontSize: 13,
                              fontWeight: 500,
                            }}
                          >
                            {tag}
                          </Tag>
                        ))}
                      </TagGrid>
                    </InfoCard>
                  )}
                </RightColumn>
              </TwoColumnLayout>
            </Section>
          </TabPane>

          {/* 详细信息标签页 */}
          <TabPane
            tab={
              <span>
                <FileTextOutlined />
                详细信息
              </span>
            }
            key="2"
          >
            <Section>
              <Descriptions
                bordered
                column={{ xs: 1, sm: 2, md: 2 }}
                size="middle"
                labelStyle={{
                  width: 200,
                  background: "#fafafa",
                  fontWeight: 500,
                  padding: "16px 24px",
                }}
                contentStyle={{
                  padding: "16px 24px",
                  background: "#fff",
                }}
              >
                <Descriptions.Item label="酒店名称（中文）">
                  {hotel.name}
                </Descriptions.Item>

                <Descriptions.Item label="酒店名称（英文）">
                  {hotel.name_en || "-"}
                </Descriptions.Item>

                <Descriptions.Item label="酒店星级" span={2}>
                  <Rate disabled value={hotel.star} />
                </Descriptions.Item>

                <Descriptions.Item label="详细地址" span={2}>
                  <EnvironmentOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                  {hotel.address}
                </Descriptions.Item>

                <Descriptions.Item label="开业时间">
                  {dayjs(hotel.open_date).format("YYYY年MM月DD日")}
                </Descriptions.Item>

                <Descriptions.Item label="创建时间">
                  {dayjs(hotel.created_at).format("YYYY-MM-DD HH:mm")}
                </Descriptions.Item>

                <Descriptions.Item label="最后更新">
                  {dayjs(hotel.updated_at).format("YYYY-MM-DD HH:mm")}
                </Descriptions.Item>

                <Descriptions.Item label="审核状态">
                  <Badge
                    status={
                      hotel.review_status === 'pending' ? 'warning' :
                      hotel.review_status === 'approved' ? 'success' : 'error'
                    }
                    text={reviewInfo.text}
                  />
                </Descriptions.Item>

                <Descriptions.Item label="发布状态">
                  <Badge
                    status={hotel.publish_status === 'published' ? 'success' : 'default'}
                    text={publishInfo.text}
                  />
                </Descriptions.Item>

                <Descriptions.Item label="附近景点/商圈" span={2}>
                  {hotel.nearby_attractions || "-"}
                </Descriptions.Item>

                {hotel.discount && hotel.discount < 1 && (
                  <>
                    <Descriptions.Item label="折扣比例">
                      <Tag color="red" style={{ padding: '4px 12px' }}>
                        {(hotel.discount * 10).toFixed(0)}折
                      </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="优惠描述">
                      {hotel.discount_description || "-"}
                    </Descriptions.Item>
                  </>
                )}
              </Descriptions>
            </Section>
          </TabPane>
        </Tabs>
      </ContentCard>
    </PageContainer>
  );
};

export default HotelView;