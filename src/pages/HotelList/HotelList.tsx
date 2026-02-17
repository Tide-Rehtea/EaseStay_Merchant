import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  Typography,
  Row,
  Col,
  Tooltip,
  message,
  Popconfirm,
  Statistic,
  Flex,
  Divider,
  Empty,
} from 'antd';
import {
  HomeOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilterOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
  BankOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  MinusCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { api } from '@/api';
import type { ResHotel} from '@/api/types';

const { Title, Text } = Typography;
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

const StatsCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.06);
  }
  
  .ant-card-body {
    padding: 20px;
  }
  
  .ant-statistic {
    padding: 12px 16px;
    border-radius: 8px;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(24, 144, 255, 0.02);
      transform: translateY(-2px);
    }
  }
  
  .ant-statistic-title {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
  }
  
  .ant-statistic-content {
    font-size: 28px;
    font-weight: 600;
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

const StatusTag = styled(Tag)<{ status: string }>`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  width: fit-content;
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

// 状态配置（保持不变）
const reviewStatusOptions = [
  { 
    value: 'pending', 
    label: '待审核',
    icon: <ClockCircleOutlined style={{ color: '#faad14' }} />,
    color: 'orange'
  },
  { 
    value: 'approved', 
    label: '审核通过',
    icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    color: 'green'
  },
  { 
    value: 'rejected', 
    label: '已拒绝',
    icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
    color: 'red'
  },
];

const publishStatusOptions = [
  { 
    value: 'published', 
    label: '已发布',
    icon: <PlayCircleOutlined style={{ color: '#52c41a' }} />,
    color: 'green'
  },
  { 
    value: 'unpublished', 
    label: '未发布',
    icon: <PauseCircleOutlined style={{ color: '#8c8c8c' }} />,
    color: 'gray'
  },
];

const reviewStatusConfig: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
  pending: { 
    color: 'orange', 
    text: '待审核',
    icon: <ClockCircleOutlined /> 
  },
  approved: { 
    color: 'green', 
    text: '审核通过',
    icon: <CheckCircleOutlined /> 
  },
  rejected: { 
    color: 'red', 
    text: '已拒绝',
    icon: <CloseCircleOutlined /> 
  },
};

const publishStatusConfig: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
  published: { 
    color: 'green', 
    text: '已发布',
    icon: <PlayCircleOutlined /> 
  },
  unpublished: { 
    color: 'gray', 
    text: '未发布',
    icon: <PauseCircleOutlined /> 
  },
};

// 解析URL参数
const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};

const HotelList: React.FC = () => {
  const navigate = useNavigate();
  const query = useQuery();
  
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [hotels, setHotels] = useState<ResHotel[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  // 筛选条件
  const [filters, setFilters] = useState({
    review_status: (query.get('review_status') as string) || undefined,
    publish_status: (query.get('publish_status') as string) || undefined,
    search: '',
    dateRange: undefined as [dayjs.Dayjs, dayjs.Dayjs] | undefined,
  });

  // 获取酒店列表
  const fetchHotels = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: pageSize,
      };

      if (filters.review_status) {
        params.review_status = filters.review_status;
      }

      const response = await api.hotel.getMyHotels(params);
      if (response.success) {
        setHotels(response.data.hotels);
        setPagination({
          current: page,
          pageSize,
          total: response.data.pagination.total,
        });
      }
    } catch (error: any) {
      message.error(error.message || '获取酒店列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchHotels();
  }, []);

  // 当审核状态变化时，重新请求后端
  useEffect(() => {
    fetchHotels(1, pagination.pageSize);
  }, [filters.review_status]);

  // 前端筛选后的数据（名称、发布状态和日期）
  const filteredHotels = useMemo(() => {
    return hotels.filter(hotel => {
      // 名称搜索筛选
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const nameMatch = hotel.name?.toLowerCase().includes(searchLower);
        const nameEnMatch = hotel.name_en?.toLowerCase().includes(searchLower);
        if (!nameMatch && !nameEnMatch) {
          return false;
        }
      }

      // 发布状态筛选（前端）
      if (filters.publish_status && hotel.publish_status !== filters.publish_status) {
        return false;
      }

      // 日期范围筛选
      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        const hotelDate = dayjs(hotel.created_at);
        const startDate = filters.dateRange[0].startOf('day');
        const endDate = filters.dateRange[1].endOf('day');
        if (hotelDate.isBefore(startDate) || hotelDate.isAfter(endDate)) {
          return false;
        }
      }

      return true;
    });
  }, [hotels, filters.search, filters.publish_status, filters.dateRange]);

  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    fetchHotels(pagination.current, pagination.pageSize);
  };

  // 重置筛选
  const resetFilters = () => {
    setFilters({
      review_status: undefined,
      publish_status: undefined,
      search: '',
      dateRange: undefined,
    });
    // 更新URL
    navigate('/merchant/hotels');
  };

  // 更新URL参数
  const updateUrlParams = (key: string, value: string | undefined) => {
    const newQuery = new URLSearchParams(query);
    if (value) {
      newQuery.set(key, value);
    } else {
      newQuery.delete(key);
    }
    navigate(`/merchant/hotels?${newQuery.toString()}`);
  };

  // 处理筛选变化
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // 更新URL
    if (key === 'review_status' || key === 'publish_status') {
      updateUrlParams(key, value);
    }
  };

  // 统计信息
  const stats = useMemo(() => {
    const total = pagination.total;
    const pending = hotels.filter(h => h.review_status === 'pending').length;
    const approved = hotels.filter(h => h.review_status === 'approved').length;
    const rejected = hotels.filter(h => h.review_status === 'rejected').length;
    const published = hotels.filter(h => h.publish_status === 'published').length;
    const unpublished = hotels.filter(h => h.publish_status === 'unpublished').length;
    
    return { total, pending, approved, rejected, published, unpublished };
  }, [hotels, pagination.total]);

  // 表格列定义 - 优化样式，保持原有栏目
  const columns = [
    {
      title: '酒店信息',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      render: (text: string, record: ResHotel) => (
        <Flex gap={12} align="flex-start">
          <div style={{
            width: 48,
            height: 48,
            background: 'linear-gradient(135deg, #1890ff10, #36cfc910)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1890ff',
            flexShrink: 0,
          }}>
            <BankOutlined style={{ fontSize: 24 }} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <Tooltip title={text}>
              <EllipsisDiv style={{ fontWeight: 600, marginBottom: 2 }}>{text}</EllipsisDiv>
            </Tooltip>
            {record.name_en && (
              <Tooltip title={record.name_en}>
                <EllipsisText type="secondary" style={{ fontSize: 12 }}>{record.name_en}</EllipsisText>
              </Tooltip>
            )}
            {record.address && (
              <Tooltip title={record.address}>
                <Flex align="center" gap={4} style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  <EnvironmentOutlined style={{ fontSize: 12, color: '#1890ff', flexShrink: 0 }} />
                  <EllipsisText type="secondary" style={{ fontSize: 12 }}>
                    {record.address}
                  </EllipsisText>
                </Flex>
              </Tooltip>
            )}
          </div>
        </Flex>
      ),
    },
    {
      title: '星级',
      dataIndex: 'star',
      key: 'star',
      width: 100,
      align: 'center' as const,
      render: (stars: number) => (
        <Tooltip title={`${stars}星级酒店`}>
          <div style={{ 
            fontSize: 16,
            fontWeight: 500,
            color: '#faad14',
            letterSpacing: 2
          }}>
            {'⭐'.repeat(stars)}
          </div>
        </Tooltip>
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      align: 'right' as const,
      render: (price: number) => (
        <div>
          <div style={{ color: '#ff4d4f', fontWeight: 700, fontSize: 16 }}>
            ¥{price.toLocaleString()}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>起/晚</Text>
        </div>
      ),
    },
    {
      title: '审核状态',
      dataIndex: 'review_status',
      key: 'review_status',
      width: 120,
      align: 'center' as const,
      render: (status: string) => {
        const config = reviewStatusConfig[status];
        return (
          <StatusTag status={status} color={config.color}>
            {config.icon}
            {config.text}
          </StatusTag>
        );
      },
    },
    {
      title: '发布状态',
      dataIndex: 'publish_status',
      key: 'publish_status',
      width: 120,
      align: 'center' as const,
      render: (status: string, record: ResHotel) => {
        const config = publishStatusConfig[status];
        // 如果审核未通过，发布状态不可用
        const isDisabled = record.review_status !== 'approved';
        return (
          <StatusTag status={status} color={isDisabled ? 'gray' : config.color}>
            {config.icon}
            {isDisabled ? '不可用' : config.text}
          </StatusTag>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date: string) => (
        <Tooltip title={dayjs(date).format('YYYY-MM-DD HH:mm:ss')}>
          <span style={{ color: '#666' }}>{dayjs(date).format('YYYY-MM-DD')}</span>
        </Tooltip>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: ResHotel) => (
        <Space size={4}>
          <ActionButton
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/merchant/hotelView/${record.id}`)}
            size="small"
          >
            查看
          </ActionButton>
          
          <ActionButton
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/merchant/hotels/${record.id}`)}
            size="small"
            disabled={record.review_status === 'pending'}
            style={{ color: record.review_status === 'pending' ? undefined : '#1890ff' }}
          >
            编辑
          </ActionButton>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeaderContainer>
        <Flex vertical gap="small">
          <Flex justify="space-between" align="center">
            <Flex vertical gap={4}>
              <Title level={3} style={{ margin: 0, fontWeight: 600 }}>
                我的酒店
              </Title>
              <Text type="secondary" style={{ fontSize: 14 }}>
                管理您所有的酒店信息，共 {pagination.total} 家酒店
              </Text>
            </Flex>
            
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/merchant/hotels/new')}
              size="large"
              style={{
                height: 46,
                padding: '0 24px',
                fontSize: 16,
                borderRadius: 8,
                boxShadow: '0 2px 0 rgba(24, 144, 255, 0.1)',
              }}
            >
              添加新酒店
            </Button>
          </Flex>
        </Flex>
      </PageHeaderContainer>

      <StatsCard>
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="总酒店数"
              value={pagination.total}
              prefix={<HomeOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="待审核"
              value={stats.pending}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="已发布"
              value={stats.published}
              prefix={<PlayCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="未发布"
              value={stats.unpublished}
              prefix={<PauseCircleOutlined style={{ color: '#8c8c8c' }} />}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Col>
        </Row>
      </StatsCard>

      <FilterCard>
        <Flex vertical gap={16}>
          <Flex align="center" justify="space-between">
            <Flex align="center" gap={8}>
              <FilterOutlined style={{ color: '#1890ff' }} />
              <Text strong style={{ fontSize: 16 }}>筛选</Text>
            </Flex>
            <Button icon={<ReloadOutlined />} onClick={resetFilters} size="middle">
              重置
            </Button>
          </Flex>
          
          <Divider style={{ margin: 0 }} />
          
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Input
                placeholder="搜索酒店名称"
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                allowClear
              />
            </Col>
            
            <Col xs={24} md={6}>
              <Select
                placeholder="审核状态"
                style={{ width: '100%' }}
                value={filters.review_status}
                onChange={(value) => handleFilterChange('review_status', value)}
                allowClear
              >
                {reviewStatusOptions.map(option => (
                  <Select.Option key={option.value} value={option.value}>
                    <Flex gap={8} align="center">
                      {option.icon}
                      <span>{option.label}</span>
                    </Flex>
                  </Select.Option>
                ))}
              </Select>
            </Col>
            
            <Col xs={24} md={6}>
              <Select
                placeholder="发布状态"
                style={{ width: '100%' }}
                value={filters.publish_status}
                onChange={(value) => handleFilterChange('publish_status', value)}
                allowClear
              >
                {publishStatusOptions.map(option => (
                  <Select.Option key={option.value} value={option.value}>
                    <Flex gap={8} align="center">
                      {option.icon}
                      <span>{option.label}</span>
                    </Flex>
                  </Select.Option>
                ))}
              </Select>
            </Col>
            
            <Col xs={24} md={6}>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['开始日期', '结束日期']}
                onChange={(dates) => handleFilterChange('dateRange', dates)}
                format="YYYY-MM-DD"
                value={filters.dateRange}
              />
            </Col>
          </Row>

          {/* 显示当前筛选条件 */}
          {(filters.review_status || filters.publish_status || filters.search || filters.dateRange) && (
            <Flex align="center" gap={8} wrap style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>当前筛选：</Text>
              {filters.review_status && (
                <Tag color="processing" closable onClose={() => handleFilterChange('review_status', undefined)}>
                  审核：{reviewStatusOptions.find(s => s.value === filters.review_status)?.label}
                </Tag>
              )}
              {filters.publish_status && (
                <Tag color="processing" closable onClose={() => handleFilterChange('publish_status', undefined)}>
                  发布：{publishStatusOptions.find(s => s.value === filters.publish_status)?.label}
                </Tag>
              )}
              {filters.search && (
                <Tag color="processing" closable onClose={() => handleFilterChange('search', '')}>
                  搜索：{filters.search}
                </Tag>
              )}
              {filters.dateRange && filters.dateRange[0] && filters.dateRange[1] && (
                <Tag color="processing" closable onClose={() => handleFilterChange('dateRange', undefined)}>
                  日期：{filters.dateRange[0].format('YYYY-MM-DD')} 至 {filters.dateRange[1].format('YYYY-MM-DD')}
                </Tag>
              )}
            </Flex>
          )}
        </Flex>
      </FilterCard>

      <TableCard>
        <Flex vertical gap={16}>
          <Flex align="center" justify="space-between">
            <Flex align="center" gap={12}>
              <BankOutlined style={{ color: '#1890ff', fontSize: 20 }} />
              <Title level={5} style={{ margin: 0, fontWeight: 600 }}>
                酒店列表
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                显示 {filteredHotels.length} 条 / 共 {pagination.total} 条
              </Text>
            </Flex>
            <Button icon={<ReloadOutlined />} onClick={() => fetchHotels()} loading={loading}>
              刷新
            </Button>
          </Flex>
          
          <Table
            columns={columns}
            dataSource={filteredHotels}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: filteredHotels.length,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
              pageSizeOptions: ['10', '20', '50', '100'],
              position: ['bottomCenter'],
            }}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
            rowClassName={(record) => 
              record.review_status === 'pending' ? 'row-pending' : ''
            }
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <Flex vertical gap={8} align="center">
                      <Text type="secondary">
                        {hotels.length === 0 ? '暂无酒店数据' : '没有符合筛选条件的酒店'}
                      </Text>
                      {hotels.length === 0 ? (
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => navigate('/merchant/hotels/new')}
                          size="small"
                        >
                          立即添加
                        </Button>
                      ) : (
                        <Button icon={<ReloadOutlined />} onClick={resetFilters} size="small">
                          清除筛选
                        </Button>
                      )}
                    </Flex>
                  }
                />
              ),
            }}
          />
        </Flex>
      </TableCard>

      <style>{`
        .row-pending {
          background: rgba(250, 173, 20, 0.02);
        }
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

export default HotelList;