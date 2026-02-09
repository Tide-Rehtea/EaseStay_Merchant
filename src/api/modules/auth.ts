import { validatedRequest } from '../request';
import {
  // 请求Schema
  reqLoginSchema,
  reqRegisterSchema,
  
  // 响应Schema
  resAuthResponseSchema,
  resProfileResponseSchema
} from '../types';

import type {
  // 类型
  ReqLogin,
  ReqRegister,
  ResAuthResponse,
  ResProfileResponse,
} from '../types';

// API 路径
const API = {
  // 认证相关
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PROFILE: '/auth/profile',
}

// 用户登录
export const reqLogin = (data: ReqLogin) => 
  validatedRequest<ReqLogin, ResAuthResponse>(
    reqLoginSchema,
    resAuthResponseSchema
  )({
    method: 'POST',
    url: API.LOGIN,
    data,
    showSuccess: true,
    successMessage: '登录成功！',
  });

// 用户注册
export const reqRegister = (data: ReqRegister) => 
  validatedRequest<ReqRegister, ResAuthResponse>(
    reqRegisterSchema,
    resAuthResponseSchema
  )({
    method: 'POST',
    url: API.REGISTER,
    data,
    showSuccess: true,
    successMessage: '注册成功！',
  });

// 获取用户资料
export const reqProfile = () => 
  validatedRequest<void, ResProfileResponse>(
    undefined,
    resProfileResponseSchema
  )({
    method: 'GET',
    url: API.PROFILE,
  });

// 认证API模块
export const authApi = {
  login: reqLogin,
  register: reqRegister,
  profile: reqProfile,
};

export default authApi;