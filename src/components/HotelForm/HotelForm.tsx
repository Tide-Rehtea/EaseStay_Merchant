import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Upload,
  Button,
  Space,
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Divider,
  message,
  Tooltip,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  PictureOutlined,
  InfoCircleOutlined,
  StarOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  DollarOutlined,
  TagOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import type { UploadFile } from 'antd';
import type { RcFile, UploadProps } from 'antd/es/upload';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// 样式组件
const FormSection = styled(Card)`
  margin-bottom: 24px;
  .ant-card-head {
    border-bottom: 1px solid #f0f0f0;
  }
`;

const RoomTypeCard = styled(Card)`
  margin-bottom: 16px;
  border: 1px dashed #d9d9d9;
  &:hover {
    border-color: #1890ff;
  }
`;

const ImagePreview = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  
  .preview-item {
    width: 100px;
    height: 100px;
    border-radius: 6px;
    overflow: hidden;
    position: relative;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .delete-btn {
      position: absolute;
      top: 4px;
      right: 4px;
      display: none;
    }
    
    &:hover .delete-btn {
      display: block;
    }
  }
`;

const FacilityTag = styled(Tag)`
  margin-bottom: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  
  &.selected {
    background: #1890ff;
    color: white;
    border-color: #1890ff;
  }
`;

// 常量定义
const STAR_OPTIONS = [
  { value: 1, label: '⭐ 经济型' },
  { value: 2, label: '⭐⭐ 舒适型' },
  { value: 3, label: '⭐⭐⭐ 高档型' },
  { value: 4, label: '⭐⭐⭐⭐ 豪华型' },
  { value: 5, label: '⭐⭐⭐⭐⭐ 奢华型' },
];

const FACILITIES = [
  'wifi', 'parking', 'gym', 'pool', 'spa', 'breakfast', 
  'restaurant', 'bar', 'concierge', 'laundry', 'airport-shuttle',
  'business-center', 'meeting-rooms', 'disabled-access', 'pet-friendly',
  'smoke-free', 'family-rooms', 'non-smoking'
];

const FACILITY_LABELS: Record<string, string> = {
  'wifi': 'Wi-Fi',
  'parking': '停车场',
  'gym': '健身房',
  'pool': '游泳池',
  'spa': '水疗中心',
  'breakfast': '早餐',
  'restaurant': '餐厅',
  'bar': '酒吧',
  'concierge': '礼宾服务',
  'laundry': '洗衣服务',
  'airport-shuttle': '机场班车',
  'business-center': '商务中心',
  'meeting-rooms': '会议室',
  'disabled-access': '无障碍设施',
  'pet-friendly': '宠物友好',
  'smoke-free': '禁烟',
  'family-rooms': '家庭房',
  'non-smoking': '无烟房'
};

const TAGS = [
  '亲子', '豪华', '商务', '情侣', '度假', '温泉', '海景', '山景',
  '城市中心', '机场附近', '火车站附近', '免费停车', '免费早餐',
  '泳池', '健身房', 'SPA', '餐厅', '酒吧'
];

// 房型接口
interface RoomType {
  key: string;
  type: string;
  price: number;
  facilities: string[];
  description: string;
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
    { key: '1', type: '', price: 0, facilities: [], description: '' }
  ]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // 初始化表单值
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        open_date: initialValues.open_date ? dayjs(initialValues.open_date) : null,
      });
      
      if (initialValues.room_type && Array.isArray(initialValues.room_type)) {
        const formattedRoomTypes = initialValues.room_type.map((room: any, index: number) => ({
          key: String(index + 1),
          type: room.type || '',
          price: room.price || 0,
          facilities: room.facilities || [],
          description: room.description || '',
        }));
        setRoomTypes(formattedRoomTypes);
      }
      
      if (initialValues.facilities) {
        setSelectedFacilities(initialValues.facilities);
      }
      
      if (initialValues.tags) {
        setSelectedTags(initialValues.tags);
      }
      
      if (initialValues.images) {
        const files = initialValues.images.map((url: string, index: number) => ({
          uid: `-${index}`,
          name: `image-${index}.jpg`,
          status: 'done' as const,
          url,
        }));
        setFileList(files);
      }
    }
  }, [initialValues, form]);

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      const formData = {
        ...values,
        open_date: values.open_date ? values.open_date.format('YYYY-MM-DD') : null,
        room_type: roomTypes.filter(room => room.type && room.price > 0),
        images: fileList.map(file => file.url || file.thumbUrl || ''),
        facilities: selectedFacilities,
        tags: selectedTags,
        price: Math.min(...roomTypes.filter(room => room.price > 0).map(room => room.price)),
      };
      
      await onSubmit(formData);
    } catch (error) {
      console.error('表单提交失败:', error);
    }
  };

  // 房型操作
  const addRoomType = () => {
    const newKey = String(roomTypes.length + 1);
    setRoomTypes([
      ...roomTypes,
      { key: newKey, type: '', price: 0, facilities: [], description: '' }
    ]);
  };

  const removeRoomType = (key: string) => {
    if (roomTypes.length > 1) {
      setRoomTypes(roomTypes.filter(room => room.key !== key));
    } else {
      message.warning('至少需要一个房型');
    }
  };

  const updateRoomType = (key: string, field: keyof RoomType, value: any) => {
    setRoomTypes(roomTypes.map(room => 
      room.key === key ? { ...room, [field]: value } : room
    ));
  };

  // 图片上传处理
  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件!');
      return false;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片大小不能超过5MB!');
      return false;
    }
    
    return false; // 手动上传
  };

  const uploadButton = (
    <Button icon={<UploadOutlined />}>选择图片</Button>
  );

  // 设施选择
  const toggleFacility = (facility: string) => {
    setSelectedFacilities(prev => 
      prev.includes(facility) 
        ? prev.filter(f => f !== facility)
        : [...prev, facility]
    );
  };

  // 标签选择
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      size="large"
      initialValues={{
        star: 3,
        discount: 1,
      }}
    >
      {/* 基础信息 */}
      <FormSection
        title={
          <Space>
            <StarOutlined />
            <span>酒店基础信息</span>
          </Space>
        }
      >
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="酒店名称（中文）"
              rules={[
                { required: true, message: '请输入酒店名称' },
                { max: 200, message: '酒店名称不能超过200个字符' }
              ]}
            >
              <Input placeholder="请输入酒店中文名称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="name_en"
              label="酒店英文名称"
              rules={[{ max: 200, message: '英文名称不能超过200个字符' }]}
            >
              <Input placeholder="请输入酒店英文名称" />
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
          rules={[{ required: true, message: '请输入酒店地址' }]}
        >
          <TextArea 
            rows={3} 
            placeholder="请输入详细地址，包括省市区街道门牌号" 
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Row gutter={24}>
          <Col span={8}>
            <Form.Item
              name="star"
              label="酒店星级"
              rules={[{ required: true, message: '请选择酒店星级' }]}
            >
              <Select options={STAR_OPTIONS} placeholder="选择星级" />
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
              rules={[{ required: true, message: '请选择开业时间' }]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="选择开业日期"
                disabledDate={(current) => current && current > dayjs().endOf('day')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="附近景点/商圈"
              tooltip="填写酒店附近的知名景点、购物中心等"
            >
              <Input placeholder="如：外滩、南京路步行街" />
            </Form.Item>
          </Col>
        </Row>
      </FormSection>

      {/* 房型信息 */}
      <FormSection
        title={
          <Space>
            <DollarOutlined />
            <span>房型与价格</span>
            <Text type="secondary" style={{ fontSize: 12 }}>
              至少需要一个房型，价格最低的将作为酒店基础价格显示
            </Text>
          </Space>
        }
      >
        {roomTypes.map((room, index) => (
          <RoomTypeCard key={room.key}>
            <Row gutter={16} align="middle">
              <Col span={6}>
                <Form.Item label="房型名称" style={{ margin: 0 }}>
                  <Input
                    value={room.type}
                    onChange={(e) => updateRoomType(room.key, 'type', e.target.value)}
                    placeholder="如：标准大床房、豪华套房"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="价格（元/晚）" style={{ margin: 0 }}>
                  <InputNumber
                    value={room.price}
                    onChange={(value) => updateRoomType(room.key, 'price', value)}
                    placeholder="0"
                    min={0}
                    style={{ width: '100%' }}
                    addonAfter="¥"
                  />
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item label="房型描述" style={{ margin: 0 }}>
                  <Input
                    value={room.description}
                    onChange={(e) => updateRoomType(room.key, 'description', e.target.value)}
                    placeholder="描述房型特色，如：海景房、带阳台、25平米等"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <div style={{ paddingTop: 24 }}>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeRoomType(room.key)}
                    disabled={roomTypes.length <= 1}
                  >
                    删除
                  </Button>
                </div>
              </Col>
            </Row>
            
            <Divider style={{ margin: '12px 0' }} />
            
            <Text strong style={{ marginRight: 8 }}>房内设施：</Text>
            <Space wrap>
              {['wifi', 'tv', 'air-conditioner', 'fridge', 'safe', 'hairdryer'].map(facility => (
                <Switch
                  key={facility}
                  size="small"
                  checked={room.facilities.includes(facility)}
                  onChange={(checked) => {
                    const newFacilities = checked
                      ? [...room.facilities, facility]
                      : room.facilities.filter(f => f !== facility);
                    updateRoomType(room.key, 'facilities', newFacilities);
                  }}
                >
                  {{
                    'wifi': 'Wi-Fi',
                    'tv': '电视',
                    'air-conditioner': '空调',
                    'fridge': '冰箱',
                    'safe': '保险箱',
                    'hairdryer': '吹风机'
                  }[facility]}
                </Switch>
              ))}
            </Space>
          </RoomTypeCard>
        ))}

        <Button
          type="dashed"
          onClick={addRoomType}
          block
          icon={<PlusOutlined />}
          style={{ marginTop: 8 }}
        >
          添加房型
        </Button>
      </FormSection>

      {/* 图片上传 */}
      <FormSection
        title={
          <Space>
            <PictureOutlined />
            <span>酒店图片</span>
            <Text type="secondary" style={{ fontSize: 12 }}>
              建议上传5-10张高质量图片，第一张将作为封面
            </Text>
          </Space>
        }
      >
        <Upload
          listType="picture-card"
          fileList={fileList}
          onChange={handleUploadChange}
          beforeUpload={beforeUpload}
          multiple
          accept="image/*"
        >
          {fileList.length >= 10 ? null : uploadButton}
        </Upload>

        <Paragraph type="secondary" style={{ marginTop: 8 }}>
          <InfoCircleOutlined /> 支持 JPG、PNG 格式，单张图片不超过5MB。建议尺寸：1200×800像素
        </Paragraph>
      </FormSection>

      {/* 设施服务 */}
      <FormSection title="设施与服务">
        <div style={{ marginBottom: 16 }}>
          <Text strong>选择酒店提供的设施：</Text>
        </div>
        
        <Row gutter={[8, 8]}>
          {FACILITIES.map(facility => (
            <Col key={facility}>
              <FacilityTag
                className={selectedFacilities.includes(facility) ? 'selected' : ''}
                onClick={() => toggleFacility(facility)}
              >
                {FACILITY_LABELS[facility] || facility}
              </FacilityTag>
            </Col>
          ))}
        </Row>
      </FormSection>

      {/* 标签分类 */}
      <FormSection
        title={
          <Space>
            <TagOutlined />
            <span>酒店标签</span>
            <Tooltip title="标签有助于用户快速找到您的酒店">
              <InfoCircleOutlined style={{ color: '#999' }} />
            </Tooltip>
          </Space>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>选择适合您酒店的标签（最多选择5个）：</Text>
        </div>
        
        <Row gutter={[8, 8]}>
          {TAGS.map(tag => (
            <Col key={tag}>
              <FacilityTag
                className={selectedTags.includes(tag) ? 'selected' : ''}
                onClick={() => toggleTag(tag)}
                disabled={selectedTags.length >= 5 && !selectedTags.includes(tag)}
              >
                {tag}
              </FacilityTag>
            </Col>
          ))}
        </Row>
        
        <div style={{ marginTop: 16 }}>
          <Input
            placeholder="自定义标签（回车添加）"
            onPressEnter={(e) => {
              const value = (e.target as HTMLInputElement).value.trim();
              if (value && !selectedTags.includes(value) && selectedTags.length < 5) {
                setSelectedTags([...selectedTags, value]);
                (e.target as HTMLInputElement).value = '';
              }
            }}
            style={{ width: 200 }}
          />
        </div>
      </FormSection>

      {/* 优惠信息 */}
      <FormSection title="优惠活动">
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item
              name="discount"
              label="折扣比例"
              tooltip="1表示原价，0.8表示8折"
            >
              <InputNumber
                min={0.1}
                max={1}
                step={0.1}
                style={{ width: '100%' }}
                formatter={(value) => `${(Number(value) * 10).toFixed(0)}折`}
                parser={(value) => Number(value?.replace('折', '')) / 10}
              />
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item
              name="discount_description"
              label="优惠描述"
            >
              <Input placeholder="如：春节特惠、新用户专享、连住优惠等" />
            </Form.Item>
          </Col>
        </Row>
      </FormSection>

      {/* 提交按钮 */}
      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <Space>
          <Button size="large" onClick={() => window.history.back()}>
            取消
          </Button>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            loading={loading}
            style={{ minWidth: 120 }}
          >
            {isEdit ? '更新酒店信息' : '提交审核'}
          </Button>
        </Space>
        
        {!isEdit && (
          <Paragraph type="secondary" style={{ marginTop: 16 }}>
            <InfoCircleOutlined /> 提交后酒店将进入审核状态，审核通过后才会在前端显示
          </Paragraph>
        )}
      </div>
    </Form>
  );
};

export default HotelForm;