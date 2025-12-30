// src/components/Admin/ProductForm.jsx (ĐÃ XÁC NHẬN LOGIC ĐỌC VÀ GỬI 1 ẢNH TRONG MẢNG)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext.jsx'; 

// Giả định API endpoint
const API_URL = 'http://localhost:4000/api/products';

// Nhận product (nếu có) và callback để đóng form/tải lại dữ liệu
const ProductForm = ({ product = null, onClose, onSaveSuccess }) => {
    // Khởi tạo state
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState(''); 
    
    // ⭐ STATE MỚI: Tách biệt File và URL ⭐
    const [selectedFile, setSelectedFile] = useState(null); // File object
    const [imageUrl, setImageUrl] = useState('');         // URL string - chứa ảnh cũ hoặc URL mới
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [category, setCategory] = useState('');

    const { getToken } = useAuth();
    const isEditing = !!product; 
    
    // Cập nhật state khi prop 'product' thay đổi
    useEffect(() => {
        if (product) {
            setName(product.name || '');
            setPrice(product.price || '');
            setDescription(product.description || ''); 
            setCategory(product.category || '');
            
            // ⭐ ĐÃ SỬA: Lấy URL/đường dẫn ảnh cũ từ DB từ trường 'images' ⭐
            if (product.images && product.images.length > 0) {
                // Lấy phần tử đầu tiên
                setImageUrl(product.images[0] || ''); 
            } else {
                setImageUrl('');
            }
        } else {
            // Reset cho chế độ thêm mới
            setName('');
            setPrice('');
            setDescription('');
            setCategory('');
            setImageUrl('');
        }
        setSelectedFile(null); // Luôn reset file đã chọn
        setError(null);
    }, [product]);

    // Xử lý thay đổi file
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
        // Khi chọn file, xóa URL để ưu tiên upload
        setImageUrl(''); 
    };

    // Xử lý Submit Form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const token = getToken();
        if (!token) {
            setError('Bạn chưa đăng nhập hoặc phiên đã hết hạn.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('description', description);
        formData.append('category', category);

        // ⭐ LOGIC XỬ LÝ 1 ẢNH: Ưu tiên File Upload (trường 'image') hoặc gửi URL/string rỗng (trường 'imageUrl') ⭐
        if (selectedFile) {
            // Gửi file upload (Backend sẽ xử lý req.file)
            formData.append('image', selectedFile); 
        } else {
            // Gửi URL hiện tại (có thể là URL cũ, URL mới, hoặc string rỗng nếu người dùng xóa)
            formData.append('imageUrl', imageUrl); 
        }

        try {
            const url = isEditing ? `${API_URL}/${product._key}` : API_URL;
            const method = isEditing ? 'PUT' : 'POST';

            await axios({
                method,
                url,
                data: formData, // Dùng formData để gửi cả text và file
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // KHÔNG cần 'Content-Type': 'multipart/form-data' vì axios sẽ tự thêm
                },
            });

            onSaveSuccess();
        } catch (err) {
            console.error('Lỗi khi lưu sản phẩm:', err.response?.data || err);
            setError(err.response?.data?.error || 'Lỗi không xác định khi lưu sản phẩm.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '500px', margin: '20px auto', backgroundColor: '#f9f9f9' }}>
            <h2 style={{ color: '#333', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>{isEditing ? 'Cập Nhật Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h2>
            
            {error && <p style={{ color: '#e74c3c', padding: '10px', border: '1px solid #e74c3c', backgroundColor: '#fbeaea', borderRadius: '4px' }}>Lỗi: {error}</p>}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
                {/* Tên */}
                <label>Tên Sản Phẩm:</label>
                <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '8px' }}
                />

                {/* Giá */}
                <label>Giá:</label>
                <input 
                    type="number" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    required 
                    min="0"
                    step="0.01"
                    style={{ width: '100%', padding: '8px' }}
                />

                {/* Mô tả */}
                <label>Mô tả:</label>
                <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    style={{ width: '100%', padding: '8px' }}
                />

                {/* Danh mục */}
                <label>Danh mục:</label>
                <input 
                    type="text" 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    style={{ width: '100%', padding: '8px' }}
                />

                {/* ⭐ HÌNH ẢNH: URL/Đường dẫn ảnh cũ ⭐ */}
                <label>Đường dẫn ảnh (URL):</label>
                <input 
                    type="text" 
                    value={imageUrl} 
                    onChange={(e) => {
                        setImageUrl(e.target.value);
                        setSelectedFile(null); // Khi nhập URL, ưu tiên URL
                    }}
                    placeholder="Dán URL ảnh "
                    style={{ width: '100%', padding: '8px' }}
                />
                {imageUrl && !selectedFile && (
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                        <p style={{ fontSize: '0.9em', color: '#555', marginRight: '10px' }}>Ảnh hiện tại:</p>
                        {/* LƯU Ý: Frontend cần đảm bảo BASE_URL được thêm vào nếu đây là ảnh upload cục bộ */}
                        <img src={imageUrl.startsWith('/uploads/') ? `http://localhost:4000${imageUrl}` : imageUrl} alt="Ảnh sản phẩm" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}/>
                        <button type="button" onClick={() => setImageUrl('')} style={{ marginLeft: '10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px', borderRadius: '4px', cursor: 'pointer' }}>Xóa Ảnh</button>
                    </div>
                )}


                {/* ⭐ HÌNH ẢNH: Upload File mới ⭐ */}
                <label>Hoặc Upload Ảnh Mới:</label>
                <div style={{ border: '1px dashed #ccc', padding: '10px', borderRadius: '4px' }}>
                    <input 
                        type="file" 
                        name="image" // Tên trường để Multer bắt
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ width: '100%', padding: '8px' }}
                    />
                    {selectedFile && <p style={{ fontSize: '0.9em', color: '#333', marginTop: '5px' }}>Đã chọn **{selectedFile.name}**.</p>}
                </div>

                <button 
                    type="submit" 
                    disabled={loading} 
                    style={{ 
                        padding: '10px 15px', 
                        marginRight: '10px', 
                        backgroundColor: isEditing ? '#f39c12' : '#2ecc71', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: 'pointer' 
                    }}
                >
                    {loading ? 'Đang xử lý...' : isEditing ? 'Cập Nhật' : 'Thêm Sản Phẩm'}
                </button>
                <button 
                    type="button" 
                    onClick={onClose} 
                    disabled={loading} 
                    style={{ 
                        padding: '10px 15px', 
                        backgroundColor: '#bdc3c7', 
                        color: '#333', 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: 'pointer' 
                    }}
                >
                    Hủy
                </button>
            </form>
        </div>
    );
};

export default ProductForm;
