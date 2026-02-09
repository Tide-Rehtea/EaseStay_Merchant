import { useState, useCallback } from 'react';
import { message } from 'antd';
import { api } from '@api';
import type { ReqHotelCreate, ReqHotelQuery } from '@api/types';

export const useHotel = () => {
  const [loading, setLoading] = useState(false);

  // 获取酒店列表
  const fetchHotels = useCallback(async (params?: ReqHotelQuery) => {
    setLoading(true);
    try {
      const response = await api.hotel.getMyHotels(params);
      return response.data;
    } catch (error) {
      console.error('获取酒店列表失败:', error);
      message.error('获取酒店列表失败');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // 创建酒店
  const createHotel = useCallback(async (data: ReqHotelCreate) => {
    setLoading(true);
    try {
      const response = await api.hotel.create(data);
      message.success('酒店创建成功');
      return response.data.hotel;
    } catch (error) {
      console.error('创建酒店失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // 更新酒店
  const updateHotel = useCallback(async (id: number, data: Partial<ReqHotelCreate>) => {
    setLoading(true);
    try {
      const response = await api.hotel.update(id, data);
      message.success('酒店更新成功');
      return response.data.hotel;
    } catch (error) {
      console.error('更新酒店失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // 删除酒店
  const deleteHotel = useCallback(async (id: number) => {
    setLoading(true);
    try {
      await api.hotel.delete(id);
      message.success('酒店删除成功');
    } catch (error) {
      console.error('删除酒店失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取酒店详情
  const fetchHotelDetail = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const response = await api.hotel.getById(id);
      return response.data.hotel;
    } catch (error) {
      console.error('获取酒店详情失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    fetchHotels,
    createHotel,
    updateHotel,
    deleteHotel,
    fetchHotelDetail,
  };
};