import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Typography,
  Steps,
  Select,
  Alert,
  Row,
  Col,
} from "antd";
import {
  MailOutlined,
  LockOutlined,
  UserOutlined,
  CheckCircleOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import { api } from "@/api";
import type { ReqRegister } from "@/api/types";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// 样式组件
const RegisterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-image: linear-gradient(90deg, #e0c3fc 0%, #8ec5fc 100%);
  padding: 20px;
`;

const RegisterCard = styled(Card)`
  width: 100%;
  max-width: 520px;
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
    background-image: linear-gradient(90deg, #e0c3fc 0%, #8ec5fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const StyledSteps = styled(Steps)`
  margin-bottom: 32px;
  .ant-steps-item-title {
    font-size: 14px;
  }
`;

const PasswordStrength = styled.div<{ strength: number }>`
  margin-top: 8px;

  .strength-bar {
    height: 4px;
    background: #f0f0f0;
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 4px;

    .fill {
      height: 100%;
      background: ${(props) => {
        if (props.strength >= 80) return "#52c41a";
        if (props.strength >= 60) return "#faad14";
        return "#ff4d4f";
      }};
      width: ${(props) => props.strength}%;
      transition: all 0.3s;
    }
  }

  .strength-text {
    font-size: 12px;
    color: ${(props) => {
      if (props.strength >= 80) return "#52c41a";
      if (props.strength >= 60) return "#faad14";
      return "#ff4d4f";
    }};
  }
`;

const LoginLink = styled.div`
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

const Register: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formData, setFormData] = useState<Partial<ReqRegister>>({}); // 新增：存储表单数据

  // 计算密码强度
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;

    if (password.length >= 6) strength += 20;
    if (password.length >= 8) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/\d/.test(password)) strength += 20;

    return Math.min(strength, 100);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const strength = calculatePasswordStrength(e.target.value);
    setPasswordStrength(strength);
  };

  // 下一步
  const nextStep = async () => {
    try {
      // 验证当前步骤的字段
      if (currentStep === 0) {
        // 验证第一步的字段
        const values = await form.validateFields(["email", "password", "confirmPassword"]);
        setFormData(prev => ({ ...prev, ...values }));
      } else if (currentStep === 1) {
        // 验证第二步的字段
        const values = await form.validateFields(["role"]);
        setFormData(prev => ({ ...prev, ...values }));
      }

      // 前往下一步或提交
      if (currentStep < 2) {
        setCurrentStep(currentStep + 1);
      } else {
        // 最后一步直接提交
        handleSubmit();
      }
    } catch (error) {
      console.log("验证失败:", error);
    }
  };

  // 上一步
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 单独的处理提交函数
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 使用存储在 state 中的 formData
      const registerData: ReqRegister = {
        email: formData.email!,
        password: formData.password!,
        role: formData.role || "merchant",
        confirmPassword: formData.confirmPassword!,
      };

      console.log("注册数据:", registerData);

      // 调用注册API
      const response = await api.auth.register(registerData);

      if (response.success) {
        const { token, user } = response.data;

        // 保存 token 和用户信息
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        message.success("注册成功！正在跳转...");

        // 根据角色跳转到不同页面
        setTimeout(() => {
          if (user.role === "admin") {
            navigate("/dashboard", { replace: true });
          } else {
            navigate("/merchant/hotels", { replace: true });
          }
        }, 1500);
      }
    } catch (error: any) {
      console.error("注册失败:", error);

      // 处理特定的错误信息
      if (error.message && error.message.includes("邮箱已被注册")) {
        form.setFields([
          {
            name: "email",
            errors: ["该邮箱已被注册"],
          },
        ]);
        // 如果有错误，回到第一步
        setCurrentStep(0);
      } else if (error.message) {
        message.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // 表单字段变化时更新 formData
  const handleFormValuesChange = (changedValues: any) => {
    setFormData(prev => ({ ...prev, ...changedValues }));
  };

  // 测试账号填充
  const fillTestAccount = () => {
    form.setFieldsValue({
      email: "test@example.com",
      password: "Test123456",
      confirmPassword: "Test123456",
      role: "merchant",
    });
    // 同时更新 formData
    setFormData({
      email: "test@example.com",
      password: "Test123456",
      role: "merchant",
    });
    setPasswordStrength(calculatePasswordStrength("Test123456"));
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <LogoSection>
          <Logo>
            <span className="logo-text">易宿酒店管理平台</span>
          </Logo>
          <Title level={3} style={{ margin: "16px 0" }}>
            用户注册
          </Title>
          <Text type="secondary">创建您的酒店管理账户</Text>
        </LogoSection>

        <StyledSteps
          current={currentStep}
          items={[
            { title: "账户信息", description: "设置账号密码" },
            { title: "选择角色", description: "选择用户类型" },
            { title: "完成注册", description: "开始使用" },
          ]}
        />

        <Form
          form={form}
          name="register"
          onFinish={handleSubmit} // 修改这里
          onValuesChange={handleFormValuesChange} // 新增：监听字段变化
          layout="vertical"
          size="large"
          initialValues={{ role: "merchant" }}
        >
          {/* 第一步：账户信息 - 始终渲染但控制显示 */}
          <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
            <Form.Item
              name="email"
              label="邮箱地址"
              rules={[
                { required: true, message: "请输入邮箱" },
                { type: "email", message: "请输入有效的邮箱地址" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="请输入邮箱地址"
                allowClear
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="设置密码"
              rules={[
                { required: true, message: "请输入密码" },
                { min: 6, message: "密码至少6位字符" },
                {
                  pattern: /^(?=.*[A-Za-z])(?=.*\d)/,
                  message: "密码必须包含字母和数字",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码（至少6位，包含字母和数字）"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                onChange={handlePasswordChange}
              />
            </Form.Item>

            <PasswordStrength strength={passwordStrength}>
              <div className="strength-bar">
                <div className="fill" />
              </div>
              <div className="strength-text">
                密码强度：
                {passwordStrength >= 80
                  ? "强"
                  : passwordStrength >= 60
                    ? "中"
                    : "弱"}
              </div>
            </PasswordStrength>

            <Form.Item
              name="confirmPassword"
              label="确认密码"
              dependencies={["password"]}
              rules={[
                { required: true, message: "请确认密码" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("两次输入的密码不一致"));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请再次输入密码"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Row gutter={12}>
              <Col span={12}>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate("/login")}
                  block
                >
                  返回登录
                </Button>
              </Col>
              <Col span={12}>
                <Button type="primary" onClick={nextStep} block>
                  下一步
                </Button>
              </Col>
            </Row>
          </div>

          {/* 第二步：选择角色 - 始终渲染但控制显示 */}
          <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
            <Alert
              message="角色选择说明"
              description={
                <div>
                  <Paragraph style={{ marginBottom: 8 }}>
                    <strong>商户（Hotel Merchant）</strong>
                    ：可以添加和管理自己的酒店信息，提交审核申请
                  </Paragraph>
                  <Paragraph style={{ marginBottom: 8 }}>
                    <strong>管理员（Administrator）</strong>
                    ：可以审核酒店信息和管理所有商户，拥有系统管理权限
                  </Paragraph>
                  <Paragraph type="warning" style={{ marginBottom: 0 }}>
                    注意：管理员账号需要特殊权限，请谨慎选择
                  </Paragraph>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form.Item
              name="role"
              label="选择您的角色"
              rules={[{ required: true, message: "请选择角色" }]}
            >
              <Select placeholder="请选择您的角色">
                <Option value="merchant">
                  <UserOutlined /> 商户（酒店管理者）
                </Option>
                <Option value="admin">
                  <CheckCircleOutlined /> 管理员（系统管理员）
                </Option>
              </Select>
            </Form.Item>

            <Row gutter={12}>
              <Col span={12}>
                <Button onClick={prevStep} block>
                  上一步
                </Button>
              </Col>
              <Col span={12}>
                <Button type="primary" onClick={nextStep} block>
                  下一步
                </Button>
              </Col>
            </Row>
          </div>

          {/* 第三步：完成注册 - 始终渲染但控制显示 */}
          <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
            <Alert
              message="注册确认"
              description={
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <CheckCircleOutlined
                    style={{
                      fontSize: 48,
                      color: "#52c41a",
                      marginBottom: 16,
                    }}
                  />
                  <Title level={4} style={{ marginBottom: 8 }}>
                    确认注册信息
                  </Title>
                  <div
                    style={{
                      textAlign: "left",
                      background: "#f6ffed",
                      padding: 16,
                      borderRadius: 8,
                    }}
                  >
                    <Paragraph>
                      <strong>邮箱：</strong>
                      {formData.email || form.getFieldValue("email")}
                    </Paragraph>
                    <Paragraph>
                      <strong>角色：</strong>
                      {(formData.role || form.getFieldValue("role")) === "merchant"
                        ? "商户"
                        : "管理员"}
                    </Paragraph>
                  </div>
                  <Paragraph type="secondary" style={{ marginTop: 16 }}>
                    点击"完成注册"按钮创建您的账户
                  </Paragraph>
                </div>
              }
              type="success"
              showIcon={false}
              style={{ marginBottom: 24 }}
            />

            <Row gutter={12}>
              <Col span={12}>
                <Button onClick={prevStep} block>
                  上一步
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  type="primary"
                  onClick={handleSubmit} // 修改这里
                  loading={loading}
                  block
                  icon={<CheckCircleOutlined />}
                >
                  {loading ? "注册中..." : "完成注册"}
                </Button>
              </Col>
            </Row>
          </div>
        </Form>

        {/* 测试功能按钮 */}
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Button type="link" size="small" onClick={fillTestAccount}>
            快速填充测试数据
          </Button>
        </div>

        <LoginLink>
          已有账号？
          <Link to="/login">立即登录</Link>
        </LoginLink>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;