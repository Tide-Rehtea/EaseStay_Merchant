import { create } from 'zustand';
import type { ResHotel } from '@api/types';

interface HotelStoreState {
  // 筛选状态
  filters: {
    status?: string;
    page: number;
    limit: number;
    search?: string;
  };
  
  // Actions
  setFilters: (filters: Partial<HotelStoreState['filters']>) => void;
  resetFilters: () => void;
}

export const useHotelStore = create<HotelStoreState>((set) => ({
  filters: {
    status: undefined,
    page: 1,
    limit: 10,
    search: undefined,
  },
  
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
    
  resetFilters: () =>
    set({
      filters: {
        status: undefined,
        page: 1,
        limit: 10,
        search: undefined,
      },
    }),
}));