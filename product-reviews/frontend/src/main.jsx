// // src/main.jsx

// import React from 'react';
// import { createRoot } from 'react-dom/client';
// import App from './App.jsx'; 
// import './index.css';

// // 1. SỬA ĐỔI: Bỏ phần mở rộng .jsx khỏi AuthContext
// // Lý do: Đồng bộ hóa cách import và tránh lỗi phân giải của Dev Server.
// import { AuthProvider } from './context/AuthContext'; 

// const container = document.getElementById('root');
// const root = createRoot(container);

// root.render(
//   <React.StrictMode>
//     {/* 2. Bọc toàn bộ ứng dụng bằng AuthProvider để useAuth hoạt động */}
//     <AuthProvider> 
//       <App />
//     </AuthProvider>
//   </React.StrictMode>
// );

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();  // Có thể customize theme

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);