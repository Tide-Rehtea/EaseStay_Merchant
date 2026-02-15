import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@ant-design/icons';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { api } from '@/api';
import type { ResHotel } from '@/api/types';

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

// 状态配置
const statusOptions = [
  { 
    value: 'pending', 
    label: '待审核',
    icon: <ClockCircleOutlined style={{ color: '#faad14' }} />,
    color: 'orange'
  },
  { 
    value: 'approved', 
    label: '已通过',
    icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    color: 'green'
  },
  { 
    value: 'rejected', 
    label: '已拒绝',
    icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
    color: 'red'
  },
  { 
    value: 'offline', 
    label: '已下线',
    icon: <MinusCircleOutlined style={{ color: '#bfbfbf' }} />,
    color: 'gray'
  },
];

const statusConfig: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
  pending: { 
    color: 'orange', 
    text: '待审核',
    icon: <ClockCircleOutlined /> 
  },
  approved: { 
    color: 'green', 
    text: '已通过',
    icon: <CheckCircleOutlined /> 
  },
  rejected: { 
    color: 'red', 
    text: '已拒绝',
    icon: <CloseCircleOutlined /> 
  },
  offline: { 
    color: 'gray', 
    text: '已下线',
    icon: <MinusCircleOutlined /> 
  },
};

