import React, { useState, useEffect } from "react";
import { IMAGE_BASE } from "@/config/constants";
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Upload,
  Button,
  Space,
  Row,
  Col,
  Typography,
  Tag,
  Divider,
  message,
  Tooltip,
  Flex,
  Progress,
  Modal,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  PictureOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  DollarOutlined,
  TagOutlined,
  AppstoreOutlined,
  HomeOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import type { UploadFile, UploadProps } from "antd";
import type { RcFile } from "antd/es/upload";
import dayjs from "dayjs";
import { api } from "@/api";
import "dayjs/locale/zh-cn";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// 样式组件
const FormContainer = styled.div`
  padding: 32px;
`;

const FormSection = styled.div`
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;

  .section-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1890ff10, #36cfc910);
    border-radius: 8px;
    color: #1890ff;
    font-size: 18px;
  }

  .section-title {
    flex: 1;
    h4 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #1f1f1f;
    }
    p {
      margin: 4px 0 0;
      font-size: 13px;
      color: #8c8c8c;
    }
  }
`;

const RoomTypeCard = styled.div`
  background: #fafafa;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;

  &:hover {
    border-color: #1890ff;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.08);
    background: #fff;
  }
`;

const FacilityTag = styled(Tag)<{ selected: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid ${(props) => (props.selected ? "#1890ff" : "#d9d9d9")};
  background: ${(props) => (props.selected ? "#e6f7ff" : "#fff")};
  color: ${(props) => (props.selected ? "#1890ff" : "#595959")};
  transition: all 0.2s ease;
  margin: 4px;

  &:hover {
    border-color: #1890ff;
    color: #1890ff;
    background: #e6f7ff;
    transform: translateY(-1px);
  }
`;

const SubmitBar = styled.div`
  position: sticky;
  bottom: 0;
  background: #fff;
  padding: 24px 32px;
  border-top: 1px solid #f0f0f0;
  margin-top: 24px;
  border-radius: 0 0 16px 16px;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.02);
  z-index: 10;
