// import React, { useEffect, useState } from 'react';
// import api from '../services/api';

// export default function RecommendationList({ userId }) {
//   const [recs, setRecs] = useState([]);

//   useEffect(()=> {
//     api.get(`/graph/recommend/${userId}`).then(res => {
//       setRecs(res.data.recommendations || []);
//     }).catch(err => console.error(err));
//   }, [userId]);

//   return (
//     <div>
//       <h3>Gợi ý cho bạn</h3>
//       <ul>
//         {recs.length === 0 && <li>Không có gợi ý</li>}
//         {recs.map(p => (
//           <li key={p._key}>{p.name} — {p.price?.toLocaleString()}</li>
//         ))}
//       </ul>
//     </div>
//   );
// }
