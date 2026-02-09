import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const AllHotels: React.FC = () => {
  return (
    <div>
      <Title level={2}>所有酒店</Title>
      <Card>
        <p>所有酒店管理页面开发中...</p>
        <p>这里会展示系统中的所有酒店，管理员可以管理。</p>
      </Card>
    </div>
  );
};

export default AllHotels;