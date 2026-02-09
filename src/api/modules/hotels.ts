import { validatedRequest } from '../request';
import {
  // 请求Schema
  reqHotelCreateSchema,
  reqHotelQuerySchema,
  reqReviewHotelSchema,
  reqToggleHotelSchema,
  
  // 响应Schema
  resHotelListResponseSchema,
  resHotelResponseSchema,
  resStatisticsResponseSchema,
} from '../types';

import type {
  // 类型
  ReqHotelCreate,
  ReqHotelQuery,
  ReqReviewHotel,
  ReqToggleHotel,
  ResHotelListResponse,
  ResHotelResponse,
  ResStatisticsResponse,
} from '../types';

// API 路径
const API = {
  // 酒店管理
  HOTELS: '/hotels',
  MY_HOTELS: '/hotels/my-hotels',
  HOTEL_BY_ID: '/hotels/:id',
  
  // 管理员相关
  PENDING_HOTELS: '/admin/hotels/pending',
  REVIEW_HOTEL: '/admin/hotels/:id/review',
  TOGGLE_HOTEL: '/admin/hotels/:id/toggle',
  ALL_HOTELS: '/admin/hotels',
  STATISTICS: '/admin/statistics',
}

// ==================== 商户API ====================

// 创建酒店
export const reqCreateHotel = (data: ReqHotelCreate) =>
  validatedRequest<ReqHotelCreate, ResHotelResponse>(
    reqHotelCreateSchema,
    resHotelResponseSchema
  )({
    method: 'POST',
    url: API.HOTELS,
    data,
    showSuccess: true,
    successMessage: '酒店创建成功，等待审核',
  });

// 获取我的酒店列表
export const reqGetMyHotels = (params?: ReqHotelQuery) =>
  validatedRequest<ReqHotelQuery, ResHotelListResponse>(
    reqHotelQuerySchema,
    resHotelListResponseSchema
  )({
    method: 'GET',
    url: API.MY_HOTELS,
    params,
  });

// 获取酒店详情
export const reqGetHotelById = (id: number) =>
  validatedRequest<void, ResHotelResponse>(
    undefined,
    resHotelResponseSchema
  )({
    method: 'GET',
    url: API.HOTEL_BY_ID.replace(':id', id.toString()),
  });

// 更新酒店
export const reqUpdateHotel = (id: number, data: Partial<ReqHotelCreate>) =>
  validatedRequest<Partial<ReqHotelCreate>, ResHotelResponse>(
    reqHotelCreateSchema.partial(),
    resHotelResponseSchema
  )({
    method: 'PUT',
    url: API.HOTEL_BY_ID.replace(':id', id.toString()),
    data,
    showSuccess: true,
    successMessage: '酒店更新成功',
  });

// 删除酒店
export const reqDeleteHotel = (id: number) =>
  validatedRequest<void, { success: boolean; message: string }>(
    undefined,
    undefined // 不验证响应
  )({
    method: 'DELETE',
    url: API.HOTEL_BY_ID.replace(':id', id.toString()),
    showSuccess: true,
    successMessage: '酒店删除成功',
  });

// ==================== 管理员API ====================

// 获取待审核酒店列表
export const reqGetPendingHotels = (params?: ReqHotelQuery) =>
  validatedRequest<ReqHotelQuery, ResHotelListResponse>(
    reqHotelQuerySchema,
    resHotelListResponseSchema
  )({
    method: 'GET',
    url: API.PENDING_HOTELS,
    params,
  });

// 审核酒店
export const reqReviewHotel = (id: number, data: ReqReviewHotel) =>
  validatedRequest<ReqReviewHotel, { success: boolean; message: string }>(
    reqReviewHotelSchema,
    undefined
  )({
    method: 'POST',
    url: API.REVIEW_HOTEL.replace(':id', id.toString()),
    data,
    showSuccess: true,
    successMessage: '审核操作成功',
  });

// 发布/下线酒店
export const reqToggleHotel = (id: number, data: ReqToggleHotel) =>
  validatedRequest<ReqToggleHotel, { success: boolean; message: string }>(
    reqToggleHotelSchema,
    undefined
  )({
    method: 'POST',
    url: API.TOGGLE_HOTEL.replace(':id', id.toString()),
    data,
    showSuccess: true,
    successMessage: '操作成功',
  });

// 获取所有酒店
export const reqGetAllHotels = (params?: ReqHotelQuery) =>
  validatedRequest<ReqHotelQuery, ResHotelListResponse>(
    reqHotelQuerySchema,
    resHotelListResponseSchema
  )({
    method: 'GET',
    url: API.ALL_HOTELS,
    params,
  });

// 获取统计数据
export const reqGetStatistics = () =>
  validatedRequest<void, ResStatisticsResponse>(
    undefined,
    resStatisticsResponseSchema
  )({
    method: 'GET',
    url: API.STATISTICS,
  });

// ==================== API 模块导出 ====================

// 商户API
export const hotelApi = {
  create: reqCreateHotel,
  getMyHotels: reqGetMyHotels,
  getById: reqGetHotelById,
  update: reqUpdateHotel,
  delete: reqDeleteHotel,
};

// 管理员API
export const adminApi = {
  getPendingHotels: reqGetPendingHotels,
  reviewHotel: reqReviewHotel,
  toggleHotel: reqToggleHotel,
  getAllHotels: reqGetAllHotels,
  getStatistics: reqGetStatistics,
};

export default {
  hotel: hotelApi,
  admin: adminApi,
};