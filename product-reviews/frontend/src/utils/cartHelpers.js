// src/utils/addToCart.js
import api from './api'; 
import { useNavigate } from 'react-router-dom'; 
import Swal from 'sweetalert2'; 
import { useAuth } from '../context/AuthContext';

// Cấu hình Toast
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  // ⭐ SỬA 1: Thêm logic set z-index vào didOpen của Toast
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
    
    // Ép z-index của container Toast lên cao nhất
    const container = Swal.getContainer();
    if (container) {
        container.style.zIndex = '99999';
    }
  }
});

// 1. Hàm thuần: Gọi API
export const addToCartAPI = async (productId, quantity = 1) => {
  try {
    if (!productId) throw new Error('productId là bắt buộc');
    if (quantity < 1) throw new Error('Số lượng phải >= 1');

    const response = await api.post('/cart/add', { productId, quantity });
    return { success: true, data: response.data.cart };
  } catch (error) {
    console.error('Add to cart error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Lỗi kết nối server' 
    };
  }
};

// 2. Hook: Dùng trong Component
export const useAddToCart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAddToCart = async (productId, quantity = 1, onSuccess) => {
    // Check Login
    if (!user) {
      Swal.fire({
        title: 'Bạn chưa đăng nhập',
        text: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#000',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Đăng nhập ngay',
        cancelButtonText: 'Để sau',
        // ⭐ SỬA 2: Thêm z-index cho Modal cảnh báo Login
        didOpen: () => {
            const container = Swal.getContainer();
            if (container) container.style.zIndex = '99999';
        }
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }

    // Gọi API
    const result = await addToCartAPI(productId, quantity);

    if (result.success) {
      Toast.fire({
        icon: 'success',
        title: 'Đã thêm vào giỏ hàng'
      });
      
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(result.data);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: result.error,
        confirmButtonColor: '#000',
        // ⭐ SỬA 3: Thêm z-index cho Modal Lỗi (phòng khi lỗi hiện trên 1 modal khác)
        didOpen: () => {
            const container = Swal.getContainer();
            if (container) container.style.zIndex = '99999';
        }
      });
    }
  };

  return handleAddToCart;
};