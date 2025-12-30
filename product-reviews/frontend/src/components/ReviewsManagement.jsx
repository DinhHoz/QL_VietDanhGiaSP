// src/components/ReviewsManagement.jsx (Main component with tabs, fetches replied data and passes props)
import React, { useState, useEffect } from "react";
import UnrepliedReviews from "./UnrepliedReviews";
import RepliedReviews from "./RepliedReviews";
import api from "../utils/api";
import "./ReviewsManagement.css";

const ReviewsManagement = ({
  unrepliedReviews,
  replyInputs,
  onReplyChange,
  onReplySubmit,
  editingReply,
  onStartEditReply,
  editInput,
  onEditInputChange,
  onUpdateReply,
  onDeleteReply,
  onCancelEditReply,
}) => {
  // States for replied reviews (fetch here to share count and data)
  const [repliedReviews, setRepliedReviews] = useState([]); // Raw replied reviews from API
  const [repliedLoading, setRepliedLoading] = useState(true); // Initial fetch loading for replied

  // Tab state for switching sections
  const [activeTab, setActiveTab] = useState('unreplied'); // Default to unreplied

  // Fetch replied reviews from API (once on mount)
  useEffect(() => {
    const fetchRepliedReviews = async () => {
      setRepliedLoading(true);
      try {
        const res = await api.get('/admin/replied-reviews'); // Gọi API mới
        if (res.data.success) {
          setRepliedReviews(res.data.data || []);
        }
      } catch (err) {
        console.error('Lỗi fetch replied reviews:', err);
        setRepliedReviews([]); // Fallback empty
      } finally {
        setRepliedLoading(false);
      }
    };
    fetchRepliedReviews();
  }, []); // Fetch once on mount

  // Shared handleDeleteReview (use parent's onDeleteReply)
  const handleDeleteReview = (id, isReplied = false) => {
    if (window.confirm('Bạn có chắc muốn xóa review này?')) {
      api.delete(`/reviews/${id}`)
        .then(() => {
          // Refresh lists (filter local state)
          if (!isReplied) {
            // Unreplied refresh via parent prop if needed
            onDeleteReply(id); // Call parent to refresh unreplied data
          } else {
            setRepliedReviews((prev) => prev.filter((review) => review._id !== id));
          }
        })
        .catch((err) => {
          console.error('Lỗi xóa review:', err);
        });
    }
  };

  return (
    <div className="reviews-container">
      <div className="reviews-header">
        <h1 className="reviews-title">Quản Lý Đánh Giá</h1>
        <p className="reviews-subtitle">Theo dõi và phản hồi ý kiến khách hàng</p>
      </div>

      <div className="tab-buttons">
        <button
          className={`tab-btn ${activeTab === 'unreplied' ? 'active' : ''}`}
          onClick={() => setActiveTab('unreplied')}
        >
          Chưa phản hồi ({unrepliedReviews.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'replied' ? 'active' : ''}`}
          onClick={() => setActiveTab('replied')}
        >
          Đã phản hồi ({repliedReviews.length})
        </button>
      </div>

      {/* Conditionally Render Active Tab */}
      {activeTab === 'unreplied' && (
        <UnrepliedReviews
          unrepliedReviews={unrepliedReviews}
          replyInputs={replyInputs}
          onReplyChange={onReplyChange}
          onReplySubmit={onReplySubmit}
          editingReply={editingReply}
          onStartEditReply={onStartEditReply}
          editInput={editInput}
          onEditInputChange={onEditInputChange}
          onUpdateReply={onUpdateReply}
          onDeleteReply={(id) => handleDeleteReview(id, false)} // Pass handler for unreplied
          onCancelEditReply={onCancelEditReply}
        />
      )}
      {activeTab === 'replied' && (
        <RepliedReviews
          repliedReviews={repliedReviews} // Pass raw data for populate
          repliedLoading={repliedLoading} // Pass loading
          onDeleteReply={(id) => handleDeleteReview(id, true)} // Pass handler for replied
        />
      )}
    </div>
  );
};

export default ReviewsManagement;