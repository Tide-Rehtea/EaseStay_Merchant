import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const PendingReview: React.FC = () => {
  return (
    <div>
      <Title level={2}>待审核酒店</Title>
      <Card>
        <p>待审核页面开发中...</p>
        <p>这里会展示所有待审核的酒店，管理员可以审核通过或拒绝。</p>
      </Card>
    </div>
  );
};

export default PendingReview;