// HotelViewAdmin.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Modal, Button, Space, Popconfirm, Input } from 'antd';
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
      message.success('审核通过成功');
      // 刷新页面
      window.location.reload();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleReject = () => {
    Modal.confirm({
      title: '拒绝审核',
      content: (
        <Input.TextArea
          placeholder="请输入拒绝原因"
          id="reject_reason"
          rows={3}
        />
      ),
      onOk: async () => {
        const reason = (document.getElementById('reject_reason') as HTMLTextAreaElement)?.value;
        if (!reason) {
          message.warning('请填写拒绝原因');
          return Promise.reject();
        }
        try {
          await api.admin.reviewHotel(Number(id), {
            action: 'reject',
            reject_reason: reason,
          });
          message.success('已拒绝');
          window.location.reload();
        } catch {
          message.error('操作失败');
        }
      },
    });
  };

  // 处理发布/下线
  const handleTogglePublish = async (action: 'publish' | 'unpublish') => {
    if (!id) return;
    try {
      await api.admin.toggleHotel(Number(id), { action });
      message.success(action === 'publish' ? '已发布' : '已下线');
      window.location.reload();
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 管理员操作按钮
  const adminActions = (hotel: ResHotel) => {
    if (!hotel) return null;

    // 待审核状态 - 显示审核按钮
    if (hotel.review_status === 'pending') {
      return (
        <Space>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleApprove}
          >
            通过审核
          </Button>
          <Button
            danger
            icon={<CloseCircleOutlined />}
            onClick={handleReject}
          >
            拒绝审核
          </Button>
        </Space>
      );
    }

    // 审核通过状态 - 显示发布/下线按钮
    if (hotel.review_status === 'approved') {
      if (hotel.publish_status === 'published') {
        return (
          <Popconfirm
            title="确认下线"
            description="下线后酒店将不在用户端显示，确定吗？"
            onConfirm={() => handleTogglePublish('unpublish')}
          >
            <Button danger icon={<PauseCircleOutlined />}>
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