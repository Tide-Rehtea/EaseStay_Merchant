import { z } from 'zod';

// ==================== 通用Schema ====================

// 分页参数
export const reqPaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

// 房型
export const roomTypeSchema = z.object({
  type: z.string().min(1, '房型名称不能为空'),
  price: z.number().min(0, '价格不能为负数'),
  facilities: z.array(z.string()).optional(),
  description: z.string().optional(),
});

// ==================== 酒店请求Schema ====================

// 创建/更新酒店
export const reqHotelCreateSchema = z.object({
  name: z.string().min(1, '酒店名称不能为空').max(200),
  name_en: z.string().optional(),
  address: z.string().min(1, '地址不能为空'),
  star: z.number().min(1).max(5),
  room_type: z.array(roomTypeSchema).min(1, '至少需要一个房型'),
  price: z.number().min(0),
  open_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式应为YYYY-MM-DD'),
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).optional(),
  facilities: z.array(z.string()).optional(),
  nearby_attractions: z.string().optional(),
  discount: z.number().min(0).max(1).optional(),
  discount_description: z.string().optional(),
});

// 查询参数
export const reqHotelQuerySchema = reqPaginationSchema.extend({
  status: z.enum(['pending', 'approved', 'rejected', 'offline']).optional(),
  merchant_id: z.number().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

// 审核请求
export const reqReviewHotelSchema = z.object({
  action: z.enum(['approve', 'reject']),
  reject_reason: z.string().optional(),
}).refine(
  (data) => !(data.action === 'reject' && !data.reject_reason),
  {
    message: '拒绝审核时必须提供原因',
    path: ['reject_reason'],
  }
);

// 发布/下线请求
export const reqToggleHotelSchema = z.object({
  action: z.enum(['publish', 'unpublish']),
});

// ==================== 酒店响应Schema ====================

// 酒店信息
export const resHotelSchema = z.object({
  id: z.number(),
  name: z.string(),
  name_en: z.string().nullable(),
  address: z.string(),
  star: z.number(),
  room_type: z.array(roomTypeSchema),
  price: z.number(),
  open_date: z.string(),
  images: z.array(z.string()),
  tags: z.array(z.string()).nullable(),
  facilities: z.array(z.string()).nullable(),
  nearby_attractions: z.string().nullable(),
  discount: z.number().nullable(),
  discount_description: z.string().nullable(),
  status: z.enum(['pending', 'approved', 'rejected', 'offline']),
  reject_reason: z.string().nullable(),
  merchant_id: z.number(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  merchant: z.object({
    id: z.number(),
    email: z.string(),
  }).optional(),
});

// 酒店列表响应
export const resHotelListResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    hotels: z.array(resHotelSchema),
    pagination: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      pages: z.number(),
    }),
  }),
});

// 单个酒店响应
export const resHotelResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    hotel: resHotelSchema,
  }),
});

// 统计响应
export const resStatisticsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    total_hotels: z.number(),
    pending_hotels: z.number(),
    approved_hotels: z.number(),
    total_merchants: z.number(),
  }),
});

// ==================== 类型导出 ====================

// 请求类型
export type ReqHotelCreate = z.infer<typeof reqHotelCreateSchema>;
export type ReqHotelQuery = z.infer<typeof reqHotelQuerySchema>;
export type ReqReviewHotel = z.infer<typeof reqReviewHotelSchema>;
export type ReqToggleHotel = z.infer<typeof reqToggleHotelSchema>;

// 响应类型
export type ResHotel = z.infer<typeof resHotelSchema>;
export type ResHotelListResponse = z.infer<typeof resHotelListResponseSchema>;
export type ResHotelResponse = z.infer<typeof resHotelResponseSchema>;
export type ResStatisticsResponse = z.infer<typeof resStatisticsResponseSchema>;