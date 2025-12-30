// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';

// import Header from './components/Header';
// import Footer from './components/Footer';
// import ProtectedRoute from './components/ProtectedRoute';

// import Home from './pages/Home';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import ProductDetail from './pages/ProductDetail';
// import Cart from './pages/Cart'; // Thêm import cho Cart

// // ADMIN PAGE
// import AdminDashboard from './pages/AdminDashboard';
// import AdminReplies from './pages/Admin/AdminReplies';
// import AdminNotifications from './pages/Admin/AdminNotifications';
// import ProductManagement from './pages/Admin/ProductManagement';

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <Header />

//         <Routes>
//           {/* USER */}
//           <Route path="/" element={<Home />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/product/:id" element={<ProductDetail />} />
//           <Route path="/cart" element={<Cart />} /> {/* Thêm route cho Cart */}

//           {/* ADMIN */}
//           <Route
//             path="/admin"
//             element={
//               <ProtectedRoute adminOnly>
//                 <AdminDashboard />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/admin/replies"
//             element={
//               <ProtectedRoute adminOnly>
//                 <AdminReplies />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/admin/notifications"
//             element={
//               <ProtectedRoute adminOnly>
//                 <AdminNotifications />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/admin/products"
//             element={
//               <ProtectedRoute adminOnly>
//                 <ProductManagement />
//               </ProtectedRoute>
//             }
//           />
//         </Routes>

//         <Footer />
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart'; // Thêm import cho Cart
import ProductList from './pages/ProductList'; // Import ProductList
import Checkout from './pages/Checkout';

// ADMIN PAGE
import AdminDashboard from './pages/AdminDashboard';
import AdminReplies from './pages/Admin/AdminReplies';
import AdminNotifications from './pages/Admin/AdminNotifications';
import ProductManagement from './pages/Admin/ProductManagement';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />

        <Routes>
          {/* USER */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} /> {/* Thêm route cho Cart */}
          <Route path="/products" element={<ProductList />} /> {/* Thêm route cho danh sách sản phẩm */}
          <Route path="/checkout" element={<Checkout />} />

          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/replies"
            element={
              <ProtectedRoute adminOnly>
                <AdminReplies />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/notifications"
            element={
              <ProtectedRoute adminOnly>
                <AdminNotifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/products"
            element={
              <ProtectedRoute adminOnly>
                <ProductManagement />
              </ProtectedRoute>
            }
          />

        </Routes>

        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;