const HotelList: React.FC = () => {
  const navigate = useNavigate();
  
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
    status: undefined as string | undefined, // 后端筛选（实时触发）
    search: '', // 前端筛选
    dateRange: undefined as [dayjs.Dayjs, dayjs.Dayjs] | undefined, // 前端筛选
  });

  // 获取酒店列表（根据状态去后端查询）
  const fetchHotels = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      // 构建查询参数 - 保留状态筛选
      const params: any = {
        page,
        limit: pageSize,
      };

      // 只有当有状态筛选时才添加到参数中
      if (filters.status) {
        params.status = filters.status;
      }

      console.log('请求参数:', params); // 调试用

      const response = await api.hotel.getMyHotels(params);
      if (response.success) {
        setHotels(response.data.hotels);
        setPagination({
          current: page,
          pageSize,
          total: response.data.pagination.total,
        });
      } else {
        message.error('获取酒店列表失败');
      }
    } catch (error: any) {
      console.error('获取酒店列表失败:', error);
      message.error({
        content: error.message || '获取酒店列表失败',
        icon: <CloseCircleOutlined />,
      });
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchHotels();
  }, []);

  // 当状态筛选变化时，重新请求后端
  useEffect(() => {
    fetchHotels(1, pagination.pageSize);
  }, [filters.status]); // 只有 status 变化时才重新请求

  // 前端筛选后的数据（名称和日期）
  const filteredHotels = useMemo(() => {
    return hotels.filter(hotel => {
      // 名称搜索筛选（前端）
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const nameMatch = hotel.name?.toLowerCase().includes(searchLower);
        const nameEnMatch = hotel.name_en?.toLowerCase().includes(searchLower);
        if (!nameMatch && !nameEnMatch) {
          return false;
        }
      }

      // 日期范围筛选（前端）
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
  }, [hotels, filters.search, filters.dateRange]);

  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    fetchHotels(pagination.current, pagination.pageSize);
  };

  // 重置筛选
  const resetFilters = () => {
    setFilters({
      status: undefined,
      search: '',
      dateRange: undefined,
    });
    // 重置后重新获取数据（不带状态筛选），useEffect 会自动触发
  };

  // 删除酒店
  const handleDelete = async (id: number) => {
    try {
      await api.hotel.delete(id);
      message.success({
        content: '酒店删除成功',
        icon: <CheckCircleOutlined />,
      });
      fetchHotels(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error.message || '删除失败');
    }
  };

  // 统计信息（基于筛选后的数据）
  const stats = useMemo(() => {
    const total = filteredHotels.length;
    const pending = filteredHotels.filter(h => h.status === 'pending').length;
    const approved = filteredHotels.filter(h => h.status === 'approved').length;
    const rejected = filteredHotels.filter(h => h.status === 'rejected').length;
    const offline = filteredHotels.filter(h => h.status === 'offline').length;
    
    return { total, pending, approved, rejected, offline };
  }, [filteredHotels]);

  // 表格列定义
  const columns = [
    {
      title: '酒店信息',
      dataIndex: 'name',
      key: 'name',
      width: 260,
      render: (text: string, record: ResHotel) => (
        <Flex vertical gap={4}>
          <Flex align="center" gap={8}>
            <div style={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #1890ff10, #36cfc910)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1890ff',
            }}>
              <BankOutlined />
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>{text}</div>
              {record.name_en && (
                <div style={{ fontSize: 12, color: '#999' }}>{record.name_en}</div>
              )}
            </div>
          </Flex>
          {record.address && (
            <Flex align="center" gap={4} style={{ fontSize: 12, color: '#666', marginLeft: 40 }}>
              <EnvironmentOutlined style={{ fontSize: 12, color: '#1890ff' }} />
              <span className="address-text" style={{ 
                maxWidth: 200, 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap' 
              }}>
                {record.address}
              </span>
            </Flex>
          )}
        </Flex>
      ),
    },
    {
      title: '星级',
      dataIndex: 'star',
      key: 'star',
      width: 120,
      align: 'center' as const,
      render: (stars: number) => (
        <Tooltip title={`${stars}星级酒店`}>
          <div style={{ 
            display: 'inline-block',
            background: 'linear-gradient(135deg, #faad1410, #ffd66610)',
            padding: '8px 12px',
            borderRadius: 20,
          }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#faad14' }}>
              {'⭐'.repeat(stars)}
            </span>
            <Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>
              {stars}星
            </Text>
          </div>
        </Tooltip>
      ),
      sorter: (a: ResHotel, b: ResHotel) => Number(a.star) - Number(b.star),
    },
    {
      title: '参考价格',
      dataIndex: 'price',
      key: 'price',
      width: 140,
      align: 'right' as const,
      render: (price: number) => (
        <div>
          <div style={{ 
            color: '#ff4d4f', 
            fontWeight: 700, 
            fontSize: 18,
            fontFamily: 'Arial, sans-serif',
          }}>
            ¥{price.toLocaleString()}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>起/晚</Text>
        </div>
      ),
      sorter: (a: ResHotel, b: ResHotel) => Number(a.price) - Number(b.price),
    },
    {
      title: '房型',
      dataIndex: 'room_type',
      key: 'room_type',
      width: 120,
      render: (roomTypes: any[]) => (
        <Tooltip 
          title={
            <div style={{ padding: 4 }}>
              {roomTypes.map((room, index) => (
                <Flex key={index} justify="space-between" gap={16} style={{ marginBottom: 4 }}>
                  <span style={{ color: '#d9d9d9' }}>{room.type}:</span>
                  <span style={{ color: '#ff4d4f', fontWeight: 500 }}>¥{room.price}</span>
                </Flex>
              ))}
            </div>
          }
          overlayStyle={{ maxWidth: 300 }}
        >
          <div style={{ 
            cursor: 'pointer',
            padding: '4px 12px',
            background: 'rgba(24, 144, 255, 0.02)',
            borderRadius: 16,
            display: 'inline-block',
          }}>
            <span style={{ fontWeight: 500 }}>{roomTypes.length}</span>
            <span style={{ color: '#666', marginLeft: 4 }}>种房型</span>
          </div>
        </Tooltip>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center' as const,
      render: (status: string) => {
        const config = statusConfig[status] || { 
          color: 'default', 
          text: status, 
          icon: <HomeOutlined /> 
        };
        
        return (
          <StatusTag status={status} color={config.color}>
            {config.icon}
            {config.text}
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
      sorter: (a: ResHotel, b: ResHotel) => 
        dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: ResHotel) => (
        <Space size={8}>
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
            disabled={record.status === 'pending'}
            style={{ color: record.status === 'pending' ? undefined : '#1890ff' }}
          >
            编辑
          </ActionButton>
          
          <Popconfirm
            title="删除酒店"
            description="确定要删除这个酒店吗？删除后无法恢复！"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <ActionButton
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              disabled={record.status === 'pending'}
            >
              删除
            </ActionButton>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      {/* 页面头部 */}
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

      {/* 统计卡片 */}
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
              value={hotels.filter(h => h.status === 'pending').length}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="已通过"
              value={hotels.filter(h => h.status === 'approved').length}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="已拒绝/下线"
              value={hotels.filter(h => h.status === 'rejected' || h.status === 'offline').length}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Col>
        </Row>
      </StatsCard>

      {/* 筛选栏 - 移除了查询按钮 */}
      <FilterCard>
        <Flex vertical gap={16}>
          <Flex align="center" justify="space-between">
            <Flex align="center" gap={8}>
              <FilterOutlined style={{ color: '#1890ff' }} />
              <Text strong style={{ fontSize: 16 }}>筛选条件</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                （状态：实时查询 / 名称和日期：前端筛选）
              </Text>
            </Flex>
            <Button
              icon={<ReloadOutlined />}
              onClick={resetFilters}
              size="middle"
            >
              重置
            </Button>
          </Flex>
          
          <Divider style={{ margin: 0 }} />
          
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Input
                placeholder="搜索酒店名称（前端实时筛选）"
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                allowClear
                style={{ width: '100%' }}
              />
            </Col>
            
            <Col xs={24} md={8}>
              <Select
                placeholder="选择状态（实时查询）"
                style={{ width: '100%' }}
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value })}
                allowClear
                suffixIcon={<FilterOutlined style={{ color: '#bfbfbf' }} />}
              >
                {statusOptions.map(option => (
                  <Select.Option key={option.value} value={option.value}>
                    <Flex gap={8} align="center">
                      {option.icon}
                      <span>{option.label}</span>
                    </Flex>
                  </Select.Option>
                ))}
              </Select>
            </Col>
            
            <Col xs={24} md={8}>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['开始日期', '结束日期']}
                onChange={(dates) => setFilters({ ...filters, dateRange: dates as any })}
                format="YYYY-MM-DD"
                value={filters.dateRange}
              />
            </Col>
          </Row>

          {/* 显示当前筛选条件 */}
          {(filters.status || filters.search || filters.dateRange) && (
            <Flex align="center" gap={8} wrap style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>当前筛选：</Text>
              {filters.status && (
                <Tag color="processing" closable onClose={() => setFilters({ ...filters, status: undefined })}>
                  状态：{statusOptions.find(s => s.value === filters.status)?.label}
                </Tag>
              )}
              {filters.search && (
                <Tag color="processing" closable onClose={() => setFilters({ ...filters, search: '' })}>
                  搜索：{filters.search}
                </Tag>
              )}
              {filters.dateRange && filters.dateRange[0] && filters.dateRange[1] && (
                <Tag color="processing" closable onClose={() => setFilters({ ...filters, dateRange: undefined })}>
                  日期：{filters.dateRange[0].format('YYYY-MM-DD')} 至 {filters.dateRange[1].format('YYYY-MM-DD')}
                </Tag>
              )}
            </Flex>
          )}
        </Flex>
      </FilterCard>

      {/* 酒店表格 */}
      <TableCard>
        <Flex vertical gap={16}>
          <Flex align="center" justify="space-between">
            <Flex align="center" gap={12}>
              <BankOutlined style={{ color: '#1890ff', fontSize: 20 }} />
              <Title level={5} style={{ margin: 0, fontWeight: 600 }}>
                酒店列表
              </Title>
              {(filters.status || filters.search || filters.dateRange) && (
                <Tag color="processing" style={{ marginLeft: 8 }}>已筛选</Tag>
              )}
              <Text type="secondary" style={{ fontSize: 13 }}>
                显示 {filteredHotels.length} 条 / 共 {pagination.total} 条
              </Text>
            </Flex>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchHotels(pagination.current, pagination.pageSize)}
              loading={loading}
            >
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
            scroll={{ x: 1300 }}
            rowClassName={(record) => 
              record.status === 'pending' ? 'row-pending' : ''
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
                        <Button
                          icon={<ReloadOutlined />}
                          onClick={resetFilters}
                          size="small"
                        >
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

      {/* 全局样式 */}
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
        .ant-select-dropdown .ant-flex {
          padding: 5px 0;
        }
      `}</style>
    </PageContainer>
  );
};

export default HotelList;