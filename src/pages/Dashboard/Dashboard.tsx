import React from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import {
  HomeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  // 从localStorage获取用户信息
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  return (
    <div>
      <Title level={2}>仪表板</Title>
      <Title level={5} type="secondary" style={{ marginBottom: 24 }}>
        欢迎回来，{user?.email || '用户'}！
      </Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总酒店数"
              value={156}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待审核"
              value={8}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已通过"
              value={142}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总商户数"
              value={67}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
      
      {/* 根据角色显示不同的内容 */}
      <Card title="系统状态" style={{ marginTop: 24 }}>
        <p>系统运行正常</p>
        {user?.role === 'admin' && (
          <div style={{ marginTop: 16 }}>
            <p>👑 管理员功能：</p>
            <ul>
              <li>审核酒店申请</li>
              <li>管理所有酒店信息</li>
              <li>查看系统统计</li>
            </ul>
          </div>
        )}
        {user?.role === 'merchant' && (
          <div style={{ marginTop: 16 }}>
            <p>🏨 商户功能：</p>
            <ul>
              <li>管理我的酒店</li>
              <li>添加新酒店</li>
              <li>查看审核状态</li>
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;