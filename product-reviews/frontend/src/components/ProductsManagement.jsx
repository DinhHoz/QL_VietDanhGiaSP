// src/components/ProductsManagement.jsx
import React from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import "./ProductsManagement.css"
const ProductsManagement = ({
  products,
  onDeleteProduct,
  onEditProduct,
  productForm,
  onProductInputChange,
  selectedFile,
  onFileChange,
  showCreateModal,
  onOpenCreateModal,
  onCloseCreateModal,
  onSubmitProduct,
  showEditModal,
  editForm,
  onEditInputChange,
  editSelectedFile,
  onEditFileChange,
  onSubmitEdit,
  onCloseEditModal,
}) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'; // Đảm bảo rằng đây là URL đúng của backend server, thay đổi nếu cần

  return (
    <div className="products-container">
      <div className="products-header">
        <h1 className="products-title">Quản lý sản phẩm</h1>
        <button onClick={onOpenCreateModal} className="add-product-btn">
          <Plus size={20} /> Thêm sản phẩm mới
        </button>
      </div>
      {/* Products List */}
      <div className="products-list-container">
        <div className="products-list-header">
          <h2 className="list-title">Danh sách sản phẩm</h2>
        </div>
        <div className="table-wrapper">
          <table className="products-table">
            <thead>
              <tr>
                <th className="table-header">Hình ảnh</th>
                <th className="table-header">Tên</th>
                <th className="table-header">Giá</th>
                <th className="table-header">Loại</th>
                <th className="table-header">Số lượng</th>
                <th className="table-header">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {/* Fix: Kiểm tra products là array trước khi map */}
              {Array.isArray(products) ? products.map((product) => (
                <tr key={product._id} className="table-row">
                  <td className="table-cell">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={`${baseUrl}${product.images[0]}`}
                        alt={product.name}
                        className="product-image-management"
                      />
                    ) : (
                      "Không có hình ảnh"
                    )}
                  </td>
                  <td className="table-cell">{product.name}</td>
                  <td className="table-cell">{product.price?.toLocaleString()}₫</td>
                  <td className="table-cell">{product.category}</td>
                  <td className="table-cell">{product.stock ?? 0}</td>
                  <td className="table-cell">
                    <div className="action-buttons">
                      <button className="action-btn edit-btn" onClick={() => onEditProduct(product)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="action-btn delete-btn" onClick={() => onDeleteProduct(product._id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="table-cell text-center">Không có sản phẩm hoặc lỗi tải dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Product Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={onCloseCreateModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Tạo sản phẩm mới</h2>
              <button className="modal-close-btn" onClick={onCloseCreateModal}>
                <X size={20} />
              </button>
            </div>
            <div className="form-grid">
              <label htmlFor="create-name" className="form-label">Tên sản phẩm</label>
              <input
                id="create-name"
                type="text"
                name="name"
                placeholder="Tên sản phẩm"
                value={productForm.name}
                onChange={onProductInputChange}
                className="form-input"
              />
              <label htmlFor="create-price" className="form-label">Giá</label>
              <input
                id="create-price"
                type="number"
                name="price"
                placeholder="Giá"
                value={productForm.price}
                onChange={onProductInputChange}
                className="form-input"
              />
              <label htmlFor="create-stock" className="form-label">Số lượng</label>
              <input
                id="create-stock"
                type="number"
                name="stock"
                placeholder="Số lượng"
                value={productForm.stock || 0}
                onChange={onProductInputChange}
                className="form-input"
              />
              <label htmlFor="create-category" className="form-label">Loại</label>
              <input
                id="create-category"
                type="text"
                name="category"
                placeholder="Loại"
                value={productForm.category}
                onChange={onProductInputChange}
                className="form-input form-input-full"
              />
              <label htmlFor="create-description" className="form-label">Mô tả</label>
              <textarea
                id="create-description"
                name="description"
                placeholder="Mô tả"
                value={productForm.description}
                onChange={onProductInputChange}
                rows="3"
                className="form-textarea form-input-full"
              />
              <label htmlFor="create-image" className="form-label">Hình ảnh</label>
              <input
                id="create-image"
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="form-file"
              />
            </div>
            <div className="modal-buttons">
              <button onClick={onSubmitProduct} className="submit-btn">
                Tạo sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={onCloseEditModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Chỉnh sửa sản phẩm</h2>
              <button className="modal-close-btn" onClick={onCloseEditModal}>
                <X size={20} />
              </button>
            </div>
            <div className="form-grid">
              <label htmlFor="edit-name" className="form-label">Tên sản phẩm</label>
              <input
                id="edit-name"
                type="text"
                name="name"
                placeholder="Tên sản phẩm"
                value={editForm.name}
                onChange={onEditInputChange}
                className="form-input"
              />
              <label htmlFor="edit-price" className="form-label">Giá</label>
              <input
                id="edit-price"
                type="number"
                name="price"
                placeholder="Giá"
                value={editForm.price}
                onChange={onEditInputChange}
                className="form-input"
              />
              <label htmlFor="edit-stock" className="form-label">Số lượng</label>
              <input
                id="edit-stock"
                type="number"
                name="stock"
                placeholder="Số lượng"
                value={editForm.stock || 0}
                onChange={onEditInputChange}
                className="form-input"
              />
              <label htmlFor="edit-category" className="form-label">Loại</label>
              <input
                id="edit-category"
                type="text"
                name="category"
                placeholder="Loại"
                value={editForm.category}
                onChange={onEditInputChange}
                className="form-input form-input-full"
              />
              <label htmlFor="edit-description" className="form-label">Mô tả</label>
              <textarea
                id="edit-description"
                name="description"
                placeholder="Mô tả"
                value={editForm.description}
                onChange={onEditInputChange}
                rows="3"
                className="form-textarea form-input-full"
              />
              <label htmlFor="edit-image" className="form-label">Hình ảnh</label>
              <input
                id="edit-image"
                type="file"
                accept="image/*"
                onChange={onEditFileChange}
                className="form-file"
              />
            </div>
            <div className="modal-buttons">
              <button onClick={onSubmitEdit} className="submit-btn">
                Cập nhật sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManagement;