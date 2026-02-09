import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  message, 
  Typography, 
  Divider,
  Space,
  Alert,
  Checkbox
} from 'antd';
import { 
  MailOutlined,
  LockOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
  GoogleOutlined,
  GithubOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { api } from '@/api';
import type { ReqLogin } from '@/api/types';

const { Title, Text } = Typography;

// 样式组件
const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 440px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  .ant-card-body {
    padding: 40px;
  }
`;

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const Logo = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #1890ff;
  margin-bottom: 8px;
  letter-spacing: 1px;
  .logo-text {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const RegisterLink = styled.div`
  text-align: center;
  margin-top: 24px;
  color: #666;
  a {
    color: #1890ff;
    font-weight: 500;
    margin-left: 4px;
    &:hover {
      color: #40a9ff;
    }
  }
`;

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: ReqLogin) => {
    setLoading(true);
    try {
      // 使用真实的API接口
      const response = await api.auth.login(values);

      if (response.success) {
        const { token, user } = response.data;
        
        // 保存 token 和用户信息到 localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // 记住我功能
        if (values.remember) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('savedEmail', values.email);
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('savedEmail');
        }

        // 根据角色跳转到不同页面
        if (user.role === 'admin') {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/merchant/hotels', { replace: true });
        }
      }
    } catch (error: any) {
      // 错误已经在 validatedRequest 中处理了
      console.error('登录失败:', error);
      // 如果 validatedRequest 没有显示错误消息，可以在这里添加
      if (!error.message?.includes('验证失败')) {
        message.error(error.message || '登录失败');
      }
    } finally {
      setLoading(false);
    }
  };

  // 如果没有找到 @/api 路径，可以使用相对路径导入
  // import { api } from '../../api';

  // 测试账号填充
  const fillTestAccount = (type: 'merchant' | 'admin') => {
    const accounts = {
      merchant: { 
        email: 'merchant@test.com', 
        password: 'merchant123',
        remember: true
      },
      admin: { 
        email: 'admin@hotel.com', 
        password: 'admin123',
        remember: true
      }
    };
    form.setFieldsValue(accounts[type]);
  };

  return (
    <LoginContainer>
      <LoginCard>
        <LogoSection>
          <Logo>
            <span className="logo-text">易宿酒店管理平台</span>
          </Logo>
          <Title level={3} style={{ margin: '16px 0 8px' }}>
            用户登录
          </Title>
          <Text type="secondary">登录您的酒店管理账户</Text>
        </LogoSection>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          initialValues={{ remember: true }}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="邮箱地址"
              allowClear
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位字符' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              iconRender={(visible) => 
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
              <Link to="#" style={{ color: '#1890ff' }} onClick={() => message.info('功能开发中')}>
                忘记密码？
              </Link>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </Form.Item>

          <Divider plain>或</Divider>

          <Space direction="vertical" style={{ width: '100%' }}>
            <Button
              icon={<GoogleOutlined />}
              block
              onClick={() => message.info('Google登录功能开发中')}
            >
              使用 Google 登录
            </Button>
            <Button
              icon={<GithubOutlined />}
              block
              onClick={() => message.info('GitHub登录功能开发中')}
            >
              使用 GitHub 登录
            </Button>
          </Space>

          <Alert
            message="测试账号"
            description={
              <Space direction="vertical" size="small" style={{ width: '100%', marginTop: 8 }}>
                <Text type="secondary">点击快速填充：</Text>
                <Space>
                  <Button size="small" onClick={() => fillTestAccount('merchant')}>
                    商户账号
                  </Button>
                  <Button size="small" onClick={() => fillTestAccount('admin')}>
                    管理员账号
                  </Button>
                </Space>
              </Space>
            }
            type="info"
            showIcon
            style={{ marginTop: 24 }}
          />
        </Form>

        <RegisterLink>
          还没有账号？
          <Link to="/register">立即注册</Link>
        </RegisterLink>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;