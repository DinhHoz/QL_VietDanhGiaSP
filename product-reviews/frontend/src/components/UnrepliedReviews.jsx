// src/components/UnrepliedReviews.jsx
import React, { useEffect, useState } from "react";
import { FaReply, FaTrash } from "react-icons/fa";
// Đảm bảo bạn đã cài: npm install react-icons
import { IoClose, IoPaperPlaneOutline } from "react-icons/io5"; 
import api from "../utils/api";
// Import file CSS đã sửa ở trên
import "./ReviewsManagement.css"; 

// --- COMPONENT POPUP RIÊNG BIỆT (Đã sửa cấu trúc HTML) ---
const ReplyPopup = ({ 
  review, 
  replyText, 
  onReplyChange, 
  onReplySubmit, 
  onClose 
}) => {
  if (!review) return null;

  return (
    <>
      {/* Lớp nền mờ - Click vào để đóng popup */}
      <div className="popup-overlay" onClick={onClose}></div>
      
      {/* Hộp thoại chính */}
      <div className="popup-container">
        <div className="popup-header">
          <h3 className="popup-title">Phản hồi đánh giá</h3>
          <button onClick={onClose} className="popup-close" title="Đóng">
            <IoClose />
          </button>
        </div>

        <div className="popup-content">
          {/* Thông tin đánh giá của khách */}
          <div className="review-summary">
            <div className="review-info-item">
              <span className="review-label">Khách hàng:</span>
              <span className="review-value">{review.userName}</span>
            </div>
            <div className="review-info-item">
              <span className="review-label">Sản phẩm:</span>
              <span className="review-value">{review.productName}</span>
            </div>
            <div className="review-comment-quote">
              {review.comment}
            </div>
          </div>

          {/* Khu vực nhập phản hồi */}
          <div className="reply-input-area">
            <label className="input-label" htmlFor="replyBox">Nội dung phản hồi của Shop:</label>
            <textarea
              id="replyBox"
              className="popup-textarea"
              placeholder="Ví dụ: Cảm ơn bạn đã ủng hộ shop. Chúng tôi sẽ..."
              value={replyText || ""}
              onChange={(e) => onReplyChange(review._id, e.target.value)}
              autoFocus /* Tự động focus vào ô nhập khi mở popup */
            />
          </div>
        </div>

        <div className="popup-footer">
          <button className="btn btn-cancel" onClick={onClose}>
            Hủy bỏ
          </button>
          <button
            className="btn btn-submit"
            onClick={() => {
              onReplySubmit(review._id);
              onClose();
            }}
            // Disable nút nếu chưa nhập gì hoặc chỉ nhập khoảng trắng
            disabled={!replyText || replyText.trim().length === 0}
          >
            <IoPaperPlaneOutline /> Gửi phản hồi
          </button>
        </div>
      </div>
    </>
  );
};

// --- COMPONENT CHÍNH ---
const UnrepliedReviews = ({
  unrepliedReviews,
  replyInputs,
  onReplyChange,
  onReplySubmit,
  onDeleteReply,
}) => {
  const [populatedReviews, setPopulatedReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  // ... (Phần logic useEffect loading dữ liệu giữ nguyên như cũ) ...
  useEffect(() => {
    const load = async () => {
      if (!unrepliedReviews.length) {
        setPopulatedReviews([]);
        return;
      }

      setLoading(true);
      try {
        const list = await Promise.all(
          unrepliedReviews.map(async (review) => {
            let userName = "Người dùng ẩn danh";
            let productName = "Không xác định";

            // Thêm try-catch cho từng lệnh gọi API con để an toàn hơn
            if (review.userId) {
                try {
                    const res = await api.get(`/users/${review.userId}`);
                    userName = res.data?.name || res.data?.username || "Người dùng";
                } catch (e) { /* Ignore error */ }
            }

            if (review.productId) {
                try {
                    const res = await api.get(`/products/${review.productId}`);
                    productName = res.data?.name || "Không xác định";
                } catch (e) { /* Ignore error */ }
            }

            return { ...review, userName, productName };
          })
        );
        setPopulatedReviews(list);
      } catch (err) {
        console.error("Lỗi tải chi tiết đánh giá:", err);
        // Vẫn hiển thị danh sách gốc nếu API lỗi, tránh màn hình trắng
        setPopulatedReviews(unrepliedReviews);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [unrepliedReviews]);

  const getInitials = (name) => {
    if(!name) return "KH";
    const parts = name.trim().split(" ");
    if (parts.length === 0) return "KH";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <>
      {loading ? (
        <div className="loading-state">Đang tải dữ liệu đánh giá...</div>
      ) : (
        <div className="review-table-wrapper">
          <table className="review-table">
            <thead>
              <tr>
                <th style={{width: '22%'}}>Người dùng</th>
                <th style={{width: '22%'}}>Sản phẩm</th>
                <th style={{width: '15%'}}>Đánh giá</th>
                <th style={{width: '28%'}}>Nội dung</th>
                <th style={{width: '13%'}}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {populatedReviews.map((r) => (
                <tr key={r._id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-badge">{getInitials(r.userName)}</div>
                      <span className="user-name-text">{r.userName}</span>
                    </div>
                  </td>
                  <td>{r.productName}</td>
                  <td>
                    <div className="stars-container">
                      <span className="stars">{"★".repeat(r.rating)}</span>
                      <span className="stars-empty">{"☆".repeat(5 - r.rating)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="comment-truncate" title={r.comment}>{r.comment}</div>
                  </td>
                  <td className="action-cell">
                    <button
                      onClick={() => setSelectedReview(r)}
                      className="icon-btn reply-btn-icon"
                      title="Trả lời"
                    >
                      <FaReply />
                    </button>
                    <button
                      onClick={() => onDeleteReply(r._id)}
                      className="icon-btn delete-btn"
                      title="Xóa"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {populatedReviews.length === 0 && (
            <div className="empty-state">Hiện không có đánh giá nào cần phản hồi.</div>
          )}
        </div>
      )}

      {/* Hiển thị Popup nếu có review được chọn */}
      {selectedReview && (
        <ReplyPopup 
            review={selectedReview} 
            // Lấy text tương ứng với ID của review đang chọn
            replyText={replyInputs[selectedReview._id]}
            onReplyChange={onReplyChange}
            onReplySubmit={onReplySubmit}
            onClose={() => setSelectedReview(null)}
        />
      )}
    </>
  );
};

export default UnrepliedReviews;