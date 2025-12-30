// src/utils/cart.js
import api from './api'; // Axios instance với token

export const getCart = async () => {
  try {
    const response = await api.get('/cart');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get cart error:', error);
    return { success: false, error: error.response?.data?.message || 'Lỗi lấy giỏ hàng' };
  }
};

export const updateCartItemApi = async (productId, newQuantity) => {
    // URL: khớp với router.put('/item/:productId')
    // Body: khớp với const { quantity } = req.body
    const url = `/cart/item/${productId}`; 
    const body = { quantity: newQuantity };

    const response = await api.put(url, body);
    return response; // Axios thường trả về data trong response.data
};

export const removeCartItem = async (productId) => {
  try {
    const response = await api.delete(`/cart/item/${productId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Remove cart error:', error);
    return { success: false, error: error.response?.data?.message || 'Lỗi xóa' };
  }
};