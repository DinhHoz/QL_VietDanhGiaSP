import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
// Giả định component Header nằm ở '../components/Hader'
import Header from '../../components/Header'; // ĐÚNG
// Component Layout cơ bản (để giữ bố cục khi loading/error)
const Layout = ({ children }) => {
    // Lưu ý: Bạn nên thay thế Header bằng component Header thực tế của mình
    return (
        <>
            <header style={{ padding: '10px 20px', borderBottom: '1px solid #ccc', backgroundColor: '#f4f4f4' }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Header App</p>
            </header>
            <main style={{ padding: '20px' }}>
                {children}
            </main>
        </>
    );
};

/**
 * Component bảo vệ route Admin.
 * - Kiểm tra: Đã đăng nhập chưa? Có phải là Admin không?
 * - Nếu không thỏa mãn, chuyển hướng hoặc hiển thị thông báo lỗi.
 */
const ProtectedAdminRoute = () => {
    const { isAuthenticated, isAdmin, isLoading } = useAuth();

    // 1. Đang tải (kiểm tra token)
    if (isLoading) {
        return <Layout>
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                        Đang kiểm tra quyền truy cập...
                    </div>
               </Layout>;
    }

    // 2. Chưa đăng nhập -> Chuyển hướng đến trang đăng nhập/đăng ký (route gốc)
    if (!isAuthenticated) {
        // SỬA ĐỔI: Chuyển hướng đến route gốc (/)
        return <Navigate to="/" replace />;
    }
    
    // 3. Đã đăng nhập nhưng không phải Admin -> Hiển thị lỗi từ chối truy cập
    if (!isAdmin) {
        return <Layout>
                    <div style={{ 
                        backgroundColor: '#fdd', 
                        padding: '20px', 
                        borderRadius: '8px',
                        border: '1px solid red'
                    }}>
                        <h1 style={{ color: 'red', marginTop: 0 }}>🚫 Truy Cập Bị Từ Chối</h1>
                        <p>Tài khoản của bạn không có quyền quản trị để xem trang này.</p>
                        <Navigate to="/" replace />
                    </div>
               </Layout>;
    }

    // 4. Nếu là Admin, cho phép các route con được render
    // <Outlet /> sẽ render component con đã được định nghĩa trong App.jsx (ví dụ: ProductManagement)
    return <Outlet />;
};

export default ProtectedAdminRoute;
