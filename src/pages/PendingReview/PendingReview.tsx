import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Avatar,
  Modal,
  Form,
  Input,
  message,
  Tooltip,
  Badge,
  Flex,
  Rate,
  Divider,
  Input as SearchInput,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  BankOutlined,
  DollarOutlined,
  CalendarOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { api } from '@/api';
import type { ResHotel } from '@/api/types';
import { IMAGE_BASE } from '@/config/constants';
import styled from 'styled-components';

const { Title, Text } = Typography;
const { TextArea } = Input;

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

// 待审核酒店列表响应类型 - 直接使用 ResHotel
interface PendingHotel extends ResHotel {
  // ResHotel 已经包含 merchant 字段（可选）
}

const PendingReview: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PendingHotel[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState('');
  
  // 拒绝弹窗
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [currentHotel, setCurrentHotel] = useState<PendingHotel | null>(null);
  const [rejectForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // 获取待审核列表
  const fetchData = async (page = currentPage, size = pageSize) => {
    setLoading(true);
    try {
      const response = await api.admin.getPendingHotels({
        page,
        limit: size,
      });
      
      if (response.success) {
        setData(response.data.hotels);
        setTotal(response.data.pagination.total);
      }
    } catch (error) {
      console.error('获取待审核列表失败:', error);
      message.error('获取数据失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 处理通过审核
  const handleApprove = async (id: number) => {
    try {
      const response = await api.admin.reviewHotel(id, { action: 'approve' });
      if (response.success) {
        message.success('审核通过成功');
        fetchData();
        setSelectedRowKeys([]);
      }
    } catch (error) {
      console.error('审核通过失败:', error);
      message.error('操作失败，请重试');
    }
  };

  // 处理拒绝审核
  const handleReject = (record: PendingHotel) => {
    setCurrentHotel(record);
    setRejectModalVisible(true);
  };

  // 提交拒绝
  const submitReject = async () => {
    try {
      const values = await rejectForm.validateFields();
      if (!currentHotel) return;

      setSubmitting(true);
      const response = await api.admin.reviewHotel(currentHotel.id, {
        action: 'reject',
        reject_reason: values.reject_reason,
      });

      if (response.success) {
        message.success('已拒绝该酒店');
        setRejectModalVisible(false);
        rejectForm.resetFields();
        fetchData();
        setSelectedRowKeys([]);
      }
    } catch (error) {
      console.error('拒绝操作失败:', error);
      message.error('操作失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 批量审核通过
  const handleBatchApprove = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要审核的酒店');
      return;
    }

    Modal.confirm({
      title: '批量审核通过',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      content: `确定要通过选中的 ${selectedRowKeys.length} 个酒店吗？`,
      onOk: async () => {
        const hide = message.loading('正在处理中...', 0);
        let successCount = 0;
        let failCount = 0;

        for (const id of selectedRowKeys) {
          try {
            await api.admin.reviewHotel(Number(id), { action: 'approve' });
            successCount++;
          } catch {
            failCount++;
          }
        }

        hide();
        message.success(`处理完成：${successCount}个成功，${failCount}个失败`);
        fetchData();
        setSelectedRowKeys([]);
      },
    });
  };

  // 获取完整图片URL
  const getImageUrl = (path: string) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${IMAGE_BASE}${path}`;
  };

  // 搜索过滤
  const filteredData = data.filter(hotel => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      hotel.name?.toLowerCase().includes(searchLower) ||
      hotel.name_en?.toLowerCase().includes(searchLower) ||
      hotel.address?.toLowerCase().includes(searchLower) ||
      hotel.merchant?.email?.toLowerCase().includes(searchLower)
    );
  });

  // 表格列定义 - 调整列宽比例
  const columns: ColumnsType<PendingHotel> = [
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
          <div style={{ minWidth: 0, flex: 1 }}>
            <EllipsisDiv style={{ fontWeight: 600, marginBottom: 4 }}>
              {record.name}
              {record.name_en && (
                <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                  {record.name_en}
                </Text>
              )}
            </EllipsisDiv>
            <Space size={4} wrap style={{ marginBottom: 4 }}>
              <Rate disabled defaultValue={record.star} count={5} style={{ fontSize: 12, flexShrink: 0 }} />
              <Tag color="blue" icon={<DollarOutlined />} style={{ flexShrink: 0 }}>
                ¥{record.price}起
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
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          <Tooltip title={record.merchant?.email || '未知商户'}>
            <EllipsisText>
              <UserOutlined style={{ marginRight: 4, color: '#1890ff' }} />
              {record.merchant?.email || '未知商户'}
            </EllipsisText>
          </Tooltip>
          <Tooltip title={`提交: ${dayjs(record.created_at).format('YYYY-MM-DD HH:mm')}`}>
            <EllipsisText type="secondary" style={{ fontSize: 12 }}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              提交: {dayjs(record.created_at).format('YYYY-MM-DD HH:mm')}
            </EllipsisText>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: '房型信息',
      key: 'roomType',
      width: 130,
      render: (_, record) => {
        const roomTypes = record.room_type as any[];
        if (!roomTypes?.length) return <Text type="secondary">暂无房型</Text>;
        
        return (
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            {roomTypes.slice(0, 1).map((room, index) => (
              <Tooltip key={index} title={`${room.type} - ¥${room.price}`}>
                <EllipsisText>
                  <Text strong>{room.type}</Text>
                  <Text type="secondary" style={{ marginLeft: 4 }}>
                    ¥{room.price}
                  </Text>
                </EllipsisText>
              </Tooltip>
            ))}
            {roomTypes.length > 1 && (
              <Tooltip title={`等${roomTypes.length}个房型`}>
                <EllipsisText type="secondary">
                  +{roomTypes.length - 1}个房型
                </EllipsisText>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    {
      title: '标签',
      key: 'tags',
      width: 130,
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
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            onClick={() => handleApprove(record.id)}
            size="small"
          >
            通过
          </ActionButton>
          <ActionButton
            type="text"
            icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
            onClick={() => handleReject(record)}
            size="small"
          >
            拒绝
          </ActionButton>
          <ActionButton
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/hotels/${record.id}`)}
            size="small"
          >
            详情
          </ActionButton>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      {/* 页面标题 */}
      <PageHeaderContainer>
        <Flex vertical gap="small">
          <Flex justify="space-between" align="center">
            <Flex vertical gap={4}>
              <Title level={3} style={{ margin: 0, fontWeight: 600 }}>
                待审核酒店
              </Title>
              <Text type="secondary" style={{ fontSize: 14 }}>
                共有 {total} 个酒店等待审核
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </PageHeaderContainer>

      {/* 操作栏 */}
      <FilterCard>
        <Flex vertical gap={16}>
          <Flex align="center" justify="space-between">
            <Flex align="center" gap={8}>
              <FilterOutlined style={{ color: '#1890ff' }} />
              <Text strong style={{ fontSize: 16 }}>批量操作</Text>
            </Flex>
            
            <Flex align="center" gap={12}>
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
          </Flex>
          
          <Divider style={{ margin: 0 }} />
          
          <Flex align="center" justify="space-between" wrap gap={16}>
            <Flex align="center" gap={16} wrap>
              <Badge count={selectedRowKeys.length} offset={[-5, 5]} showZero>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={handleBatchApprove}
                  disabled={selectedRowKeys.length === 0}
                  size="middle"
                  style={{
                    height: 40,
                    padding: '0 24px',
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                >
                  批量通过
                </Button>
              </Badge>
              
              {selectedRowKeys.length > 0 && (
                <Text type="secondary" style={{ fontSize: 13 }}>
                  已选择 <Text strong style={{ color: '#1890ff' }}>{selectedRowKeys.length}</Text> 项
                </Text>
              )}
            </Flex>
            
            {/* 右侧搜索框 */}
            <SearchInput
              placeholder="搜索酒店名称/商户"
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              style={{ width: 280, height: 40, borderRadius: 8 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Flex>

          {/* 当前筛选条件显示 */}
          {searchText && (
            <Flex align="center" gap={8} wrap>
              <Text type="secondary" style={{ fontSize: 13 }}>当前筛选：</Text>
              {searchText && (
                <Tag 
                  color="processing" 
                  closable 
                  onClose={() => setSearchText('')}
                  style={{ borderRadius: 4 }}
                >
                  搜索：{searchText}
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
                审核列表
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                显示 {filteredData.length} 条 / 共 {total} 条
              </Text>
            </Flex>
          </Flex>
          
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: filteredData.length,
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
            scroll={{ x: 1200 }}
            rowClassName={(record) => 
              record.review_status === 'pending' ? 'row-pending' : ''
            }
            locale={{
              emptyText: (
                <Flex vertical gap={8} align="center" style={{ padding: '40px 0' }}>
                  <Text type="secondary">
                    {data.length === 0 ? '暂无待审核酒店' : '没有符合搜索条件的酒店'}
                  </Text>
                  {data.length > 0 && searchText && (
                    <Button icon={<ReloadOutlined />} onClick={() => setSearchText('')} size="small">
                      清除搜索
                    </Button>
                  )}
                </Flex>
              ),
            }}
          />
        </Flex>
      </TableCard>

      {/* 拒绝弹窗 */}
      <Modal
        title={
          <Space>
            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
            <span>拒绝审核 - {currentHotel?.name}</span>
          </Space>
        }
        open={rejectModalVisible}
        onCancel={() => {
          setRejectModalVisible(false);
          rejectForm.resetFields();
        }}
        onOk={submitReject}
        confirmLoading={submitting}
        okText="确认拒绝"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            name="reject_reason"
            label="拒绝原因"
            rules={[{ required: true, message: '请填写拒绝原因' }]}
          >
            <TextArea
              rows={4}
              placeholder="请填写拒绝原因，商户将收到此原因"
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>

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

export default PendingReview;