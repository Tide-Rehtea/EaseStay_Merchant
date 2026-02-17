import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Avatar,
  message,
  Tooltip,
  Popconfirm,
  Flex,
  Rate,
  Select,
  DatePicker,
  Input,
  Divider,
} from 'antd';
import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StopOutlined,
  PlayCircleOutlined,
  UserOutlined,
  BankOutlined,
  DollarOutlined,
  CalendarOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { api } from '@/api';
import type { ResHotel } from '@/api/types';
import styled from 'styled-components';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// 样式组件
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const PageHeaderContainer = styled.div`
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.06);
  }
`;

const FilterCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.04);
  
  .ant-card-body {
    padding: 20px;
  }
`;

const TableCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.04);
  
  .ant-card-body {
    padding: 20px;
  }
`;

const ActionButton = styled(Button)`
  padding: 4px 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// 文字省略样式组件
const EllipsisText = styled(Text)`
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const EllipsisDiv = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
`;

interface AllHotel extends ResHotel {}

interface FilterParams {
  review_status?: string;
  publish_status?: string;
  merchant_id?: number;
  start_date?: string;
  end_date?: string;
  keyword?: string;
}

const AllHotels: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AllHotel[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // 筛选条件
  const [filters, setFilters] = useState<FilterParams>({});

  // 获取所有酒店
  const fetchData = async (page = currentPage, size = pageSize, filterParams = filters) => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: size,
      };
      
      if (filterParams.review_status) params.review_status = filterParams.review_status;
      if (filterParams.publish_status) params.publish_status = filterParams.publish_status;
      if (filterParams.merchant_id) params.merchant_id = filterParams.merchant_id;
      if (filterParams.start_date) params.start_date = filterParams.start_date;
      if (filterParams.end_date) params.end_date = filterParams.end_date;
      if (filterParams.keyword) params.keyword = filterParams.keyword;

      const response = await api.admin.getAllHotels(params);
      
      if (response.success) {
        setData(response.data.hotels);
        setTotal(response.data.pagination.total);
      }
    } catch (error) {
      console.error('获取酒店列表失败:', error);
      message.error('获取数据失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 处理筛选
  const handleFilterChange = (key: keyof FilterParams, value: any) => {
    const newFilters = { ...filters, [key]: value };
    if (!value || (Array.isArray(value) && value.length === 0)) {
      delete newFilters[key];
    }
    setFilters(newFilters);
    setCurrentPage(1);
    fetchData(1, pageSize, newFilters);
  };

  // 重置筛选
  const resetFilters = () => {
    setFilters({});
    setCurrentPage(1);
    fetchData(1, pageSize, {});
  };

  // 处理发布/下线
  const handleTogglePublish = async (id: number, currentPublishStatus: string) => {
    const action = currentPublishStatus === 'published' ? 'unpublish' : 'publish';
    const actionText = action === 'publish' ? '发布' : '下线';

    try {
      const response = await api.admin.toggleHotel(id, { action });
      if (response.success) {
        message.success(`${actionText}成功`);
        fetchData(currentPage, pageSize, filters);
      }
    } catch (error) {
      console.error(`${actionText}失败:`, error);
      message.error(`${actionText}失败，请重试`);
    }
  };

  // 获取完整图片URL
  const getImageUrl = (path: string) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `http://localhost:3001${path}`;
  };

  // 状态标签映射
  const reviewStatusMap = {
    pending: { color: 'warning', text: '待审核', icon: <CheckCircleOutlined /> },
    approved: { color: 'success', text: '审核通过', icon: <CheckCircleOutlined /> },
    rejected: { color: 'error', text: '已拒绝', icon: <CloseCircleOutlined /> },
  };

  const publishStatusMap = {
    published: { color: 'green', text: '已发布', icon: <PlayCircleOutlined /> },
    unpublished: { color: 'default', text: '未发布', icon: <PauseCircleOutlined /> },
  };

  // 判断是否可以发布
  const canPublish = (record: AllHotel) => {
    return record.review_status === 'approved' && record.publish_status === 'unpublished';
  };

  // 判断是否可以下线
  const canUnpublish = (record: AllHotel) => {
    return record.review_status === 'approved' && record.publish_status === 'published';
  };

  // 表格列定义 - 调整列宽比例
  const columns: ColumnsType<AllHotel> = [
    {
      title: '酒店信息',
      key: 'hotelInfo',
      width: 320,
      fixed: 'left',
      render: (_, record) => (
        <Flex gap={12} align="flex-start">
          <Avatar
            shape="square"
            size={64}
            src={getImageUrl(record.images?.[0] || '')}
            icon={!record.images?.length && <BankOutlined />}
            style={{ borderRadius: 8, flexShrink: 0 }}
          />
          <div style={{ minWidth: 0, flex: 1 }}> {/* minWidth: 0 确保子元素可以收缩 */}
            <EllipsisDiv style={{ fontWeight: 600, marginBottom: 4 }}>
              {record.name}
              <Tag color="blue" style={{ marginLeft: 8, flexShrink: 0 }}>
                ID: {record.id}
              </Tag>
            </EllipsisDiv>
            <Space size={4} wrap style={{ marginBottom: 4 }}>
              <Rate disabled defaultValue={record.star} count={5} style={{ fontSize: 12, flexShrink: 0 }} />
              <Tag color="green" icon={<DollarOutlined />} style={{ flexShrink: 0 }}>
                ¥{record.price}
              </Tag>
              <Tag color={reviewStatusMap[record.review_status]?.color} style={{ flexShrink: 0 }}>
                {reviewStatusMap[record.review_status]?.text}
              </Tag>
              <Tag color={publishStatusMap[record.publish_status]?.color} style={{ flexShrink: 0 }}>
                {publishStatusMap[record.publish_status]?.text}
              </Tag>
            </Space>
            <Tooltip title={record.address}>
              <EllipsisText type="secondary" style={{ fontSize: 12 }}>
                {record.address}
              </EllipsisText>
            </Tooltip>
          </div>
        </Flex>
      ),
    },
    {
      title: '商户信息',
      key: 'merchant',
      width: 150, // 减小宽度
      render: (_, record) => (
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          <Tooltip title={record.merchant?.email || '未知商户'}>
            <EllipsisText>
              <UserOutlined style={{ marginRight: 4, color: '#1890ff' }} />
              {record.merchant?.email || '未知商户'}
            </EllipsisText>
          </Tooltip>
          <Tooltip title={`提交: ${dayjs(record.created_at).format('YYYY-MM-DD')}`}>
            <EllipsisText type="secondary" style={{ fontSize: 12 }}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              提交: {dayjs(record.created_at).format('YYYY-MM-DD')}
            </EllipsisText>
          </Tooltip>
          <Tooltip title={`更新: ${dayjs(record.updated_at).format('YYYY-MM-DD')}`}>
            <EllipsisText type="secondary" style={{ fontSize: 12 }}>
              更新: {dayjs(record.updated_at).format('YYYY-MM-DD')}
            </EllipsisText>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: '房型信息',
      key: 'roomType',
      width: 130, // 减小宽度
      render: (_, record) => {
        const roomTypes = record.room_type as any[];
        if (!roomTypes?.length) return <Text type="secondary">暂无房型</Text>;
        
        const minPrice = Math.min(...roomTypes.map(r => r.price));
        const maxPrice = Math.max(...roomTypes.map(r => r.price));
        
        return (
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <Tooltip title={`${roomTypes.length} 个房型`}>
              <EllipsisText>
                <Text strong>{roomTypes.length}</Text>
                <Text type="secondary"> 个房型</Text>
              </EllipsisText>
            </Tooltip>
            <Tooltip title={`价格范围: ¥${minPrice} - ¥${maxPrice}`}>
              <EllipsisText type="secondary">
                价格: ¥{minPrice} - ¥{maxPrice}
              </EllipsisText>
            </Tooltip>
          </Space>
        );
      },
    },
    {
      title: '标签',
      key: 'tags',
      width: 130, // 减小宽度
      render: (_, record) => {
        const tags = record.tags || [];
        
        if (tags.length === 0) {
          return <Text type="secondary">暂无标签</Text>;
        }
        
        return (
          <Tooltip title={tags.join('、')}>
            <div>
              {tags.slice(0, 2).map((tag: string) => (
                <Tag key={tag} color="blue" style={{ marginBottom: 4, maxWidth: '100%' }}>
                  <EllipsisDiv style={{ maxWidth: 80 }}>{tag}</EllipsisDiv>
                </Tag>
              ))}
              {tags.length > 2 && (
                <Tag color="default">+{tags.length - 2}</Tag>
              )}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <ActionButton
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/hotels/${record.id}`)}
            size="small"
          >
            详情
          </ActionButton>
          
          {canPublish(record) && (
            <ActionButton
              type="text"
              icon={<PlayCircleOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleTogglePublish(record.id, record.publish_status)}
              size="small"
            >
              发布
            </ActionButton>
          )}
          
          {canUnpublish(record) && (
            <Popconfirm
              title="确认下线"
              description="下线后酒店将不在用户端显示，确定吗？"
              onConfirm={() => handleTogglePublish(record.id, record.publish_status)}
              okText="确认"
              cancelText="取消"
            >
              <ActionButton
                type="text"
                icon={<StopOutlined style={{ color: '#ff4d4f' }} />}
                size="small"
              >
                下线
              </ActionButton>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // 从数据中提取商户选项
  const merchantOptions = React.useMemo(() => {
    const merchants = new Map();
    data.forEach(item => {
      if (item.merchant?.id && item.merchant?.email) {
        merchants.set(item.merchant.id, item.merchant.email);
      }
    });
    return Array.from(merchants.entries()).map(([id, email]) => ({ id, email }));
  }, [data]);

  return (
    <PageContainer>
      {/* 页面标题 */}
      <PageHeaderContainer>
        <Flex vertical gap="small">
          <Flex justify="space-between" align="center">
            <Flex vertical gap={4}>
              <Title level={3} style={{ margin: 0, fontWeight: 600 }}>
                所有酒店管理
              </Title>
              <Text type="secondary" style={{ fontSize: 14 }}>
                平台共有 {total} 家酒店
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </PageHeaderContainer>

      {/* 筛选栏 */}
      <FilterCard>
        <Flex vertical gap={16}>
          <Flex align="center" justify="space-between">
            <Flex align="center" gap={8}>
              <FilterOutlined style={{ color: '#1890ff' }} />
              <Text strong style={{ fontSize: 16 }}>筛选条件</Text>
            </Flex>
            
            <Flex align="center" gap={12}>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={resetFilters}
                size="middle"
                style={{
                  height: 40,
                  padding: '0 20px',
                  borderRadius: 8,
                }}
              >
                重置
              </Button>
            </Flex>
          </Flex>
          
          <Divider style={{ margin: 0 }} />
          
          {/* 筛选条件 */}
          <Flex gap={16} wrap="wrap" align="center">
            <Input
              placeholder="搜索酒店名称"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
              allowClear
            />
            <Select
              placeholder="审核状态"
              style={{ width: 130 }}
              value={filters.review_status}
              onChange={(value) => handleFilterChange('review_status', value)}
              allowClear
            >
              <Option value="pending">待审核</Option>
              <Option value="approved">审核通过</Option>
              <Option value="rejected">已拒绝</Option>
            </Select>
            <Select
              placeholder="发布状态"
              style={{ width: 130 }}
              value={filters.publish_status}
              onChange={(value) => handleFilterChange('publish_status', value)}
              allowClear
            >
              <Option value="published">已发布</Option>
              <Option value="unpublished">未发布</Option>
            </Select>
            <Select
              placeholder="商户筛选"
              style={{ width: 180 }}
              value={filters.merchant_id}
              onChange={(value) => handleFilterChange('merchant_id', value)}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {merchantOptions.map(({ id, email }) => (
                <Option key={id} value={id}>
                  {email}
                </Option>
              ))}
            </Select>
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              style={{ width: 240 }}
              onChange={(dates) => {
                if (dates) {
                  handleFilterChange('start_date', dates[0]?.format('YYYY-MM-DD'));
                  handleFilterChange('end_date', dates[1]?.format('YYYY-MM-DD'));
                } else {
                  handleFilterChange('start_date', undefined);
                  handleFilterChange('end_date', undefined);
                }
              }}
            />
          </Flex>

          {/* 当前筛选条件显示 */}
          {Object.keys(filters).length > 0 && (
            <Flex align="center" gap={8} wrap>
              <Text type="secondary" style={{ fontSize: 13 }}>当前筛选：</Text>
              {filters.keyword && (
                <Tag 
                  color="processing" 
                  closable 
                  onClose={() => handleFilterChange('keyword', undefined)}
                  style={{ borderRadius: 4 }}
                >
                  搜索：{filters.keyword}
                </Tag>
              )}
              {filters.review_status && (
                <Tag 
                  color={reviewStatusMap[filters.review_status]?.color}
                  closable 
                  onClose={() => handleFilterChange('review_status', undefined)}
                  style={{ borderRadius: 4 }}
                >
                  审核：{reviewStatusMap[filters.review_status]?.text}
                </Tag>
              )}
              {filters.publish_status && (
                <Tag 
                  color={publishStatusMap[filters.publish_status]?.color}
                  closable 
                  onClose={() => handleFilterChange('publish_status', undefined)}
                  style={{ borderRadius: 4 }}
                >
                  发布：{publishStatusMap[filters.publish_status]?.text}
                </Tag>
              )}
              {filters.merchant_id && (
                <Tag 
                  closable 
                  onClose={() => handleFilterChange('merchant_id', undefined)}
                  style={{ borderRadius: 4 }}
                >
                  商户ID：{filters.merchant_id}
                </Tag>
              )}
              {(filters.start_date || filters.end_date) && (
                <Tag 
                  closable 
                  onClose={() => {
                    handleFilterChange('start_date', undefined);
                    handleFilterChange('end_date', undefined);
                  }}
                  style={{ borderRadius: 4 }}
                >
                  日期：{filters.start_date || '开始'} ~ {filters.end_date || '结束'}
                </Tag>
              )}
            </Flex>
          )}
        </Flex>
      </FilterCard>

      {/* 表格 */}
      <TableCard>
        <Flex vertical gap={16}>
          <Flex align="center" justify="space-between">
            <Flex align="center" gap={12}>
              <BankOutlined style={{ color: '#1890ff', fontSize: 20 }} />
              <Title level={5} style={{ margin: 0, fontWeight: 600 }}>
                酒店列表
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                显示 {data.length} 条 / 共 {total} 条
              </Text>
            </Flex>
            
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => fetchData()} 
              loading={loading}
              size="middle"
              style={{
                height: 40,
                padding: '0 20px',
                borderRadius: 8,
              }}
            >
              刷新
            </Button>
          </Flex>

          <Table
            rowKey="id"
            columns={columns}
            dataSource={data}
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size || 10);
                fetchData(page, size || 10);
              },
              pageSizeOptions: ['10', '20', '50', '100'],
              position: ['bottomCenter'],
            }}
            scroll={{ x: 1200 }} // 减小滚动宽度
            locale={{
              emptyText: (
                <Flex vertical gap={8} align="center" style={{ padding: '40px 0' }}>
                  <Text type="secondary">
                    {data.length === 0 ? '暂无酒店数据' : '没有符合筛选条件的酒店'}
                  </Text>
                  {data.length > 0 && Object.keys(filters).length > 0 && (
                    <Button icon={<ReloadOutlined />} onClick={resetFilters} size="small">
                      清除筛选
                    </Button>
                  )}
                </Flex>
              ),
            }}
          />
        </Flex>
      </TableCard>

      <style>{`
        .ant-table-row {
          transition: all 0.2s;
        }
        .ant-table-row:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .ant-table-tbody > tr > td {
          padding: 16px 8px !important;
        }
      `}</style>
    </PageContainer>
  );
};

export default AllHotels;