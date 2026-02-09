import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const HotelEdit: React.FC = () => {
  return (
    <div>
      <Title level={2}>酒店编辑</Title>
      <Card>
        <p>酒店编辑页面开发中...</p>
        <p>这里会提供表单来创建或编辑酒店信息。</p>
      </Card>
    </div>
  );
};

export default HotelEdit;