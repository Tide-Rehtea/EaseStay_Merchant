import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Modal, Button, Space, Popconfirm, Input, Flex } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import { api } from '@/api';
import HotelView from './HotelView';
import type { ResHotel } from '@/api/types';

const HotelViewAdmin: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 处理审核操作
  const handleApprove = async () => {
    if (!id) return;
    try {
      await api.admin.reviewHotel(Number(id), { action: 'approve' });
      message.success({
        content: '审核通过成功',
        icon: <CheckCircleOutlined />,
        style: { borderRadius: 8 }
      });
      // 刷新页面
      window.location.reload();
    } catch (error) {
      message.error('操作失败，请重试');
    }
  };

  const handleReject = () => {
    let reason = '';
    
    Modal.confirm({
      title: '拒绝审核',
      icon: <CloseCircleOutlined style={{ color: '#f5222d' }} />,
      content: (
        <div style={{ marginTop: 16 }}>
          <Input.TextArea
            placeholder="请输入拒绝原因"
            id="reject_reason"
            rows={4}
            onChange={(e) => { reason = e.target.value; }}
            style={{ borderRadius: 8 }}
          />
        </div>
      ),
      onOk: async () => {
        if (!reason.trim()) {
          message.warning('请填写拒绝原因');
          return Promise.reject();
        }
        try {
          await api.admin.reviewHotel(Number(id), {
            action: 'reject',
            reject_reason: reason,
          });
          message.success('已拒绝该酒店的审核申请');
          window.location.reload();
        } catch {
          message.error('操作失败，请重试');
        }
      },
      okText: '确认拒绝',
      cancelText: '取消',
      okButtonProps: { danger: true },
      style: { top: '30%' },
    });
  };

  // 处理发布/下线
  const handleTogglePublish = async (action: 'publish' | 'unpublish') => {
    if (!id) return;
    try {
      await api.admin.toggleHotel(Number(id), { action });
      message.success(action === 'publish' ? '酒店已发布' : '酒店已下线');
      window.location.reload();
    } catch (error) {
      message.error('操作失败，请重试');
    }
  };

  // 管理员操作按钮
  const adminActions = (hotel: ResHotel) => {
    if (!hotel) return null;

    // 待审核状态 - 显示审核按钮
    if (hotel.review_status === 'pending') {
      return (
        <Flex gap={8}>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleApprove}
            shape="round"
            size="large"
            style={{
              background: 'linear-gradient(135deg, #52c41a, #389e0d)',
              border: 'none',
              boxShadow: '0 8px 16px rgba(82, 196, 26, 0.25)',
            }}
          >
            通过审核
          </Button>
          <Button
            danger
            icon={<CloseCircleOutlined />}
            onClick={handleReject}
            shape="round"
            size="large"
          >
            拒绝审核
          </Button>
        </Flex>
      );
    }

    // 审核通过状态 - 显示发布/下线按钮
    if (hotel.review_status === 'approved') {
      if (hotel.publish_status === 'published') {
        return (
          <Popconfirm
            title="确认下线"
            description="下线后酒店将不在用户端显示，确定要下线吗？"
            onConfirm={() => handleTogglePublish('unpublish')}
            okText="确认下线"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            placement="bottomRight"
          >
            <Button 
              danger 
              icon={<PauseCircleOutlined />}
              shape="round"
              size="large"
            >
              下线酒店
            </Button>
          </Popconfirm>
        );
      } else {
        return (
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => handleTogglePublish('publish')}
            shape="round"
            size="large"
            style={{
              background: 'linear-gradient(135deg, #1890ff, #096dd9)',
              border: 'none',
              boxShadow: '0 8px 16px rgba(24, 144, 255, 0.25)',
            }}
          >
            发布酒店
          </Button>
        );
      }
    }

    // 已拒绝状态 - 没有操作按钮
    return null;
  };

  return <HotelView adminActions={adminActions} />;
};

export default HotelViewAdmin;