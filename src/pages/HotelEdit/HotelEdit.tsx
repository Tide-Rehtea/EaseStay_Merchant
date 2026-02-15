import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Spin,
  message,
  Result,
  Button,
  Flex,
  Space,
  Divider,
  Alert,
} from 'antd';
import { 
  EditOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import HotelForm from '@/components/HotelForm/HotelForm';
import { api } from '@/api';
import type { ReqHotelCreate } from '@/api/types';

const { Title, Text } = Typography;

// 样式组件 - 优化滚动和布局
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const PageHeaderContainer = styled.div`
  background: #fff;
  padding: 24px 28px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }
`;

const ContentCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  
  .ant-card-body {
    padding: 0;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const StatusBadge = styled.div<{ status: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => 
    props.status === 'pending' ? '#fff7e6' :
    props.status === 'approved' ? '#f6ffed' :
    props.status === 'rejected' ? '#fff2f0' :
    '#f5f5f5'
  };
  color: ${props => 
    props.status === 'pending' ? '#fa8c16' :
    props.status === 'approved' ? '#52c41a' :
    props.status === 'rejected' ? '#f5222d' :
    '#8c8c8c'
  };
  border: 1px solid ${props => 
    props.status === 'pending' ? '#ffd591' :
    props.status === 'approved' ? '#b7eb8f' :
    props.status === 'rejected' ? '#ffccc7' :
    '#d9d9d9'
  };
`;

const HotelEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [hotelData, setHotelData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 获取酒店详情（编辑模式）
  useEffect(() => {
    if (isEdit && id) {
      fetchHotelDetail(parseInt(id));
    }
  }, [id, isEdit]);

  const fetchHotelDetail = async (hotelId: number) => {
    setFetching(true);
    try {
      const response = await api.hotel.getById(hotelId);
      if (response.success) {
        setHotelData(response.data.hotel);
      } else {
        setError('获取酒店信息失败');
      }
    } catch (error: any) {
      console.error('获取酒店详情失败:', error);
      setError(error.message || '获取酒店信息失败');
    } finally {
      setFetching(false);
    }
  };

  // 处理表单提交
  const handleSubmit = async (values: ReqHotelCreate) => {
    setLoading(true);
    try {
      if (isEdit && id) {
        // 更新酒店
        await api.hotel.update(parseInt(id), values);
        message.success({
          content: '酒店信息更新成功！',
          icon: <EditOutlined />,
          duration: 3,
        });
        // 跳转回列表页
        setTimeout(() => {
          navigate('/merchant/hotels');
        }, 1500);
      } else {
        // 创建酒店
        await api.hotel.create(values);
        message.success({
          content: '酒店创建成功，已提交审核！',
          icon: <PlusOutlined />,
          duration: 3,
        });
        // 跳转到酒店列表
        setTimeout(() => {
          navigate('/merchant/hotels');
        }, 1500);
      }
    } catch (error: any) {
      console.error('保存失败:', error);
      message.error(error.message || '保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <LoadingContainer>
        <Spin size="large" tip="加载酒店信息..." />
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Result
          status="error"
          title="加载失败"
          subTitle={error}
          extra={[
            <Button 
              key="back" 
              type="primary" 
              onClick={() => navigate('/merchant/hotels')}
              icon={<ArrowLeftOutlined />}
              size="large"
              style={{ borderRadius: 8 }}
            >
              返回酒店列表
            </Button>,
          ]}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* 页面头部 - 移除面包屑 */}
      <PageHeaderContainer>
        <Flex vertical gap={16}>
          {/* 标题区域 */}
          <Flex justify="space-between" align="center">
            <Flex vertical gap={4}>
              <Title level={3} style={{ margin: 0, fontWeight: 600 }}>
                {isEdit ? '编辑酒店信息' : '添加新酒店'}
              </Title>
              <Text type="secondary" style={{ fontSize: 14 }}>
                {isEdit 
                  ? '修改您的酒店信息，更新后需要重新审核'
                  : '创建新的酒店信息，提交后等待审核'
                }
              </Text>
            </Flex>
            
            {/* 状态标签（编辑模式） */}
            {isEdit && hotelData?.status && (
              <StatusBadge status={hotelData.status}>
                当前状态：{
                  hotelData.status === 'pending' ? '待审核' :
                  hotelData.status === 'approved' ? '已通过' :
                  hotelData.status === 'rejected' ? '已拒绝' :
                  '已下线'
                }
              </StatusBadge>
            )}
          </Flex>

          {/* 操作按钮组 */}
          <Flex justify="space-between" align="center">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/merchant/hotels')}
              size="middle"
              style={{ borderRadius: 8 }}
            >
              返回列表
            </Button>
            
            {isEdit && hotelData?.status === 'rejected' && (
              <Alert
                message="审核未通过"
                description={hotelData.reject_reason || '请修改酒店信息后重新提交审核'}
                type="error"
                showIcon
                style={{ flex: 1, marginLeft: 24, borderRadius: 8 }}
              />
            )}
          </Flex>
        </Flex>
      </PageHeaderContainer>
      
      {/* 表单内容 */}
      <ContentCard bordered={false}>
        <HotelForm
          initialValues={hotelData}
          onSubmit={handleSubmit}
          loading={loading}
          isEdit={isEdit}
        />
      </ContentCard>
    </PageContainer>
  );
};

export default HotelEdit;