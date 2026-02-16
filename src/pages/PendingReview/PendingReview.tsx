// PendingReview.tsx
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
  Popconfirm,
  Flex,
  Rate,
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
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { api } from '@/api';
// 修改导入：使用 ResHotel 而不是 Hotel
import type { ResHotel } from '@/api/types';

const { Title, Text } = Typography;
const { TextArea } = Input;

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
    return path.startsWith('http') ? path : `http://localhost:3001${path}`;
  };

  // 表格列定义
  const columns: ColumnsType<PendingHotel> = [
    {
      title: '酒店信息',
      key: 'hotelInfo',
      width: 300,
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
              {record.name_en && (
                <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                  {record.name_en}
                </Text>
              )}
            </div>
            <Space size={4} wrap style={{ marginBottom: 4 }}>
              <Rate disabled defaultValue={record.star} count={5} style={{ fontSize: 12 }} />
              <Tag color="blue" icon={<DollarOutlined />}>
                ¥{record.price}起
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
            提交: {dayjs(record.created_at).format('YYYY-MM-DD HH:mm')}
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
            {roomTypes.slice(0, 2).map((room, index) => (
              <div key={index}>
                <Text strong>{room.type}</Text>
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  ¥{room.price}
                </Text>
              </div>
            ))}
            {roomTypes.length > 2 && (
              <Text type="secondary">等{roomTypes.length}个房型</Text>
            )}
          </Space>
        );
      },
    },
    {
      title: '标签/设施',
      key: 'tags',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          {record.tags && record.tags.length > 0 && (
            <div>
              {record.tags.slice(0, 3).map((tag: string) => (
                <Tag key={tag} color="blue" style={{ marginBottom: 4 }}>
                  {tag}
                </Tag>
              ))}
            </div>
          )}
          {record.facilities && record.facilities.length > 0 && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.facilities.slice(0, 3).join(' · ')}
              {record.facilities.length > 3 && ' 等'}
            </Text>
          )}
        </Space>
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
              type="primary"
              icon={<CheckCircleOutlined />}
              size="small"
              onClick={() => handleApprove(record.id)}
            >
              通过
            </Button>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              size="small"
              onClick={() => handleReject(record)}
            >
              拒绝
            </Button>
          </Space>
          <Space>
            <Button
              type="link"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => navigate(`/admin/hotels/${record.id}`)}
            >
              详情
            </Button>
          </Space>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          待审核酒店
        </Title>
        <Text type="secondary">共有 {total} 个酒店等待审核</Text>
      </div>

      {/* 操作栏 */}
      <Card style={{ marginBottom: 16, borderRadius: 12 }} bodyStyle={{ padding: '16px 24px' }}>
        <Flex justify="space-between" align="center">
          <Space>
            <Badge count={selectedRowKeys.length} offset={[-5, 5]}>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleBatchApprove}
                disabled={selectedRowKeys.length === 0}
              >
                批量通过
              </Button>
            </Badge>
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                if (selectedRowKeys.length === 1) {
                  navigate(`/admin/hotels/${selectedRowKeys[0]}`);
                } else if (selectedRowKeys.length > 1) {
                  message.warning('请只选择一个酒店查看详情');
                } else {
                  message.warning('请选择要查看的酒店');
                }
              }}
            >
              查看详情
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
          scroll={{ x: 1200 }}
        />
      </Card>

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
    </div>
  );
};

export default PendingReview;