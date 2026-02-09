import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const HotelList: React.FC = () => {
  return (
    <div>
      <Title level={2}>酒店列表</Title>
      <Card>
        <p>酒店列表页面开发中...</p>
        <p>这里会展示商户的所有酒店，支持搜索、筛选和分页。</p>
      </Card>
    </div>
  );
};

export default HotelList;