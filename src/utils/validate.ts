// 验证邮箱
export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// 验证手机号
export const validatePhone = (phone: string): boolean => {
  const re = /^1[3-9]\d{9}$/;
  return re.test(phone);
};

// 验证密码强度
export const checkPasswordStrength = (password: string): {
  score: number;
  strength: 'weak' | 'medium' | 'strong';
} => {
  let score = 0;
  
  // 长度
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 25;
  
  // 包含小写字母
  if (/[a-z]/.test(password)) score += 20;
  
  // 包含大写字母
  if (/[A-Z]/.test(password)) score += 20;
  
  // 包含数字
  if (/\d/.test(password)) score += 20;
  
  // 包含特殊字符
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 20;
  
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 60) strength = 'medium';
  if (score >= 80) strength = 'strong';
  
  return { score, strength };
};