`;

// 常量定义
const STAR_OPTIONS = [
  { value: 1, label: "⭐ 经济型 (1星)" },
  { value: 2, label: "⭐⭐ 舒适型 (2星)" },
  { value: 3, label: "⭐⭐⭐ 高档型 (3星)" },
  { value: 4, label: "⭐⭐⭐⭐ 豪华型 (4星)" },
  { value: 5, label: "⭐⭐⭐⭐⭐ 奢华型 (5星)" },
];

const FACILITIES = [
  { key: "wifi", label: "Wi-Fi", icon: "📶" },
  { key: "parking", label: "停车场", icon: "🅿️" },
  { key: "gym", label: "健身房", icon: "💪" },
  { key: "pool", label: "游泳池", icon: "🏊" },
  { key: "spa", label: "水疗中心", icon: "💆" },
  { key: "breakfast", label: "早餐", icon: "🍳" },
  { key: "restaurant", label: "餐厅", icon: "🍽️" },
  { key: "bar", label: "酒吧", icon: "🍸" },
  { key: "concierge", label: "礼宾服务", icon: "👔" },
  { key: "laundry", label: "洗衣服务", icon: "🧺" },
  { key: "airport-shuttle", label: "机场班车", icon: "🚌" },
  { key: "business-center", label: "商务中心", icon: "💼" },
  { key: "meeting-rooms", label: "会议室", icon: "📊" },
  { key: "disabled-access", label: "无障碍设施", icon: "♿" },
  { key: "pet-friendly", label: "宠物友好", icon: "🐕" },
  { key: "smoke-free", label: "禁烟", icon: "🚭" },
  { key: "family-rooms", label: "家庭房", icon: "👪" },
];

const ROOM_FACILITIES = [
  { key: "wifi", label: "Wi-Fi", icon: "📶" },
  { key: "tv", label: "电视", icon: "📺" },
  { key: "air-conditioner", label: "空调", icon: "❄️" },
  { key: "fridge", label: "冰箱", icon: "🧊" },
  { key: "safe", label: "保险箱", icon: "🔒" },
  { key: "hairdryer", label: "吹风机", icon: "💨" },
  { key: "bathtub", label: "浴缸", icon: "🛁" },
  { key: "balcony", label: "阳台", icon: "🏞️" },
  { key: "kitchen", label: "厨房", icon: "🍳" },
];

const TAGS = [
  { label: "亲子", color: "#ff85b3" },
  { label: "豪华", color: "#722ed1" },
  { label: "商务", color: "#0958d9" },
  { label: "情侣", color: "#f759ab" },
  { label: "度假", color: "#13c2c2" },
  { label: "温泉", color: "#fa8c16" },
  { label: "海景", color: "#1677ff" },
  { label: "山景", color: "#389e0d" },
  { label: "城市中心", color: "#fa541c" },
  { label: "机场附近", color: "#722ed1" },
  { label: "火车站附近", color: "#eb2f96" },
  { label: "免费停车", color: "#52c41a" },
  { label: "免费早餐", color: "#faad14" },
  { label: "泳池", color: "#13c2c2" },
  { label: "健身房", color: "#fa8c16" },
  { label: "SPA", color: "#eb2f96" },
];

interface RoomType {
  key: string;
  type: string;
  price: number;
  facilities: string[];
  description: string;
  images: string[];
}

interface HotelFormProps {
  initialValues?: any;
  onSubmit: (values: any) => Promise<void>;
  loading?: boolean;
  isEdit?: boolean;
}

const HotelForm: React.FC<HotelFormProps> = ({
  initialValues,
  onSubmit,
  loading = false,
  isEdit = false,
}) => {
  const [form] = Form.useForm();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([
    { key: "1", type: "", price: 0, facilities: [], description: "", images: [] },
  ]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  // 初始化表单值
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        open_date: initialValues.open_date
          ? dayjs(initialValues.open_date)
          : null,
      });

      if (initialValues.room_type && Array.isArray(initialValues.room_type)) {
        const formattedRoomTypes = initialValues.room_type.map(
          (room: any, index: number) => ({
            key: String(index + 1),
            type: room.type || "",
            price: room.price || 0,
            facilities: room.facilities || [],
            description: room.description || "",
            images: room.images || [],
          }),
        );
        setRoomTypes(formattedRoomTypes);
      }

      if (initialValues.facilities) {
        setSelectedFacilities(initialValues.facilities);
      }

      if (initialValues.tags) {
        setSelectedTags(initialValues.tags);
      }

      // 初始化图片列表
      if (initialValues.images && Array.isArray(initialValues.images)) {
        const files = initialValues.images.map((url: string, index: number) => {
          // 如果是相对路径，补全为完整 URL
          const imageUrl = url.startsWith("http")
            ? url
            : `${IMAGE_BASE}${url}`;

          return {
            uid: `-${index}`,
            name: url.split("/").pop() || `image-${index}.jpg`,
            status: "done" as const,
            url: imageUrl, // 保存完整 URL
            thumbUrl: imageUrl,
          };
        });
        setFileList(files);
      }
    }
  }, [initialValues, form]);

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      const validRoomTypes = roomTypes.filter(
        (room) => room.type && room.price > 0,
      );
      if (validRoomTypes.length === 0) {
        message.error("至少添加一个有效的房型");
        return;
      }

      // 提取已成功上传的图片 URL，并转换为相对路径
      const imageUrls = fileList
        .filter((file) => file.status === "done" && file.url)
        .map((file) => {
          // 如果是完整 URL，转换为相对路径
          if (file.url?.startsWith("http")) {
            return file.url.replace(IMAGE_BASE, "");
          }
          return file.url;
        })
        .filter(Boolean) as string[];

      const formData = {
        ...values,
        open_date: values.open_date
          ? values.open_date.format("YYYY-MM-DD")
          : null,
        room_type: validRoomTypes.map((room) => ({
          type: room.type,
          price: room.price,
          facilities: room.facilities,
          description: room.description,
          images: (room.images || [])
            .map((url: string) =>
              url?.startsWith("http") ? url.replace(IMAGE_BASE, "") : url
            )
            .filter(Boolean),
        })),
        images: imageUrls, // 提交相对路径
        facilities: selectedFacilities,
        tags: selectedTags,
        price: Math.min(...validRoomTypes.map((room) => room.price)),
      };

      await onSubmit(formData);
    } catch (error) {
      console.error("表单提交失败:", error);
    }
  };

  // 房型操作
  const addRoomType = () => {
    const newKey = String(roomTypes.length + 1);
    setRoomTypes([
      ...roomTypes,
      { key: newKey, type: "", price: 0, facilities: [], description: "", images: [] },
    ]);
  };

  const removeRoomType = (key: string) => {
    if (roomTypes.length > 1) {
      setRoomTypes(roomTypes.filter((room) => room.key !== key));
    } else {
      message.warning("至少需要一个房型");
    }
  };

  const updateRoomType = (key: string, field: keyof RoomType, value: any) => {
    setRoomTypes(
      roomTypes.map((room) =>
        room.key === key ? { ...room, [field]: value } : room,
      ),
    );
  };

  // 图片上传前的验证
  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("只能上传图片文件!");
      return Upload.LIST_IGNORE;
    }

    const isJpgOrPng =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/webp";
    if (!isJpgOrPng) {
      message.error("只支持 JPG、PNG、WebP 格式!");
      return Upload.LIST_IGNORE;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("图片大小不能超过5MB!");
      return Upload.LIST_IGNORE;
    }

    // 检查图片数量限制
    if (fileList.length >= 10) {
      message.error("最多只能上传10张图片!");
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  // 自定义上传 - 使用提供的 API
  const customUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;

    setUploading(true);

    try {
      // 调用单张图片上传 API
      const response = await api.upload.uploadImage(file);

      if (response.success) {
        // 从响应中获取图片 URL（完整 URL）
        const imageUrl = response.data.url;

        // 构造 UploadFile 对象，保存完整 URL
        const uploadedFile = {
          uid: file.uid,
          name: file.name,
          status: "done" as const,
          url: imageUrl, // 保存完整 URL
          thumbUrl: imageUrl,
          response: response.data,
        };

        onSuccess(response.data, file);
        message.success(`${file.name} 上传成功`);
      } else {
        onError(new Error(response.message));
        message.error(`${file.name} 上传失败: ${response.message}`);
      }
    } catch (error: any) {
      onError(error);
      message.error(`${file.name} 上传失败: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // 处理上传状态变化
  const handleUploadChange: UploadProps["onChange"] = ({
    fileList: newFileList,
  }) => {
    // 更新文件状态，处理上传完成的文件
    const updatedFileList = newFileList.map((file) => {
      if (file.status === "done" && file.response) {
        // 从响应中获取图片 URL（完整 URL）
        const { url } = file.response;

        return {
          ...file,
          url: url, // 保存完整 URL
          thumbUrl: url,
        };
      }
      return file;
    });

    setFileList(updatedFileList);
  };

  // 删除图片
  const handleRemove = async (file: UploadFile) => {
    try {
      if (file.url) {
        // 从 URL 中提取文件名
        const filename = file.url.split("/").pop();
        if (filename) {
          // 调用删除图片 API
          const response = await api.upload.deleteImage(filename);
          if (response.success) {
            message.success("图片删除成功");
          } else {
            message.warning("图片已从列表移除，但服务器删除可能失败");
          }
        }
      }
      return true;
    } catch (error: any) {
      message.error(`删除图片失败: ${error.message}`);
      return false;
    }
  };

  // 预览图片
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      return;
    }

    // 如果是相对路径，补全域名
    let previewUrl = file.url || file.preview!;
    if (previewUrl.startsWith("/uploads")) {
      previewUrl = `${IMAGE_BASE}${previewUrl}`;
    }

    setPreviewImage(previewUrl);
    setPreviewVisible(true);
    setPreviewTitle(
      file.name || previewUrl.substring(previewUrl.lastIndexOf("/") + 1),
    );
  };

  // 设施选择
  const toggleFacility = (facility: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((f) => f !== facility)
        : [...prev, facility],
    );
  };

  // 标签选择
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const addCustomTag = () => {
    const value = customTagInput.trim();
    if (value) {
      if (selectedTags.length >= 5) {
        message.warning("最多只能选择5个标签");
        return;
      }
      if (!selectedTags.includes(value)) {
        setSelectedTags([...selectedTags, value]);
        setCustomTagInput("");
      }
    }
  };

  // 上传按钮
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  );

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        star: 3,
        discount: 1,
      }}
    >
      <FormContainer>
        {/* 基础信息 */}
        <FormSection>
          <SectionHeader>
            <div className="section-icon">
              <HomeOutlined />
            </div>
            <div className="section-title">
              <h4>酒店基础信息</h4>
              <p>填写酒店的基本信息，包括名称、地址、星级等</p>
            </div>
          </SectionHeader>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="酒店名称（中文）"
                rules={[
                  { required: true, message: "请输入酒店名称" },
                  { max: 200, message: "酒店名称不能超过200个字符" },
                ]}
              >
                <Input
                  placeholder="请输入酒店中文名称"
                  size="large"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name_en"
                label="酒店英文名称"
                rules={[{ max: 200, message: "英文名称不能超过200个字符" }]}
              >
                <Input
                  placeholder="请输入酒店英文名称"
                  size="large"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label={
              <Space>
                <EnvironmentOutlined />
                <span>酒店地址</span>
              </Space>
            }
            rules={[{ required: true, message: "请输入酒店地址" }]}
          >
            <TextArea
              rows={3}
              placeholder="请输入详细地址，包括省市区街道门牌号"
              maxLength={500}
              showCount
              style={{ borderRadius: 8, resize: "none" }}
            />
          </Form.Item>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="star"
                label="酒店星级"
                rules={[{ required: true, message: "请选择酒店星级" }]}
              >
                <Select
                  options={STAR_OPTIONS}
                  placeholder="选择星级"
                  size="large"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="open_date"
                label={
                  <Space>
                    <CalendarOutlined />
                    <span>开业时间</span>
                  </Space>
                }
                rules={[{ required: true, message: "请选择开业时间" }]}
              >
                <DatePicker
                  style={{ width: "100%", borderRadius: 8 }}
                  placeholder="选择开业日期"
                  disabledDate={(current) =>
                    current && current > dayjs().endOf("day")
                  }
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="nearby_attractions"
                label={
                  <Space>
                    <TagOutlined />
                    <span>附近景点/商圈</span>
                    <Tooltip title="填写酒店附近的知名景点、购物中心等">
                      <InfoCircleOutlined style={{ color: "#8c8c8c" }} />
                    </Tooltip>
                  </Space>
                }
              >
                <Input
                  placeholder="如：外滩、南京路步行街"
                  size="large"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
          </Row>
        </FormSection>

        <Divider style={{ margin: "24px 0" }} />

        {/* 房型信息 */}
        <FormSection>
          <SectionHeader>
            <div className="section-icon">
              <DollarOutlined />
            </div>
            <div className="section-title">
              <h4>房型与价格</h4>
              <p>至少需要一个房型，价格最低的将作为酒店基础价格显示</p>
            </div>
          </SectionHeader>

          {roomTypes.map((room, index) => (
            <RoomTypeCard key={room.key}>
              <Row gutter={24} align="middle">
                <Col span={6}>
                  <Form.Item label="房型名称" style={{ margin: 0 }} required>
                    <Input
                      value={room.type}
                      onChange={(e) =>
                        updateRoomType(room.key, "type", e.target.value)
                      }
                      placeholder="如：标准大床房"
                      size="middle"
                      style={{ borderRadius: 6 }}
                    />
                  </Form.Item>
                </Col>
                <Col span={5}>
                  <Form.Item
                    label="价格（元/晚）"
                    style={{ margin: 0 }}
                    required
                  >
                    <InputNumber
                      value={room.price}
                      onChange={(value) =>
                        updateRoomType(room.key, "price", value)
                      }
                      placeholder="0"
                      min={0}
                      style={{ width: "100%", borderRadius: 6 }}
                      addonAfter="¥"
                    />
                  </Form.Item>
                </Col>
                <Col span={11}>
                  <Form.Item label="房型描述" style={{ margin: 0 }}>
                    <Input
                      value={room.description}
                      onChange={(e) =>
                        updateRoomType(room.key, "description", e.target.value)
                      }
                      placeholder="描述房型特色，如：海景房、25平米等"
                      style={{ borderRadius: 6 }}
                    />
                  </Form.Item>
                </Col>
                <Col span={2}>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeRoomType(room.key)}
                    disabled={roomTypes.length <= 1}
                    style={{ marginTop: 24 }}
                  >
                    删除
                  </Button>
                </Col>
              </Row>

              <Divider style={{ margin: "20px 0 16px" }} />

              <Text strong style={{ marginRight: 16, fontSize: 14 }}>
                房内设施：
              </Text>
              <Space wrap size={[8, 8]}>
                {ROOM_FACILITIES.map((facility) => (
                  <Tag
                    key={facility.key}
                    color={
                      room.facilities.includes(facility.key)
                        ? "processing"
                        : "default"
                    }
                    style={{
                      padding: "4px 12px",
                      borderRadius: 20,
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                    onClick={() => {
                      const newFacilities = room.facilities.includes(
                        facility.key,
                      )
                        ? room.facilities.filter((f) => f !== facility.key)
                        : [...room.facilities, facility.key];
                      updateRoomType(room.key, "facilities", newFacilities);
                    }}
                  >
                    {facility.icon} {facility.label}
                  </Tag>
                ))}
              </Space>

              <Divider style={{ margin: "16px 0" }} />

              <Text strong style={{ marginRight: 16, fontSize: 14, display: "block", marginBottom: 8 }}>
                房型图片：
              </Text>
              <Upload
                listType="picture-card"
                fileList={(room.images || []).map((url, idx) => ({
                  uid: `room-${room.key}-${idx}`,
                  name: url.split("/").pop() || `image-${idx}.jpg`,
                  status: "done" as const,
                  url: url.startsWith("http") ? url : `${IMAGE_BASE}${url}`,
                  thumbUrl: url.startsWith("http") ? url : `${IMAGE_BASE}${url}`,
                }))}
                beforeUpload={(file) => {
                  const isImage = file.type.startsWith("image/");
                  if (!isImage) {
                    message.error("只能上传图片文件!");
                    return Upload.LIST_IGNORE;
                  }
                  if ((room.images || []).length >= 5) {
                    message.error("每个房型最多5张图片!");
                    return Upload.LIST_IGNORE;
                  }
                  return true;
                }}
                customRequest={async (options) => {
                  const { file, onSuccess, onError } = options;
                  try {
                    const response = await api.upload.uploadImage(file as File);
                    if (response.success && response.data?.url) {
                      const newImages = [...(room.images || []), response.data.url];
                      updateRoomType(room.key, "images", newImages);
                      onSuccess?.(response.data, file as any);
                      message.success("上传成功");
                    } else {
                      onError?.(new Error(response.message));
                    }
                  } catch (err: any) {
                    onError?.(err);
                    message.error(err?.message || "上传失败");
                  }
                }}
                onRemove={(file) => {
                  const current = room.images || [];
                  const newImages = current.filter(
                    (u) => u !== file.url && (u.startsWith("http") ? u : `${IMAGE_BASE}${u}`) !== file.url
                  );
                  updateRoomType(room.key, "images", newImages);
                }}
                showUploadList={{ showPreviewIcon: false }}
              >
                {(room.images || []).length < 5 && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>上传</div>
                  </div>
                )}
              </Upload>
            </RoomTypeCard>
          ))}

          <Button
            type="dashed"
            onClick={addRoomType}
            block
            icon={<PlusOutlined />}
            size="large"
            style={{
              marginTop: 16,
              borderRadius: 8,
              height: 50,
              borderStyle: "dashed",
            }}
          >
            添加房型
          </Button>
        </FormSection>

        <Divider style={{ margin: "24px 0" }} />

        {/* 图片上传 */}
        <FormSection>
          <SectionHeader>
            <div className="section-icon">
              <PictureOutlined />
            </div>
            <div className="section-title">
              <h4>酒店图片</h4>
              <p>
                建议上传5-10张高质量图片，第一张将作为酒店封面（支持
                JPG、PNG、WebP，单张不超过5MB）
              </p>
            </div>
          </SectionHeader>

          <Upload
            customRequest={customUpload}
            listType="picture-card"
            fileList={fileList}
            onChange={handleUploadChange}
            onRemove={handleRemove}
            onPreview={handlePreview}
            beforeUpload={beforeUpload}
            multiple
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading || fileList.length >= 10}
          >
            {fileList.length >= 10 ? null : uploadButton}
          </Upload>

          {uploading && (
            <div style={{ marginTop: 16, width: "100%" }}>
              <Progress percent={50} status="active" />
            </div>
          )}

          <Paragraph type="secondary" style={{ marginTop: 16, fontSize: 13 }}>
            <InfoCircleOutlined /> 已上传 {fileList.length} / 10 张图片
          </Paragraph>
        </FormSection>

        {/* 图片预览 Modal */}
        <Modal
          open={previewVisible}
          title={previewTitle}
          footer={null}
          onCancel={() => setPreviewVisible(false)}
        >
          <img alt="预览" style={{ width: "100%" }} src={previewImage} />
        </Modal>

        <Divider style={{ margin: "24px 0" }} />

        {/* 设施服务 */}
        <FormSection>
          <SectionHeader>
            <div className="section-icon">
              <AppstoreOutlined />
            </div>
            <div className="section-title">
              <h4>设施与服务</h4>
              <p>选择酒店提供的设施和服务，让客人更好地了解您的酒店</p>
            </div>
          </SectionHeader>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 16,
            }}
          >
            {FACILITIES.map((facility) => (
              <FacilityTag
                key={facility.key}
                selected={selectedFacilities.includes(facility.key)}
                onClick={() => toggleFacility(facility.key)}
              >
                {facility.icon} {facility.label}
              </FacilityTag>
            ))}
          </div>
          <Text type="secondary" style={{ fontSize: 13 }}>
            已选择 {selectedFacilities.length} 项设施
          </Text>
        </FormSection>

        <Divider style={{ margin: "24px 0" }} />

        {/* 标签分类 */}
        <FormSection>
          <SectionHeader>
            <div className="section-icon">
              <TagOutlined />
            </div>
            <div className="section-title">
              <h4>酒店标签</h4>
              <p>标签有助于用户快速找到您的酒店，最多选择5个</p>
            </div>
          </SectionHeader>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 16,
            }}
          >
            {TAGS.map((tag) => (
              <Tag
                key={tag.label}
                color={selectedTags.includes(tag.label) ? tag.color : "default"}
                style={{
                  padding: "8px 16px",
                  borderRadius: 20,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  opacity:
                    selectedTags.length >= 5 &&
                    !selectedTags.includes(tag.label)
                      ? 0.5
                      : 1,
                }}
                onClick={() => {
                  if (
                    selectedTags.length >= 5 &&
                    !selectedTags.includes(tag.label)
                  ) {
                    message.warning("最多只能选择5个标签");
                    return;
                  }
                  toggleTag(tag.label);
                }}
              >
                {tag.label}
              </Tag>
            ))}
          </div>

          <Space.Compact style={{ width: 300 }}>
            <Input
              placeholder="自定义标签"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onPressEnter={addCustomTag}
              disabled={selectedTags.length >= 5}
              style={{ borderRadius: "20px 0 0 20px" }}
            />
            <Button
              type="primary"
              onClick={addCustomTag}
              disabled={selectedTags.length >= 5 || !customTagInput.trim()}
              style={{ borderRadius: "0 20px 20px 0" }}
            >
              添加
            </Button>
          </Space.Compact>

          <div style={{ marginTop: 16 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              已选择 {selectedTags.length}/5 个标签
            </Text>
            {selectedTags.length > 0 && (
              <div style={{ marginTop: 8 }}>
                {selectedTags.map((tag) => (
                  <Tag
                    key={tag}
                    closable
                    onClose={() => toggleTag(tag)}
                    style={{
                      marginRight: 8,
                      marginBottom: 8,
                      padding: "4px 8px",
                    }}
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
            )}
          </div>
        </FormSection>

        <Divider style={{ margin: "24px 0" }} />

        {/* 优惠信息 */}
        <FormSection>
          <SectionHeader>
            <div className="section-icon">
              <GiftOutlined />
            </div>
            <div className="section-title">
              <h4>优惠活动</h4>
              <p>设置酒店折扣和优惠信息，吸引更多客人预订</p>
            </div>
          </SectionHeader>

          <Row gutter={24}>
            <Col span={6}>
              <Form.Item
                name="discount"
                label="折扣比例"
                tooltip="1表示原价，0.8表示8折"
              >
                <Select
                  placeholder="选择折扣"
                  size="large"
                  style={{ borderRadius: 8 }}
                  allowClear
                >
                  <Select.Option value={1}>原价 (无折扣)</Select.Option>
                  <Select.Option value={0.9}>9折</Select.Option>
                  <Select.Option value={0.8}>8折</Select.Option>
                  <Select.Option value={0.7}>7折</Select.Option>
                  <Select.Option value={0.6}>6折</Select.Option>
                  <Select.Option value={0.5}>5折</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="discount_description" label="优惠描述">
                <Input
                  placeholder="如：春节特惠、新用户专享、连住优惠等"
                  size="large"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
          </Row>
        </FormSection>
      </FormContainer>

      {/* 提交按钮栏 */}
      <SubmitBar>
        <Flex justify="space-between" align="center">
          <Text type="secondary" style={{ fontSize: 14 }}>
            <InfoCircleOutlined />{" "}
            {isEdit
              ? "修改酒店信息后需要重新审核，发布状态保持不变，审核通过后可手动发布"
              : "提交后酒店将进入审核状态，审核通过后需手动发布才会在前端显示"}
          </Text>
          <Space size={16}>
            <Button
              size="large"
              onClick={() => window.history.back()}
              style={{ borderRadius: 8, minWidth: 100 }}
            >
              取消
            </Button>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={loading || uploading}
              style={{
                borderRadius: 8,
                minWidth: 140,
                background: "linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)",
                border: "none",
              }}
            >
              {isEdit ? "更新酒店信息" : "提交审核"}
            </Button>
          </Space>
        </Flex>
      </SubmitBar>
    </Form>
  );
};

export default HotelForm;
