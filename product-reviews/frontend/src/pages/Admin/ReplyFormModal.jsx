// // components/ReplyFormModal.jsx
// import React, { useState } from 'react';
// import axios from 'axios';
// import { useAuth } from '../../context/AuthContext';

// const BASE_URL = 'http://localhost:4000';

// const ReplyFormModal = ({ productId, reviewId, onClose, onSuccess }) => {
//   const { getToken } = useAuth();
//   const [content, setContent] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async () => {
//     if (!content.trim()) return alert("Vui lòng nhập nội dung phản hồi!");
//     setLoading(true);
//     try {
//       const token = getToken();
//       await axios.post(
//         `${BASE_URL}/api/admin/reply/${reviewId}`,
//         { content: content.trim() },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       alert("Phản hồi thành công!");
//       onSuccess();
//       onClose();
//     } catch (err) {
//       alert("Lỗi: " + (err.response?.data?.error || "Không thể gửi phản hồi"));
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{
//       position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
//       backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center'
//     }}>
//       <div style={{
//         background: 'white', padding: '24px', borderRadius: '12px', width: '500px', maxWidth: '90%'
//       }}>
//         <h3>Viết phản hồi cho Review</h3>
//         <p><strong>Sản phẩm ID:</strong> {productId}</p>
//         <p><strong>Review ID:</strong> {reviewId}</p>
//         <textarea
//           value={content}
//           onChange={(e) => setContent(e.target.value)}
//           placeholder="Nhập nội dung phản hồi..."
//           style={{
//             width: '100%', minHeight: '120px', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', margin: '12px 0'
//           }}
//         />
//         <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
//           <button onClick={onClose} style={{ padding: '8px 16px', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '6px' }}>
//             Hủy
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={loading}
//             style={{ padding: '8px 16px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '6px' }}
//           >
//             {loading ? "Đang gửi..." : "Gửi phản hồi"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ReplyFormModal;