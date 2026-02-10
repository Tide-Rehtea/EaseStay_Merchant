import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Breadcrumb,
  Spin,
  message,
  Result,
  Button,
  Flex,
  Space
} from 'antd';
import { 
  HomeOutlined, 
  EditOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import HotelForm from '@/components/HotelForm/HotelForm';
import { api } from '@/api';
import type { ReqHotelCreate } from '@/api/types';

const { Title, Text } = Typography;

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

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
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
        message.success('酒店信息更新成功！');
      } else {
        // 创建酒店
        await api.hotel.create(values);
        message.success('酒店创建成功，等待审核！');
        
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

  // 面包屑导航
  const breadcrumbItems = [
    {
      title: (
        <>
          <HomeOutlined />
          <span>首页</span>
        </>
      ),
      onClick: () => navigate('/dashboard'),
    },
    {
      title: (
        <>
          <HomeOutlined />
          <span>我的酒店</span>
        </>
      ),
      onClick: () => navigate('/merchant/hotels'),
    },
    {
      title: isEdit ? '编辑酒店' : '添加酒店',
    },
  ];

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
      {/* 自定义 PageHeader */}
      <PageHeaderContainer>
        <Flex vertical gap="middle">
          {/* 面包屑导航 */}
          <Breadcrumb items={breadcrumbItems} />
          
          {/* 标题区域 */}
          <Flex justify="space-between" align="flex-start">
            <Flex vertical gap="small">
              <Title level={3} style={{ margin: 0 }}>
                {isEdit ? '编辑酒店信息' : '添加新酒店'}
              </Title>
              <Text type="secondary">
                {isEdit 
                  ? '修改您的酒店信息，更新后需要重新审核'
                  : '创建新的酒店信息，提交后等待审核'
                }
              </Text>
            </Flex>
            
            {/* 操作按钮 */}
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/merchant/hotels')}
              >
                返回列表
              </Button>
              {isEdit && (
                <Button 
                  type="primary" 
                  icon={<EditOutlined />}
                  loading={loading}
                >
                  保存修改
                </Button>
              )}
            </Space>
          </Flex>
        </Flex>
      </PageHeaderContainer>
      
      {/* 表单内容 */}
      <Card>
        <HotelForm
          initialValues={hotelData}
          onSubmit={handleSubmit}
          loading={loading}
          isEdit={isEdit}
        />
      </Card>
    </PageContainer>
  );
};

export default HotelEdit;