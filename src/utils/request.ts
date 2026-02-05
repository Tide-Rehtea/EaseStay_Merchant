import axios from 'axios';
import { type ZodType, ZodError } from 'zod';
import { message } from 'antd';

// 创建 axios 实例
const request = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const data = response.data;
    
    // 检查业务错误
    if (data && data.success === false) {
      const errorMsg = data.message || '请求失败';
      message.error(errorMsg);
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      return Promise.reject(new Error(errorMsg));
    }
    
    return data;
  },
  (error) => {
    const errorMessage = error.response?.data?.message || error.message || '请求失败';
    message.error(errorMessage);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// ✅ 修复：使用正确的 ZodError 处理方法
export const validatedRequest = <TReq, TRes>(
  reqSchema?: ZodType<TReq>,
  resSchema?: ZodType<TRes>
) => {
  return async (config: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    data?: any;
    params?: any;
  }) => {
    try {
      // 验证请求数据
      if (reqSchema) {
        if (config.method === 'GET' || config.method === 'DELETE') {
          config.params = reqSchema.parse(config.params ?? {});
        } else {
          config.data = reqSchema.parse(config.data ?? {});
        }
      }

      // 发送请求
      const response = await request(config);
      
      // 验证响应数据
      if (resSchema) {
        return resSchema.parse(response);
      }
      
      return response;
    } catch (error) {
      // ✅ 修复：使用正确的 ZodError 属性访问方式
      if (error instanceof ZodError) {
        console.error('❌ Zod验证错误:', error);
        
        // 方法1：使用 issues 属性（推荐）
        const issues = (error as any).issues || [];
        const errorMessages = issues.map((issue: any) => 
          `${issue.path?.join('.') || '数据'}: ${issue.message}`
        ).join(', ');
        
        // 方法2：使用 toString() 方法
        const errorMsg = errorMessages || error.toString();
        message.error(`数据验证失败: ${errorMsg}`);
      }
      throw error;
    }
  };
};

export default request;