import axios, { type AxiosRequestConfig } from 'axios';
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

// 验证请求函数
export const validatedRequest = <TReq, TRes>(
  reqSchema?: ZodType<TReq>,
  resSchema?: ZodType<TRes>
) => {
  return (config: AxiosRequestConfig & {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: TReq;
    params?: TReq;
    showSuccess?: boolean;
    successMessage?: string;
  }) => {
    return new Promise<TRes>((resolve, reject) => {
      // 验证请求数据
      if (reqSchema) {
        try {
          if (config.method === 'GET' || config.method === 'DELETE') {
            config.params = reqSchema.parse(config.params ?? {});
          } else {
            config.data = reqSchema.parse(config.data ?? {});
          }
        } catch (error) {
          if (error instanceof ZodError) {
            console.error('❌ 请求数据验证错误:', error);
            const issues = (error as any).issues || [];
            const errorMsg = issues.map((issue: any) => 
              `${issue.path?.join('.') || '数据'}: ${issue.message}`
            ).join(', ');
            message.error(`请求数据错误: ${errorMsg}`);
          }
          reject(error);
          return;
        }
      }

      // 发送请求
      request(config)
        .then(async (response) => {
          try {
            // 验证响应数据
            let result: TRes;
            if (resSchema) {
              result = resSchema.parse(response);
            } else {
              result = response as TRes;
            }

            // 显示成功消息
            if (config.showSuccess && config.successMessage) {
              message.success(config.successMessage);
            }

            resolve(result);
          } catch (error) {
            if (error instanceof ZodError) {
              console.error('❌ 响应数据验证错误:', error);
              const issues = (error as any).issues || [];
              const errorMsg = issues.map((issue: any) => 
                `${issue.path?.join('.') || '数据'}: ${issue.message}`
              ).join(', ');
              message.error(`响应数据错误: ${errorMsg}`);
            }
            reject(error);
          }
        })
        .catch(reject);
    });
  };
};

export default request;