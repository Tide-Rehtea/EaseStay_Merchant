// HotelView.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  MinusCircleOutlined,
  StarOutlined,
  PictureOutlined,
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
  GlobalOutlined
} from "@ant-design/icons";
import styled from "styled-components";
import dayjs from "dayjs";
import { api } from "@/api";
import type { ResHotel } from "@/api/types";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// 样式组件 - 先定义所有基础组件
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
//   padding: 4px;
  min-height: 100%;
`;

const PageHeaderContainer = styled.div`
  background: #fff;
  padding: 24px 32px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
`;

const ContentCard = styled(Card)`
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border: 1px solid #f0f0f0;
  overflow: hidden;

  .ant-card-body {
    padding: 0;
  }

  .ant-tabs-nav {
    padding: 0 32px;
    margin: 0;
    border-bottom: 1px solid #f0f0f0;
  }

  .ant-tabs-tab {
    padding: 16px 24px;
    margin: 0;
    transition: all 0.3s;

    &:hover {
      color: #1890ff;
    }

    .anticon {
      margin-right: 8px;
    }
  }

  .ant-tabs-tab-active {
    background: #fff;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border: 1px solid #f0f0f0;

  .ant-spin {
    .ant-spin-text {
      margin-top: 8px;
      color: #1890ff;
    }
  }
`;

const StatusTag = styled.div<{ status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 500;
  background: ${(props) =>
    props.status === "pending"
      ? "linear-gradient(135deg, #fff7e6 0%, #fff2e0 100%)"
      : props.status === "approved"
        ? "linear-gradient(135deg, #f6ffed 0%, #f0ffe6 100%)"
        : props.status === "rejected"
          ? "linear-gradient(135deg, #fff2f0 0%, #ffece8 100%)"
          : "linear-gradient(135deg, #f5f5f5 0%, #f0f0f0 100%)"};
  color: ${(props) =>
    props.status === "pending"
      ? "#fa8c16"
      : props.status === "approved"
        ? "#52c41a"
        : props.status === "rejected"
          ? "#f5222d"
          : "#8c8c8c"};
  border: 1px solid
    ${(props) =>
      props.status === "pending"
        ? "#ffd591"
        : props.status === "approved"
          ? "#b7eb8f"
          : props.status === "rejected"
            ? "#ffccc7"
            : "#d9d9d9"};
`;

const Section = styled.div`
  padding: 32px;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;

  .icon-wrapper {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
    border-radius: 12px;
    color: #1890ff;
    font-size: 20px;
  }

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1f1f1f;
  }
`;

const GallerySection = styled.div`
  padding: 32px;
  background: #fafafa;
`;

const MainImage = styled.div`
  width: 100%;
  height: 500px;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16);

    .expand-icon {
      opacity: 1;
    }
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .expand-icon {
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 48px;
    height: 48px;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.3s;
    border: 2px solid rgba(255, 255, 255, 0.2);

    &:hover {
      background: rgba(0, 0, 0, 0.7);
      transform: scale(1.1);
    }
  }
`;

const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 16px;
`;

const Thumbnail = styled.div<{ active: boolean }>`
  aspect-ratio: 16/9;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid ${(props) => (props.active ? "#1890ff" : "transparent")};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(24, 144, 255, 0.2);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RoomCard = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: #1890ff;
    box-shadow: 0 8px 24px rgba(24, 144, 255, 0.12);

    &::before {
      opacity: 1;
    }
  }
`;

const RoomPrice = styled.div`
  background: linear-gradient(135deg, #fff2f0 0%, #ffece8 100%);
  padding: 12px 20px;
  border-radius: 40px;
  display: inline-block;

  .price {
    color: #ff4d4f;
    font-size: 28px;
    font-weight: 700;
    font-family: "Arial", sans-serif;
  }

  .unit {
    color: #8c8c8c;
    font-size: 14px;
    margin-left: 6px;
  }
`;

// 重新定义 InfoCard 在 RoomFacilityTag 之前
const InfoCard = styled(Card)`
  border-radius: 16px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);

  .ant-card-head {
    border-bottom: 1px solid #f0f0f0;
    padding: 0 20px;
    min-height: 56px;
    background: #fafafa;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
  }

  .ant-card-head-title {
    font-size: 16px;
    font-weight: 600;
  }

  .ant-card-body {
    padding: 24px;
  }
