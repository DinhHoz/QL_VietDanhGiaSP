import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function ReviewForm({ productId, onAdded, initialReview, onCancelEdit }) {
  const { isAuthenticated, user } = useAuth();
  const isEditMode = !!initialReview;

  const [rating, setRating] = useState(initialReview?.rating || 5);
  const [comment, setComment] = useState(initialReview?.comment || '');
  const [images, setImages] = useState([]); // ảnh mới
  const [previewUrls, setPreviewUrls] = useState([]); // preview ảnh mới
  const [serverError, setServerError] = useState('');
  const [existingImageUrls, setExistingImageUrls] = useState([]);

  // Khởi tạo existingImageUrls từ initialReview
  useEffect(() => {
    if (isEditMode && initialReview?.images?.length) {
      const BASE = 'http://localhost:4000';
      const urls = initialReview.images.map(path =>
        path.startsWith('http') ? path : `${BASE}${path.startsWith('/') ? path : '/' + path}`
      );
      setExistingImageUrls(urls);
    }
  }, [initialReview, isEditMode]);

  const displayUserName = isEditMode ? (initialReview?.userName || user?.name) : user?.name;

  if (!isAuthenticated) {
    return (
      <div style={{ marginTop: 12, padding: 20, border: '1px dashed #ffa94d', borderRadius: 8, textAlign: 'center' }}>
        Bạn cần <a href="/login" style={{ color: '#007bff', textDecoration: 'underline' }}>đăng nhập</a> để gửi đánh giá.
      </div>
    );
  }

  // Chọn ảnh mới
  const handleImageChange = e => {
    const files = Array.from(e.target.files);
    if (files.length + existingImageUrls.length > 5) {
      alert(`Tối đa 5 ảnh. Bạn còn được chọn: ${5 - existingImageUrls.length}`);
      e.target.value = null;
      return;
    }
    setImages(files);
    setPreviewUrls(files.map(f => URL.createObjectURL(f)));
  };

  const removeNewImage = i => {
    const newImgs = [...images];
    const newPrev = [...previewUrls];
    newImgs.splice(i, 1);
    newPrev.splice(i, 1);
    setImages(newImgs);
    setPreviewUrls(newPrev);
  };

  const removeExistingImage = i => {
    const newExisting = [...existingImageUrls];
    newExisting.splice(i, 1);
    setExistingImageUrls(newExisting);
  };

  const submit = async () => {
    if (!comment.trim()) return alert('Vui lòng nhập bình luận.');
    if (rating < 1 || rating > 5) return alert('Rating không hợp lệ.');
    setServerError('');

    try {
      const formData = new FormData();
      formData.append('rating', rating);
      formData.append('comment', comment.trim());

      if (!isEditMode) formData.append('productId', productId);

      if (isEditMode) {
        const relative = existingImageUrls.map(url => url.replace('http://localhost:4000', ''));
        formData.append('existingImages', JSON.stringify(relative));
      }

      images.forEach(f => formData.append('images', f));

      const id = initialReview?._id;
      const url = isEditMode ? `reviews/${id}` : 'reviews';
      const method = isEditMode ? 'put' : 'post';

      const res = await api[method](url, formData);

      alert(isEditMode ? 'Cập nhật thành công!' : 'Đã gửi đánh giá!');
      onAdded && onAdded(res.data.review || res.data);
      onCancelEdit && onCancelEdit();

      if (!isEditMode) {
        setRating(5);
        setComment('');
        setImages([]);
        setPreviewUrls([]);
      }
    } catch (err) {
      console.error('Review error:', err.response || err);
      const msg = err.response?.data?.msg || err.response?.data?.error || 'Lỗi gửi đánh giá.';
      setServerError(msg);
      alert(msg);
    }
  };

  const renderPreview = (urls, isNew = false) =>
    urls.map((src, i) => (
      <div key={i} style={{ width: 90, height: 90, borderRadius: 8, border: isNew ? '2px dashed #28a745' : '2px solid #007bff', overflow: 'hidden', position: 'relative' }}>
        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <button
          onClick={() => isNew ? removeNewImage(i) : removeExistingImage(i)}
          style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', padding: '2px 4px', cursor: 'pointer' }}
        >
          ×
        </button>
      </div>
    ));

  return (
    <div style={{ marginTop: 16, padding: 20, background: 'white', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginBottom: 12 }}>{isEditMode ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'} – <b>{displayUserName}</b></h3>

      {serverError && <div style={{ background: '#f8d7da', padding: 10, borderRadius: 6, color: '#721c24' }}>{serverError}</div>}

      <label>Đánh giá:</label>
      <select value={rating} onChange={e => setRating(+e.target.value)} disabled={false} style={{ marginBottom: 12 }}>
        {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{`${n} sao`}</option>)}
      </select>

      <textarea rows={4} placeholder="Chia sẻ cảm nhận của bạn..." value={comment} onChange={e => setComment(e.target.value)} style={{ width: '100%', marginBottom: 16 }} />

      <label>Ảnh minh họa (tối đa 5):</label>
      <input type="file" multiple accept="image/*" onChange={handleImageChange} />

      {(existingImageUrls.length > 0 || previewUrls.length > 0) && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
          {renderPreview(existingImageUrls)}
          {renderPreview(previewUrls, true)}
        </div>
      )}

      <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
        <button onClick={submit} style={{ flex: 1, padding: 10, background: '#007bff', color: 'white', borderRadius: 6 }}>
          {isEditMode ? 'Cập nhật' : 'Gửi đánh giá'}
        </button>
        {isEditMode && <button onClick={onCancelEdit} style={{ padding: 10, background: '#6c757d', color: 'white', borderRadius: 6 }}>Hủy</button>}
      </div>
    </div>
  );
}
