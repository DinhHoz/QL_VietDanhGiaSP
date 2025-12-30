// // src/components/AdminRoute.jsx
// import React from 'react';
// import { Navigate, Outlet } from 'react-router-dom';
// // Giả định bạn có AuthContext để lấy thông tin user
// import { useAuth } from '../context/AuthContext'; 

// const AdminRoute = () => {
//   const { user, isAuthenticated, isLoading } = useAuth();

//   if (isLoading) {
//     // Hiển thị loading trong khi kiểm tra trạng thái đăng nhập
//     return <div>Đang tải...</div>;
//   }

//   // Nếu chưa đăng nhập, chuyển hướng đến trang login
//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   // Nếu không phải admin, chuyển hư trớng đến trang chủ hoặcang lỗi 403
//   if (user && user.role !== 'admin') {
//     return <Navigate to="/" replace />; // Hoặc /403
//   }

//   // Nếu là admin, cho phép truy cập route con
//   return <Outlet />;
// };

// export default AdminRoute;