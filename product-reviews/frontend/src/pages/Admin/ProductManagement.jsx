// src/pages/Admin/ProductManagement.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ✅ Lùi 2 cấp đến src/, sau đó vào context/
import { useAuth } from '../../context/AuthContext'; 

// ✅ IMPORT HEADER MỚI
import Header from '../../components/Header'; 

// ✅ IMPORT FORM MỚI
// Giả sử ProductForm.jsx nằm cùng cấp trong thư mục Admin
import ProductForm from './ProductForm'; 

// Giả định BASE_URL là 'http://localhost:4000'
const BASE_URL = 'http://localhost:4000';
const API_URL = `${BASE_URL}/api/products`;

// ⭐ HÀM getImageUrl ĐÃ ĐƯỢC ĐỊNH NGHĨA LẠI ⭐
// Chuyển đổi đường dẫn ảnh trong DB thành URL hiển thị
const getImageUrl = (imagePath) => {
    // Nếu không có đường dẫn ảnh, trả về placeholder
    if (!imagePath) return "https://via.placeholder.com/60x60?text=No+Image"; 
    
    // Nếu đường dẫn là cục bộ (bắt đầu bằng '/uploads/'), thêm BASE_URL
    if (imagePath.startsWith('/uploads/')) {
        return `${BASE_URL}${imagePath}`;
    }
    // Nếu là URL đầy đủ (http/https), trả về nguyên trạng
    return imagePath;
};

const ProductManagement = () => {
  const { getToken } = useAuth(); 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // ⭐ State để quản lý form ⭐
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // === Lấy danh sách sản phẩm ===
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
        // Lấy danh sách sản phẩm (Public endpoint)
        const response = await axios.get(API_URL);
        setProducts(response.data);
    } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);
        setError("Không thể tải danh sách sản phẩm.");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // === Xử lý Form ===
  const handleAddProduct = () => {
    setSelectedProduct(null); // Đặt null để mở form Thêm mới
    setIsFormOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product); // Đặt sản phẩm để mở form Cập nhật
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedProduct(null);
  };

  const handleSaveSuccess = () => {
    handleCloseForm();
    fetchProducts(); // Tải lại danh sách sau khi lưu
  };

  // === Xóa sản phẩm ===
  const deleteProduct = async (productId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) return;

    const token = getToken();
    if (!token) {
        alert("Bạn chưa đăng nhập hoặc phiên đã hết hạn.");
        return;
    }

    try {
        await axios.delete(`${API_URL}/${productId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchProducts(); // Tải lại danh sách sau khi xóa
    } catch (err) {
        console.error("Lỗi xóa sản phẩm:", err.response?.data || err);
        alert(`Lỗi xóa sản phẩm: ${err.response?.data?.error || 'Không xác định'}`);
    }
  };

  if (loading) return <p>Đang tải danh sách sản phẩm...</p>;
  if (error) return <p style={{ color: 'red' }}>Lỗi: {error}</p>;

  return (
    <> 
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>Quản Lý Sản Phẩm</h1>

            <button 
                onClick={handleAddProduct} 
                disabled={isFormOpen} 
                style={{ 
                    padding: '10px 15px', 
                    backgroundColor: '#2ecc71', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    marginBottom: '20px'
                }}
            >
                Thêm Sản Phẩm Mới
            </button>

            {/* ⭐ Form Thêm/Sửa Sản Phẩm ⭐ */}
            {isFormOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100 }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
                        <ProductForm 
                            product={selectedProduct} 
                            onClose={handleCloseForm} 
                            onSaveSuccess={handleSaveSuccess} 
                        />
                    </div>
                </div>
            )}

            {/* Bảng danh sách sản phẩm */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#333', color: 'white' }}>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Ảnh</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Tên Sản Phẩm</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Giá</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Danh mục</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((p) => (
                        <tr key={p._key} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                <img
                                    src={
                                        // ⭐ Lấy phần tử đầu tiên từ mảng 'images' và dùng hàm chuyển đổi URL ⭐
                                        p.images && p.images.length > 0 
                                            ? getImageUrl(p.images[0]) 
                                            : "https://via.placeholder.com/60x60?text=No+Image" // Placeholder
                                    }
                                    alt={p.name}
                                    style={{ 
                                        width: '60px', 
                                        height: '60px', 
                                        objectFit: 'cover', 
                                        borderRadius: '4px',
                                    }}
                                />
                            </td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{p.name}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{p.price?.toLocaleString('vi-VN')} VNĐ</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{p.category}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                {/* Cập nhật nút Sửa */}
                                <button 
                                    onClick={() => handleEditProduct(p)} 
                                    disabled={isFormOpen} 
                                    style={{ marginRight: '10px', padding: '5px 10px', backgroundColor: '#f39c12', color: 'white', border: 'none', cursor: 'pointer' }}
                                >
                                    Sửa
                                </button>
                                <button 
                                    onClick={() => deleteProduct(p._key)} 
                                    disabled={isFormOpen}
                                    style={{ padding: '5px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', cursor: 'pointer' }}
                                >
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </>
  );
};

export default ProductManagement;