`;

const RoomFacilityTag = styled(Tag)`
  padding: 6px 14px;
  border-radius: 30px;
  font-size: 13px;
  margin: 4px;
  border: 1px solid #d9d9d9;
  background: #fff;
  color: #595959;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  .anticon {
    color: #1890ff;
    font-size: 14px;
  }
`;

const FacilityBadge = styled(Tag)`
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 13px;
  margin: 4px;
  border: none;
  background: linear-gradient(135deg, #f5f5f5 0%, #f0f0f0 100%);
  color: #595959;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .anticon {
    color: #1890ff;
    font-size: 14px;
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px dashed #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .label {
    color: #8c8c8c;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;

    .anticon {
      color: #1890ff;
    }
  }

  .value {
    color: #262626;
    font-weight: 600;
    font-size: 16px;
  }
`;

const TagCloud = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
`;

const CustomTag = styled(Tag)<{ color?: string }>`
  padding: 8px 18px;
  border-radius: 30px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  background: ${(props) => {
    switch (props.color) {
      case "亲子":
        return "linear-gradient(135deg, #ff85b3 0%, #ffadd2 100%)";
      case "豪华":
        return "linear-gradient(135deg, #722ed1 0%, #9254de 100%)";
      case "商务":
        return "linear-gradient(135deg, #0958d9 0%, #1677ff 100%)";
      case "情侣":
        return "linear-gradient(135deg, #f759ab 0%, #ff85c0 100%)";
      case "度假":
        return "linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)";
      case "温泉":
        return "linear-gradient(135deg, #fa8c16 0%, #ffa940 100%)";
      case "海景":
        return "linear-gradient(135deg, #1677ff 0%, #4096ff 100%)";
      case "山景":
        return "linear-gradient(135deg, #389e0d 0%, #52c41a 100%)";
      case "城市中心":
        return "linear-gradient(135deg, #fa541c 0%, #ff7a45 100%)";
      case "机场附近":
        return "linear-gradient(135deg, #722ed1 0%, #9254de 100%)";
      case "火车站附近":
        return "linear-gradient(135deg, #eb2f96 0%, #f759ab 100%)";
      case "免费停车":
        return "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)";
      case "免费早餐":
        return "linear-gradient(135deg, #faad14 0%, #ffc53d 100%)";
      case "泳池":
        return "linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)";
      case "健身房":
        return "linear-gradient(135deg, #fa8c16 0%, #ffa940 100%)";
      case "SPA":
        return "linear-gradient(135deg, #eb2f96 0%, #f759ab 100%)";
      default:
        return "linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)";
    }
  }};
  color: ${(props) => {
    switch (props.color) {
      case "亲子":
      case "豪华":
      case "商务":
      case "情侣":
      case "度假":
      case "温泉":
      case "海景":
      case "山景":
      case "城市中心":
      case "机场附近":
      case "火车站附近":
      case "免费停车":
      case "免费早餐":
      case "泳池":
      case "健身房":
      case "SPA":
        return "#fff";
      default:
        return "#0050b3";
    }
  }};
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const TwoColumnLayout = styled(Row)`
  display: flex;
  flex-wrap: nowrap;
  gap: 24px;

  @media (max-width: 1200px) {
    flex-wrap: wrap;
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
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f5f5;
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: #d9d9d9;
    border-radius: 2px;

    &:hover {
      background: #bfbfbf;
    }
  }
`;

const CompactStatItem = styled(StatItem)`
  padding: 8px 0;

  .label {
    font-size: 13px;
  }

  .value {
    font-size: 14px;
  }
`;

const FacilityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 8px;
`;

const CompactFacilityBadge = styled(FacilityBadge)`
  padding: 6px 12px;
  font-size: 12px;
  margin: 0;
  width: 100%;
  justify-content: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TagGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 8px;
`;

