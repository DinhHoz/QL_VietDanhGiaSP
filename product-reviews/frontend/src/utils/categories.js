// src/utils/categories.js (Create this file to fix the import error)
import api from './api'; // Axios instance from your utils/api (adjust if path different)

export const getCategories = async () => {
  try {
    const res = await api.get('/categories'); // Backend endpoint for categories
    return {
      success: true,
      data: Array.isArray(res.data) ? res.data : res.data.categories || [],
    };
  } catch (error) {
    console.error('Lỗi fetch categories:', error);
    return { success: false, error: error.response?.data?.msg || 'Không thể tải danh mục.' };
  }
};