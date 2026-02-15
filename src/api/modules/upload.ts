import { validatedRequest } from '../request';
import {
  resUploadResponseSchema,
  resUploadMultipleResponseSchema,
  type ResUploadResponse,
  type ResUploadMultipleResponse,
} from '../types/hotel';

enum API {
  UPLOAD_IMAGE = '/upload/image',
  UPLOAD_IMAGES = '/upload/images',
  DELETE_IMAGE = '/upload/image',
  HOTEL_IMAGES = '/upload/hotel',
}

// 上传单张图片
export const reqUploadImage = (file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  return validatedRequest<void, ResUploadResponse>(
    undefined,
    resUploadResponseSchema
  )({
    method: 'POST',
    url: API.UPLOAD_IMAGE,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 上传多张图片
export const reqUploadImages = (files: File[]) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });

  return validatedRequest<void, ResUploadMultipleResponse>(
    undefined,
    resUploadMultipleResponseSchema
  )({
    method: 'POST',
    url: API.UPLOAD_IMAGES,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 删除图片
export const reqDeleteImage = (filename: string) => 
  validatedRequest<void, { success: boolean; message: string }>(
    undefined,
    undefined
  )({
    method: 'DELETE',
    url: `${API.DELETE_IMAGE}/${filename}`,
  });

// 获取酒店图片
export const reqGetHotelImages = (hotelId: number) =>
  validatedRequest<void, ResUploadMultipleResponse>(
    undefined,
    resUploadMultipleResponseSchema
  )({
    method: 'GET',
    url: `${API.HOTEL_IMAGES}/${hotelId}/images`,
  });

export const uploadApi = {
  uploadImage: reqUploadImage,
  uploadImages: reqUploadImages,
  deleteImage: reqDeleteImage,
  getHotelImages: reqGetHotelImages,
};

export default uploadApi;