const CompactCustomTag = styled(CustomTag)`
  padding: 6px 12px;
  font-size: 12px;
  text-align: center;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// 房内设施映射
const roomFacilityMap: Record<
  string,
  { label: string; icon: React.ReactNode }
> = {
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

const HotelView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [hotel, setHotel] = useState<ResHotel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [previewVisible, setPreviewVisible] = useState(false);

  // 获取酒店详情
  useEffect(() => {
    if (id) {
      fetchHotelDetail(parseInt(id));
    }
  }, [id]);

  const fetchHotelDetail = async (hotelId: number) => {
    setLoading(true);
    try {
      const response = await api.hotel.getById(hotelId);
      console.log("API Response:", response); // 添加这行
      if (response.success) {
        setHotel(response.data.hotel);
        if (
          response.data.hotel.images &&
          response.data.hotel.images.length > 0
        ) {
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

  // 获取完整图片URL
  const getImageUrl = (path: string) => {
    return path.startsWith("http") ? path : `http://localhost:3001${path}`;
  };

  // 状态配置
  const getStatusConfig = (status: string) => {
    const config: Record<
      string,
      { color: string; text: string; icon: React.ReactNode }
    > = {
      pending: {
        color: "orange",
        text: "待审核",
        icon: <ClockCircleOutlined />,
      },
      approved: {
        color: "green",
        text: "已通过",
        icon: <CheckCircleOutlined />,
      },
      rejected: {
        color: "red",
        text: "已拒绝",
        icon: <CloseCircleOutlined />,
      },
      offline: {
        color: "gray",
        text: "已下线",
        icon: <MinusCircleOutlined />,
      },
    };
    return config[status] || config.pending;
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spin size="large" tip="加载酒店信息..." />
      </LoadingContainer>
    );
  }

  if (error || !hotel) {
    return (
      <PageContainer>
        <Result
          status="error"
          title="加载失败"
          subTitle={error || "酒店不存在"}
          extra={[
            <Button
              key="back"
              type="primary"
              onClick={() => navigate("/merchant/hotels")}
              icon={<ArrowLeftOutlined />}
              size="large"
              style={{ borderRadius: 12, height: 48, padding: "0 32px" }}
            >
              返回酒店列表
            </Button>,
          ]}
        />
      </PageContainer>
    );
  }

  const statusConfig = getStatusConfig(hotel.status);
  const lowestPrice =
    hotel.room_type?.reduce(
      (min, room) => Math.min(min, room.price),
      Infinity,
    ) || 0;

  // 在这里添加调试代码 👇
  console.log("========== 调试信息 ==========");
  console.log("酒店数据:", hotel);
  console.log("设施数据:", hotel.facilities);
  console.log("设施数组长度:", hotel.facilities?.length);
  console.log("标签数据:", hotel.tags);
  console.log("标签数组长度:", hotel.tags?.length);
  console.log("==============================");

  return (
    <PageContainer>
      {/* 页面头部 */}
      <PageHeaderContainer>
        <Flex vertical gap={16}>
          <Flex justify="space-between" align="center">
            <Flex align="center" gap={16}>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/merchant/hotels")}
                size="large"
                style={{ borderRadius: 12 }}
              >
                返回列表
              </Button>

              <Title
                level={2}
                style={{ margin: 0, fontWeight: 700, color: "#1f1f1f" }}
              >
                {hotel.name}
              </Title>

              <StatusTag status={hotel.status}>
                {statusConfig.icon}
                {statusConfig.text}
              </StatusTag>
            </Flex>

            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/merchant/hotels/${id}`)}
              disabled={hotel.status === "pending"}
              size="large"
              style={{
                borderRadius: 12,
                height: 48,
                padding: "0 32px",
                background: "linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)",
                border: "none",
                boxShadow: "0 4px 12px rgba(24, 144, 255, 0.3)",
              }}
            >
              编辑酒店
            </Button>
          </Flex>

          {hotel.reject_reason && (
            <Alert
              message="审核拒绝原因"
              description={hotel.reject_reason}
              type="error"
              showIcon
              style={{ borderRadius: 12, marginTop: 16 }}
            />
          )}
        </Flex>
      </PageHeaderContainer>

      {/* 主要内容 */}
      <ContentCard>
        <Tabs defaultActiveKey="1" size="large">
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
            {hotel.images && hotel.images.length > 0 && (
              <GallerySection>
                <MainImage onClick={() => setPreviewVisible(true)}>
                  <img src={getImageUrl(selectedImage)} alt="酒店主图" />
                  <div className="expand-icon">
                    <ExpandOutlined />
                  </div>
                </MainImage>

                <ThumbnailGrid>
                  {hotel.images.map((img, index) => (
                    <Thumbnail
                      key={index}
                      active={selectedImage === img}
                      onClick={() => setSelectedImage(img)}
                    >
                      <img src={getImageUrl(img)} alt={`缩略图${index + 1}`} />
                    </Thumbnail>
                  ))}
                </ThumbnailGrid>

                {/* 图片预览 Modal */}
                <Image
                  style={{ display: "none" }}
                  preview={{
                    visible: previewVisible,
                    src: getImageUrl(selectedImage),
                    onVisibleChange: setPreviewVisible,
                    toolbarRender: () => null,
                  }}
                />
              </GallerySection>
            )}

            <Section>
              <TwoColumnLayout gutter={32}>
                <LeftColumn span={16}>
                  {/* 位置信息 */}
                  <SectionTitle>
                    <div className="icon-wrapper">
                      <EnvironmentOutlined />
                    </div>
                    <h3>位置信息</h3>
                  </SectionTitle>

                  <Paragraph
                    style={{ fontSize: 16, marginBottom: 16, lineHeight: 1.8 }}
                  >
                    {hotel.address}
                  </Paragraph>

                  {hotel.nearby_attractions && (
                    <Paragraph type="secondary" style={{ fontSize: 15 }}>
                      <TagOutlined
                        style={{ marginRight: 8, color: "#1890ff" }}
                      />
                      附近景点/商圈：{hotel.nearby_attractions}
                    </Paragraph>
                  )}

                  <Divider style={{ margin: "24px 0" }} />

                  {/* 房型信息 */}
                  <SectionTitle>
                    <div className="icon-wrapper">
                      <DollarOutlined />
                    </div>
                    <h3>房型与价格</h3>
                  </SectionTitle>

                  <Flex align="center" gap={16} style={{ marginBottom: 24 }}>
                    <RoomPrice>
                      <span className="price">
                        ¥{lowestPrice.toLocaleString()}
                      </span>
                      <span className="unit">起/晚</span>
                    </RoomPrice>
                    <Text type="secondary">
                      共 {hotel.room_type?.length} 种房型
                    </Text>
                  </Flex>

                  {hotel.room_type?.map((room, index) => (
                    <RoomCard key={index}>
                      <Row gutter={24} align="middle">
                        <Col span={8}>
                          <Title
                            level={4}
                            style={{ margin: 0, color: "#1890ff" }}
                          >
                            {room.type}
                          </Title>
                        </Col>
                        <Col span={6}>
                          <Text
                            strong
                            style={{ fontSize: 24, color: "#ff4d4f" }}
                          >
                            ¥{room.price.toLocaleString()}
                          </Text>
                          <Text type="secondary"> /晚</Text>
                        </Col>
                        <Col span={10}>
                          {room.description && (
                            <Text type="secondary" style={{ fontSize: 14 }}>
                              {room.description}
                            </Text>
                          )}
                        </Col>
                      </Row>

                      {/* 房内设施 */}
                      {room.facilities && room.facilities.length > 0 && (
                        <Flex wrap gap={8} style={{ marginTop: 16 }}>
                          {room.facilities.map((facility) => {
                            const facilityInfo = roomFacilityMap[facility] || {
                              label: facility,
                              icon: <AppstoreOutlined />,
                            };
                            return (
                              <RoomFacilityTag key={facility}>
                                {facilityInfo.icon}
                                {facilityInfo.label}
                              </RoomFacilityTag>
                            );
                          })}
                        </Flex>
                      )}
                    </RoomCard>
                  ))}
                </LeftColumn>

                <RightColumn span={8}>
                  {/* 快捷信息卡片 - 更紧凑的布局 */}
                  <StickyInfoCard title="酒店信息">
                    <CompactStatItem>
                      <span className="label">
                        <StarOutlined /> 星级
                      </span>
                      <span className="value">
                        <Rate
                          disabled
                          defaultValue={hotel.star}
                          style={{ fontSize: 12 }}
                        />
                      </span>
                    </CompactStatItem>

                    <CompactStatItem>
                      <span className="label">
                        <CalendarOutlined /> 开业
                      </span>
                      <span className="value">
                        {dayjs(hotel.open_date).format("YYYY年MM月")}
                      </span>
                    </CompactStatItem>

                    <CompactStatItem>
                      <span className="label">
                        <SwapOutlined /> 更新
                      </span>
                      <span className="value">
                        {dayjs(hotel.updated_at).format("YYYY-MM-DD")}
                      </span>
                    </CompactStatItem>

                    {hotel.discount && hotel.discount < 1 && (
                      <>
                        <Divider style={{ margin: "12px 0" }} />
                        <CompactStatItem>
                          <span className="label">
                            <TagOutlined /> 折扣
                          </span>
                          <span className="value" style={{ color: "#ff4d4f" }}>
                            {(hotel.discount * 10).toFixed(0)}折
                          </span>
                        </CompactStatItem>
                        {hotel.discount_description && (
                          <Text
                            type="secondary"
                            style={{
                              fontSize: 12,
                              display: "block",
                              marginTop: 4,
                            }}
                          >
                            {hotel.discount_description}
                          </Text>
                        )}
                      </>
                    )}
                  </StickyInfoCard>

                  {/* 设施与服务 - 网格布局 */}
                  {hotel.facilities && hotel.facilities.length > 0 && (
                    <InfoCard title="设施与服务">
                      <FacilityGrid>
                        {hotel.facilities.map((facility) => {
                          const facilityInfo = facilityMap[facility] || {
                            label: facility,
                            icon: <AppstoreOutlined />,
                          };
                          return (
                            <CompactFacilityBadge key={facility}>
                              {facilityInfo.icon}
                              {facilityInfo.label}
                            </CompactFacilityBadge>
                          );
                        })}
                      </FacilityGrid>
                    </InfoCard>
                  )}

                  {/* 酒店标签 - 网格布局 */}
                  {hotel.tags && hotel.tags.length > 0 && (
                    <InfoCard title="酒店标签">
                      <TagGrid>
                        {hotel.tags.map((tag) => (
                          <CompactCustomTag key={tag} color={tag}>
                            {tag}
                          </CompactCustomTag>
                        ))}
                      </TagGrid>
                    </InfoCard>
                  )}
                </RightColumn>
              </TwoColumnLayout>
            </Section>
          </TabPane>

          <TabPane
            tab={
              <span>
                <AppstoreOutlined />
                详细信息
              </span>
            }
            key="2"
          >
            <Section>
              <Descriptions
                bordered
                column={2}
                size="middle"
                labelStyle={{
                  width: 180,
                  background: "#fafafa",
                  fontWeight: 500,
                  padding: "16px 24px",
                }}
                contentStyle={{
                  padding: "16px 24px",
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
                  <EnvironmentOutlined
                    style={{ color: "#1890ff", marginRight: 8 }}
                  />
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

                <Descriptions.Item label="酒店状态">
                  <Badge
                    status={statusConfig.color as any}
                    text={statusConfig.text}
                  />
                </Descriptions.Item>

                <Descriptions.Item label="附近景点/商圈" span={2}>
                  {hotel.nearby_attractions || "-"}
                </Descriptions.Item>

                {hotel.discount && hotel.discount < 1 && (
                  <>
                    <Descriptions.Item label="折扣比例">
                      {(hotel.discount * 10).toFixed(0)}折
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
