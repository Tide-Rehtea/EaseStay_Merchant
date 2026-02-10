import React, { useState, useEffect } from 'react';
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
  Badge,
  Statistic,
  Flex,
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
  LineChartOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { api } from '@/api';
import type { ResHotel } from '@/api/types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// 样式组件
const PageContainer = styled.div`
  padding: 24px;
`;

const PageHeaderContainer = styled.div`
  background: #fff;
  padding: 24px;
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
`;

const FilterCard = styled(Card)`
  margin-bottom: 24px;
  .ant-card-body {
    padding: 16px;
  }
`;

const StatsCard = styled(Card)`
  margin-bottom: 24px;
  .ant-card-body {
    padding: 16px;
  }
`;

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
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    search: '',
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  });

  // 获取酒店列表
  const fetchHotels = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pageSize,
        status: filters.status,
        start_date: filters.startDate,
        end_date: filters.endDate,
      };

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
      console.error('获取酒店列表失败:', error);
      message.error('获取酒店列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchHotels();
  }, []);

  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    fetchHotels(pagination.current, pagination.pageSize);
  };

  // 处理筛选
  const handleFilter = () => {
    fetchHotels(1, pagination.pageSize);
  };

  // 重置筛选
  const resetFilters = () => {
    setFilters({
      status: undefined,
      search: '',
      startDate: undefined,
      endDate: undefined,
    });
    fetchHotels(1, pagination.pageSize);
  };

  // 删除酒店
  const handleDelete = async (id: number) => {
    try {
      await api.hotel.delete(id);
      message.success('酒店删除成功');
      fetchHotels(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error.message || '删除失败');
    }
  };

  // 统计信息
  const stats = {
    total: hotels.length,
    pending: hotels.filter(h => h.status === 'pending').length,
    approved: hotels.filter(h => h.status === 'approved').length,
    rejected: hotels.filter(h => h.status === 'rejected').length,
    offline: hotels.filter(h => h.status === 'offline').length,
  };

  // 表格列定义
  const columns = [
    {
      title: '酒店名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ResHotel) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{text}</div>
          {record.name_en && (
            <div style={{ fontSize: 12, color: '#666' }}>{record.name_en}</div>
          )}
        </div>
      ),
    },
    {
      title: '星级',
      dataIndex: 'star',
      key: 'star',
      width: 100,
      render: (stars: number) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16 }}>{'⭐'.repeat(stars)}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{stars}星</Text>
        </div>
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: string) => (
        <div>
          <div style={{ color: '#ff4d4f', fontWeight: 500 }}>
            ¥{Number(price).toLocaleString()}
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
      width: 150,
      render: (roomTypes: any[]) => (
        <Tooltip 
          title={
            <div>
              {roomTypes.map((room, index) => (
                <div key={index} style={{ marginBottom: 4 }}>
                  {room.type}: ¥{room.price}
                </div>
              ))}
            </div>
          }
        >
          <span>{roomTypes.length} 种房型</span>
        </Tooltip>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string, record: ResHotel) => {
        const statusConfig: Record<string, { color: string; text: string }> = {
          pending: { color: 'orange', text: '待审核' },
          approved: { color: 'green', text: '已通过' },
          rejected: { color: 'red', text: '已拒绝' },
          offline: { color: 'gray', text: '已下线' },
        };
        
        const config = statusConfig[status] || { color: 'default', text: status };
        
        return (
          <Badge
            status={config.color as any}
            text={config.text}
          />
        );
      },
      filters: [
        { text: '待审核', value: 'pending' },
        { text: '已通过', value: 'approved' },
        { text: '已拒绝', value: 'rejected' },
        { text: '已下线', value: 'offline' },
      ],
      onFilter: (value: any, record: ResHotel) => record.status === value,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
      sorter: (a: ResHotel, b: ResHotel) => 
        dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: ResHotel) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/hotel/${record.id}`)}
            size="small"
          >
            查看
          </Button>
          
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/merchant/hotels/${record.id}`)}
            size="small"
            disabled={record.status === 'pending'}
          >
            编辑
          </Button>
          
          <Popconfirm
            title="确定要删除这个酒店吗？"
            description="删除后无法恢复，相关数据将一并删除"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
              disabled={record.status === 'pending'}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      {/* 自定义 PageHeader */}
      <PageHeaderContainer>
        <Flex vertical gap="middle">
          <Flex justify="space-between" align="center">
            <Flex vertical gap="small">
              <Title level={3} style={{ margin: 0 }}>我的酒店</Title>
              <Text type="secondary">管理您所有的酒店信息</Text>
            </Flex>
            
            <Button
              key="add"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/merchant/hotels/new')}
            >
              添加新酒店
            </Button>
          </Flex>
        </Flex>
      </PageHeaderContainer>

      {/* 统计卡片 */}
      <StatsCard>
        <Row gutter={24}>
          <Col span={6}>
            <Statistic
              title="总酒店数"
              value={stats.total}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="待审核"
              value={stats.pending}
              prefix={<FilterOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="已通过"
              value={stats.approved}
              prefix={<LineChartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="已拒绝"
              value={stats.rejected}
              prefix={<DeleteOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Col>
        </Row>
      </StatsCard>

      {/* 筛选栏 */}
      <FilterCard>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Input
              placeholder="搜索酒店名称"
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="全部状态"
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              allowClear
            >
              <Option value="pending">待审核</Option>
              <Option value="approved">已通过</Option>
              <Option value="rejected">已拒绝</Option>
              <Option value="offline">已下线</Option>
            </Select>
          </Col>
          <Col span={6}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['开始日期', '结束日期']}
              onChange={(dates) => {
                if (dates) {
                  setFilters({
                    ...filters,
                    startDate: dates[0]?.format('YYYY-MM-DD'),
                    endDate: dates[1]?.format('YYYY-MM-DD'),
                  });
                } else {
                  setFilters({
                    ...filters,
                    startDate: undefined,
                    endDate: undefined,
                  });
                }
              }}
            />
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <Space>
              <Button
                icon={<FilterOutlined />}
                onClick={handleFilter}
                type="primary"
              >
                筛选
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={resetFilters}
              >
                重置
              </Button>
            </Space>
          </Col>
        </Row>
      </FilterCard>

      {/* 酒店表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={hotels}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>
    </PageContainer>
  );
};

export default HotelList;