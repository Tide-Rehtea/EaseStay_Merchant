// AllHotels.tsx
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
  Badge,
  Popconfirm,
  Flex,
  Rate,
  Select,
  DatePicker,
  Input,
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
  DownloadOutlined,
  SearchOutlined,
  PauseCircleOutlined,
  CaretRightOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { api } from '@/api';
import type { ResHotel } from '@/api/types';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

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
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  // 筛选条件
  const [filters, setFilters] = useState<FilterParams>({});
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

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

  // 批量发布
  const handleBatchPublish = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要发布的酒店');
      return;
    }

    const hide = message.loading('正在发布中...', 0);
    let successCount = 0;
    let failCount = 0;

    for (const id of selectedRowKeys) {
      try {
        await api.admin.toggleHotel(Number(id), { action: 'publish' });
        successCount++;
      } catch {
        failCount++;
      }
    }

    hide();
    message.success(`发布完成：${successCount}个成功，${failCount}个失败`);
    fetchData(currentPage, pageSize, filters);
    setSelectedRowKeys([]);
  };

  // 批量下线
  const handleBatchUnpublish = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要下线的酒店');
      return;
    }

    const hide = message.loading('正在下线中...', 0);
    let successCount = 0;
    let failCount = 0;

    for (const id of selectedRowKeys) {
      try {
        await api.admin.toggleHotel(Number(id), { action: 'unpublish' });
        successCount++;
      } catch {
        failCount++;
      }
    }

    hide();
    message.success(`下线完成：${successCount}个成功，${failCount}个失败`);
    fetchData(currentPage, pageSize, filters);
    setSelectedRowKeys([]);
  };

  // 导出数据
  const handleExport = () => {
    const headers = ['酒店ID', '酒店名称', '星级', '价格', '审核状态', '发布状态', '商户', '提交时间'];
    const csvData = data.map(item => [
      item.id,
      item.name,
      item.star,
      item.price,
      item.review_status,
      item.publish_status,
      item.merchant?.email || '',
      dayjs(item.created_at).format('YYYY-MM-DD'),
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `酒店列表_${dayjs().format('YYYYMMDD_HHmmss')}.csv`;
    link.click();
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

  // 表格列定义
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
            style={{ borderRadius: 8 }}
          />
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              {record.name}
              <Tag color="blue" style={{ marginLeft: 8 }}>
                ID: {record.id}
              </Tag>
            </div>
            <Space size={4} wrap style={{ marginBottom: 4 }}>
              <Rate disabled defaultValue={record.star} count={5} style={{ fontSize: 12 }} />
              <Tag color="green" icon={<DollarOutlined />}>
                ¥{record.price}
              </Tag>
              <Tag color={reviewStatusMap[record.review_status]?.color}>
                {reviewStatusMap[record.review_status]?.text}
              </Tag>
              <Tag color={publishStatusMap[record.publish_status]?.color}>
                {publishStatusMap[record.publish_status]?.text}
              </Tag>
            </Space>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.address}
              </Text>
            </div>
          </div>
        </Flex>
      ),
    },
    {
      title: '商户信息',
      key: 'merchant',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Text>
            <UserOutlined style={{ marginRight: 4, color: '#1890ff' }} />
            {record.merchant?.email || '未知商户'}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <CalendarOutlined style={{ marginRight: 4 }} />
            提交: {dayjs(record.created_at).format('YYYY-MM-DD')}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            更新: {dayjs(record.updated_at).format('YYYY-MM-DD')}
          </Text>
        </Space>
      ),
    },
    {
      title: '房型信息',
      key: 'roomType',
      width: 200,
      render: (_, record) => {
        const roomTypes = record.room_type as any[];
        if (!roomTypes?.length) return <Text type="secondary">暂无房型</Text>;
        
        return (
          <Space direction="vertical" size={2}>
            <div>
              <Text strong>{roomTypes.length}</Text>
              <Text type="secondary"> 个房型</Text>
            </div>
            <div>
              <Text type="secondary">价格范围: </Text>
              <Text strong>
                ¥{Math.min(...roomTypes.map(r => r.price))} - ¥{Math.max(...roomTypes.map(r => r.price))}
              </Text>
            </div>
          </Space>
        );
      },
    },
    {
      title: '标签/设施',
      key: 'tags',
      width: 180,
      render: (_, record) => (
        <div>
          {record.tags?.slice(0, 3).map((tag: string) => (
            <Tag key={tag} color="blue" style={{ marginBottom: 4 }}>
              {tag}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space direction="vertical" size={8}>
          <Space>
            <Button
              type="link"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => navigate(`/admin/hotels/${record.id}`)}
            >
              详情
            </Button>
            
            {canPublish(record) && (
              <Button
                type="link"
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => handleTogglePublish(record.id, record.publish_status)}
              >
                发布
              </Button>
            )}
            
            {canUnpublish(record) && (
              <Popconfirm
                title="确认下线"
                description="下线后酒店将不在用户端显示，确定吗？"
                onConfirm={() => handleTogglePublish(record.id, record.publish_status)}
                okText="确认"
                cancelText="取消"
              >
                <Button danger type="link" size="small" icon={<StopOutlined />}>
                  下线
                </Button>
              </Popconfirm>
            )}
          </Space>
          
          {record.review_status === 'rejected' && record.reject_reason && (
            <Tooltip title={record.reject_reason}>
              <Tag color="error" icon={<CloseCircleOutlined />}>
                查看拒绝原因
              </Tag>
            </Tooltip>
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
    <div>
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          所有酒店管理
        </Title>
        <Text type="secondary">平台共有 {total} 家酒店</Text>
      </div>

      {/* 筛选栏 */}
      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {/* 基础筛选 */}
          <Flex gap={16} wrap="wrap">
            <Input
              placeholder="搜索酒店名称"
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
              allowClear
            />
            <Select
              placeholder="审核状态"
              style={{ width: 150 }}
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
              style={{ width: 150 }}
              value={filters.publish_status}
              onChange={(value) => handleFilterChange('publish_status', value)}
              allowClear
            >
              <Option value="published">已发布</Option>
              <Option value="unpublished">未发布</Option>
            </Select>
            <Select
              placeholder="商户筛选"
              style={{ width: 200 }}
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
            <Button
              icon={<FilterOutlined />}
              onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
            >
              高级筛选
            </Button>
            <Button icon={<ReloadOutlined />} onClick={resetFilters}>
              重置
            </Button>
          </Flex>

          {/* 高级筛选 */}
          {showAdvancedFilter && (
            <Flex gap={16} wrap="wrap" style={{ paddingTop: 8 }}>
              <RangePicker
                placeholder={['开始日期', '结束日期']}
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
          )}
        </Space>
      </Card>

      {/* 操作栏 */}
      <Card style={{ marginBottom: 16, borderRadius: 12 }} bodyStyle={{ padding: '16px 24px' }}>
        <Flex justify="space-between" align="center">
          <Space>
            <Badge count={selectedRowKeys.length} offset={[-5, 5]}>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={handleBatchPublish}
                disabled={selectedRowKeys.length === 0}
              >
                批量发布
              </Button>
            </Badge>
            <Button
              danger
              icon={<StopOutlined />}
              onClick={handleBatchUnpublish}
              disabled={selectedRowKeys.length === 0}
            >
              批量下线
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              导出CSV
            </Button>
          </Space>
          <Button type="dashed" onClick={() => fetchData()} loading={loading}>
            刷新
          </Button>
        </Flex>
      </Card>

      {/* 表格 */}
      <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            getCheckboxProps: (record) => ({
              disabled: record.review_status !== 'approved', // 只有审核通过的才能批量操作发布状态
            }),
          }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size || 10);
              fetchData(page, size || 10);
            },
          }}
          scroll={{ x: 1400 }}
        />
      </Card>
    </div>
  );
};

export default AllHotels;