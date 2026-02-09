import { z } from 'zod';

// ==================== 请求Schema ====================

// 登录请求
export const reqLoginSchema = z.object({
  email: z.string()
    .min(1, '请输入邮箱')
    .email('请输入有效的邮箱地址'),
  password: z.string()
    .min(1, '请输入密码')
    .min(6, '密码至少6位字符'),
  remember: z.boolean().optional(),
});

// 注册请求
export const reqRegisterSchema = z.object({
  email: z.string()
    .min(1, '请输入邮箱')
    .email('请输入有效的邮箱地址'),
  password: z.string()
    .min(1, '请输入密码')
    .min(6, '密码至少6位字符')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, '密码必须包含字母和数字'),
  role: z.enum(['merchant', 'admin']).default('merchant'),
  confirmPassword: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
});

// ==================== 响应Schema ====================

// 用户信息
export const resUserSchema = z.object({
  id: z.number(),
  email: z.string(),
  role: z.enum(['merchant', 'admin']),
  created_at: z.string().datetime(),
});

// 认证响应
export const resAuthResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.object({
    user: resUserSchema,
    token: z.string(),
  }),
});

// 用户资料响应
export const resProfileResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    user: resUserSchema,
  }),
});

// ==================== 类型导出 ====================

// 请求类型
export type ReqLogin = z.infer<typeof reqLoginSchema>;
export type ReqRegister = z.infer<typeof reqRegisterSchema>;

// 响应类型
export type ResAuthResponse = z.infer<typeof resAuthResponseSchema>;
export type ResUser = z.infer<typeof resUserSchema>;
export type ResProfileResponse = z.infer<typeof resProfileResponseSchema>;