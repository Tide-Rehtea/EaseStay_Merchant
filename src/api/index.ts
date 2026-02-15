import authApi from './modules/auth';
import {
  hotelApi,
  adminApi
} from './modules/hotel';
import uploadApi from './modules/upload';

// 统一API接口
export const api = {
  auth: authApi,
  hotel: hotelApi,
  admin: adminApi,
  upload: uploadApi
};

// 类型导出
export type {
  // 认证相关类型
  ReqLogin,
  ReqRegister,
  ResAuthResponse,
  ResUser,

  // 酒店相关类型
  ReqHotelCreate,
  ReqHotelQuery,
  ReqReviewHotel,
  ReqToggleHotel,
  ResHotel,
  ResHotelListResponse,
  ResHotelResponse,
  ResStatisticsResponse,
  ResUploadResponse,
  ResUploadMultipleResponse
} from './types';

// 请求函数导出
export { validatedRequest } from './request';

export default api;