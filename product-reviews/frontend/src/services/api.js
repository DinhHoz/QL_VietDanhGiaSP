// src/services/api.js (Logic PHẢI CÓ)
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:4000/api", // Thay đổi nếu cần
  headers: { "Content-Type": "application/json" },
});

// ⭐ Interceptor: Tự động đính kèm Token ⭐
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwtToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tùy chọn: Xử lý lỗi 401 tự động logout
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Nếu server báo 401, token có thể hết hạn/không hợp lệ
      console.warn("Phiên đăng nhập hết hạn. Tự động đăng xuất.");
      // Chuyển hướng đến trang đăng nhập (Cần dùng window.location hoặc thư viện khác)
      // localStorage.removeItem('jwtToken');
      // localStorage.removeItem('user');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
