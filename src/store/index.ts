import { useAuthStore } from './modules/auth';
import { useHotelStore } from './modules/hotel';

// 统一导出store
export { useAuthStore, useHotelStore };

// 导出类型
export type { User } from './modules/auth';