import React from 'react';
import { Progress, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const StrengthContainer = styled.div`
  margin-top: 8px;
`;

const StrengthHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  
  .strength-label {
    font-size: 12px;
    color: #666;
  }
`;

const Requirements = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: #f6f6f6;
  border-radius: 6px;
  
  .requirement {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
    font-size: 12px;
    
    &.met {
      color: #52c41a;
    }
    
    &.unmet {
      color: #999;
    }
  }
`;

interface PasswordStrengthProps {
  password: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  // 检查各项条件
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  // 计算分数
  const calculateScore = () => {
    let score = 0;
    const weight = 20; // 每项20分
    
    Object.values(checks).forEach(check => {
      if (check) score += weight;
    });
    
    return Math.min(score, 100);
  };

  const score = calculateScore();
  
  // 获取强度等级
  const getStrengthLevel = () => {
    if (score >= 80) return { text: '强', color: '#52c41a' };
    if (score >= 60) return { text: '中', color: '#faad14' };
    return { text: '弱', color: '#ff4d4f' };
  };

  const level = getStrengthLevel();

  const requirements = [
    { key: 'length', label: '至少8个字符', met: checks.length },
    { key: 'lowercase', label: '包含小写字母', met: checks.lowercase },
    { key: 'uppercase', label: '包含大写字母', met: checks.uppercase },
    { key: 'number', label: '包含数字', met: checks.number },
    { key: 'special', label: '包含特殊字符', met: checks.special },
  ];

  return (
    <StrengthContainer>
      <StrengthHeader>
        <span className="strength-label">密码强度</span>
        <span style={{ color: level.color, fontWeight: 500 }}>
          {level.text}
          <Tooltip title="密码强度越高，账户越安全">
            <InfoCircleOutlined style={{ marginLeft: 4, color: '#999' }} />
          </Tooltip>
        </span>
      </StrengthHeader>
      
      <Progress 
        percent={score} 
        showInfo={false}
        strokeColor={level.color}
        size="small"
      />
      
      <Requirements>
        {requirements.map(req => (
          <div 
            key={req.key} 
            className={`requirement ${req.met ? 'met' : 'unmet'}`}
          >
            {req.met ? '✓' : '○'} {req.label}
          </div>
        ))}
      </Requirements>
    </StrengthContainer>
  );
};

export default PasswordStrength;