// // src/pages/Admin/ReviewManagement.jsx
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useAuth } from '../../context/AuthContext.jsx'; // Đã sửa lỗi: Thêm .jsx

// const GRAPH_URL = 'http://localhost:4000/api/graph';

// const ReviewManagement = () => {
//   const { getToken } = useAuth();
//   const [suspiciousPairs, setSuspiciousPairs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const fetchFraudDetection = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const token = getToken();
      
//       // ✅ Gọi route Admin-Only: /api/graph/fraud-detection
//       const response = await axios.get(`${GRAPH_URL}/fraud-detection`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
      
//       setSuspiciousPairs(response.data.suspiciousPairs);
//     } catch (err) {
//       setError('Lỗi phát hiện gian lận. Vui lòng kiểm tra quyền Admin và kết nối API.');
//       console.error('Lỗi phát hiện gian lận:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchFraudDetection();
//   }, []);

//   if (loading) return <div>Đang phân tích dữ liệu gian lận...</div>;
//   if (error) return <div style={{ color: 'red' }}>Lỗi: {error}</div>;

//   return (
//     <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '12px' }}>
//       <h2>🔍 Quản Lý Reviews & Phát Hiện Gian Lận</h2>
//       <p style={{ marginBottom: '20px', color: '#555' }}>
//         Danh sách các cặp reviews có nội dung và rating giống hệt nhau (nghi ngờ gian lận):
//       </p>
      
//       {suspiciousPairs.length === 0 ? (
//         <p style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', textAlign: 'center' }}>
//             ✅ Không tìm thấy cặp reviews đáng ngờ nào.
//         </p>
//       ) : (
//         <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
//           <thead>
//             <tr style={{ backgroundColor: '#ffeb3b' }}>
//               <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #ccc' }}>Review 1 (Key)</th>
//               <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #ccc' }}>Review 2 (Key)</th>
//               <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #ccc' }}>Rating</th>
//               <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #ccc' }}>Nội dung</th>
//             </tr>
//           </thead>
//           <tbody>
//             {suspiciousPairs.map((pair, index) => (
//               <tr key={index} style={{ borderBottom: '1px solid #eee', backgroundColor: index % 2 === 0 ? '#fff' : '#fffbe5' }}>
//                 <td style={{ padding: '15px' }}>{pair.r1}</td>
//                 <td style={{ padding: '15px' }}>{pair.r2}</td>
//                 <td style={{ padding: '15px' }}>{pair.rating} sao</td>
//                 <td style={{ padding: '15px' }}>{pair.comment}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
      
//       {/* Tính năng phản hồi review (Admin-Only) có thể được tích hợp ở đây */}
//       <div style={{ marginTop: '40px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
//         <h3>Ghi chú</h3>
//         <p>Tính năng này giả định API backend /api/graph/fraud-detection trả về các cặp review trùng lặp.</p>
//       </div>
//     </div>
//   );
// };

// export default ReviewManagement;
