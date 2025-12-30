// // src/components/CreateReview.jsx
// import React, { useState } from 'react';
// import apiClient from '../services/api'; 

// const CreateReview = () => {
//   const [content, setContent] = useState('');
//   const [productId, setProductId] = useState('some-product-id'); // Giả định ID sản phẩm

//   const handleCreateReview = async () => {
//     try {
//       // Axios sẽ TỰ ĐỘNG thêm Header Authorization: Bearer <token>
//       const response = await apiClient.post('/reviews', {
//         productId,
//         content,
//         rating: 5
//       });
//       alert('Tạo review thành công!');
//       console.log('Review created:', response.data);
//     } catch (error) {
//       if (error.response && error.response.status === 401) {
//         alert('Bạn cần đăng nhập để thực hiện chức năng này.');
//         // Chuyển hướng đến trang đăng nhập
//       } else {
//         console.error("Error creating review:", error);
//       }
//     }
//   };

//   return (
//     <div>
//       <h3>Viết Review mới</h3>
//       <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Nội dung review" />
//       <button onClick={handleCreateReview}>Gửi Review</button>
//     </div>
//   );
// };

// export default CreateReview;