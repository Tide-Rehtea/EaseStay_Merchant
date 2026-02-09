import './reset.css';
import 'antd/dist/reset.css'; // 引入Ant Design样式

// 导出全局样式
export const globalStyles = {
  // 可以在这里定义全局样式类
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px',
  },
  flexCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
};