// New file: src/components/NotificationDropdown.jsx
import React from 'react';
import "./NotificationDropdown.css"; // Assume shared CSS, or create separate if needed

const NotificationDropdown = ({ reviews, onClose, setCurrentView }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getIconForReview = () => <div className="notification-icon-star">⭐</div>; // Use emoji instead of lucide icon to avoid import issues

  const handleViewAll = () => {
    onClose();
    if (setCurrentView) {
      setCurrentView('reviews');
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="notification-dropdown">
        <div className="notification-header">
          <h3>NOTIFICATIONS CENTER</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="notification-empty">
          <p>Không có thông báo mới</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-dropdown">
      <div className="notification-header">
        <h3>NOTIFICATIONS CENTER</h3>
        <span className="notification-count">{reviews.length} thông báo mới</span>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
      <div className="notification-list">
        {reviews.slice(0, 10).map((review) => (
          <div key={review._id} className="notification-item" onClick={handleViewAll}>
            <div className="notification-icon">
              {getIconForReview()}
            </div>
            <div className="notification-content">
              <p className="notification-title">
                New Product Rating! {review.productId?.name ? `for ${review.productId.name}` : ''}
              </p>
              <p className="notification-time">
                {formatDate(review.createdAt || new Date().toISOString())}
              </p>
            </div>
          </div>
        ))}
      </div>
      {reviews.length > 10 && (
        <div className="notification-footer">
          Và {reviews.length - 10} thông báo khác...
        </div>
      )}
      <div className="notification-action">
        <button 
          onClick={handleViewAll}
          className="view-all-btn"
        >
          Show All Notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;