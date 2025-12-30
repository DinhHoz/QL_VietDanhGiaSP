// Updated: src/pages/AdminDashboard.jsx (Refactored to extract ProductsManagement and ReviewsManagement components)
import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  BarChart2,
  ShoppingBag,
  MessageSquare,
  Menu,
  Home,
  Bell,
  Flag,
  ShoppingCart,
  Layers, // Thêm icon cho Categories
  Users, // Thêm icon cho Users
} from "lucide-react";
import {
  BarChart, // Biểu đồ cột cho Reviews Overview
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../utils/api";
import NotificationDropdown from "../components/NotificationDropdown"; // Import new component
import ProductsManagement from "../components/ProductsManagement"; // Import new component
import ReviewsManagement from "../components/ReviewsManagement"; // Import new component
import OrdersManagement from '../components/OrdersManagement';
import ReportsManagement from '../components/ReportReviewsManagement';
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [products, setProducts] = useState([]); // Đảm bảo luôn là array
  const [unrepliedReviews, setUnrepliedReviews] = useState([]);
  const [categories, setCategories] = useState([]); // Thêm state cho categories
  const [users, setUsers] = useState([]); // Thêm state cho users
  const [reviewsData, setReviewsData] = useState([]); // State cho dữ liệu biểu đồ thực tế
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyInputs, setReplyInputs] = useState({});
  const [editingReply, setEditingReply] = useState(null);
  const [editInput, setEditInput] = useState("");
  const [currentView, setCurrentView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: 0, // Thêm stock mặc định
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false); // New state for dropdown
  const notificationRef = useRef(null); // Ref for outside click

  // New states for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: 0, // Thêm stock mặc định
  });
  const [editSelectedFile, setEditSelectedFile] = useState(null);

  // New states for create modal
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { handleSubmit: submitProduct, reset } = useForm();

  useEffect(() => {
    loadAdminData();

    // Poll for new reviews every 30 seconds
    const interval = setInterval(fetchUnrepliedReviews, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  // ===========================
  // LOAD PRODUCTS + REVIEWS + COMPUTE CATEGORIES + USERS + REVIEWS CHART DATA
  // ===========================
  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        (async () => {
          console.log('Fetching products...'); // Debug log
          const productsRes = await api.get("/products");
          console.log('Products response:', productsRes.data); // Log response để debug
          // Fix: Extract array from response (backend trả array trực tiếp, fallback rỗng)
          const productArray = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data.products || []);
          setProducts(productArray);
          // Compute categories from products (unique categories)
          const uniqueCategories = [...new Set(productArray.map(p => p.category).filter(Boolean))];
          setCategories(uniqueCategories);
        })(),
        fetchUnrepliedReviews(),
        (async () => {
          // Fetch real reviews data by month từ API backend
          const reviewsRes = await api.get("/admin/reviews-by-month");
          setReviewsData(reviewsRes.data || []); // Dữ liệu thực: [{ month: "Nov 2025", value: 4 }, ...]
        })(),
      ]);
    } catch (err) {
      console.error("Lỗi load admin data:", err.response || err); // Log chi tiết lỗi
      setError(err.response?.data?.error || err.message || "Không thể tải dữ liệu.");
      // Fallback dữ liệu mẫu nếu API lỗi (tùy chọn)
      setReviewsData([{ month: "Nov 2025", value: 4 }]);
      setProducts([]); // Đảm bảo products là array rỗng nếu lỗi
    } finally {
      setLoading(false);
    }
  };

  const fetchUnrepliedReviews = async () => {
    try {
      const unrepliedRes = await api.get("/admin/unreplied-reviews");
      const rawReviews = unrepliedRes.data.reviews || [];
      // Fetch replies cho từng review
      const reviewsWithReplies = await Promise.all(
        rawReviews.map(async (review) => {
          const replyRes = await api.get(
            `/admin/replies/review/${review._id}`
          );
          return {
            ...review,
            replies: replyRes.data.replies || [],
          };
        })
      );
      setUnrepliedReviews(reviewsWithReplies);

      // Compute unique users from unreplied reviews (userId or userName)
      const uniqueUsers = [...new Set(rawReviews.map(r => r.userName || r.userId).filter(Boolean))];
      setUsers(uniqueUsers);
    } catch (err) {
      console.error("Lỗi fetch unreplied reviews:", err);
    }
  };

  // ===========================
  // PRODUCT FORM HANDLERS
  // ===========================
  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? (value === '' ? '' : parseFloat(value) || 0) : value
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmitProduct = async () => {
    try {
      const formData = new FormData();
      formData.append("name", productForm.name);
      formData.append("description", productForm.description);
      formData.append("price", productForm.price.toString());
      formData.append("category", productForm.category);
      formData.append("stock", productForm.stock.toString()); // Thêm stock
      if (selectedFile) formData.append("image", selectedFile);
      await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProductForm({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: 0, // Reset stock
      });
      setSelectedFile(null);
      setShowCreateModal(false); // Close modal after submit
      loadAdminData(); // Refresh data after adding product
    } catch (err) {
      setError(err.response?.data?.error || "Lỗi tạo sản phẩm.");
    }
  };

  // ===========================
  // CREATE MODAL HANDLERS
  // ===========================
  const handleOpenCreateModal = () => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: 0,
    });
    setSelectedFile(null);
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  // ===========================
  // EDIT PRODUCT HANDLERS
  // ===========================
  const handleEditProduct = (product) => {
    setEditProduct(product);
    setEditForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price != null ? product.price : "",
      category: product.category || "",
      stock: product.stock != null ? product.stock : 0,
    });
    setEditSelectedFile(null);
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? (value === '' ? '' : parseFloat(value) || 0) : value
    }));
  };

  const handleEditFileChange = (e) => {
    setEditSelectedFile(e.target.files[0]);
  };

  const handleSubmitEdit = async () => {
    if (!editProduct || !editProduct._id) {
      setError("Không tìm thấy sản phẩm để chỉnh sửa.");
      return;
    }
    if (!editForm.name || isNaN(editForm.price) || editForm.price <= 0 || isNaN(editForm.stock) || editForm.stock < 0) {
      setError("Vui lòng điền đầy đủ thông tin hợp lệ (giá >0, số lượng >=0).");
      return;
    }
    try {
      console.log('Submitting edit for product:', editProduct._id); // Debug log
      const formData = new FormData();
      formData.append("name", editForm.name);
      formData.append("description", editForm.description);
      formData.append("price", editForm.price.toString());
      formData.append("category", editForm.category);
      formData.append("stock", editForm.stock.toString());
      if (editSelectedFile) formData.append("image", editSelectedFile);
      const response = await api.put(`/products/${editProduct._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log('Edit success:', response.data); // Debug log
      // Update state thủ công để refresh nhanh hơn
      setProducts(products.map(p => p._id === editProduct._id ? response.data : p));
      setShowEditModal(false);
      setEditProduct(null);
      loadAdminData(); // Refresh data after update (tùy chọn nếu update thủ công ok)
    } catch (err) {
      console.error('Edit error:', err.response?.data || err); // Log chi tiết
      setError(err.response?.data?.error || "Lỗi cập nhật sản phẩm.");
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditProduct(null);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      await api.delete(`/products/${id}`);
      loadAdminData(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.error || "Lỗi xóa sản phẩm.");
    }
  };

  // ===========================
  // CREATE REPLY
  // ===========================
  const handleReplyChange = (reviewId, value) => {
    setReplyInputs((prev) => ({ ...prev, [reviewId]: value }));
  };

  const handleReplySubmit = async (reviewId) => {
    const content = replyInputs[reviewId]?.trim();
    if (!content) return;
    try {
      await api.post(`/admin/reply/${reviewId}`, { content });
      setReplyInputs((prev) => ({ ...prev, [reviewId]: "" }));
      fetchUnrepliedReviews(); // Refresh after reply
    } catch (err) {
      setError(err.response?.data?.msg || "Lỗi tạo reply.");
    }
  };

  // ===========================
  // EDIT REPLY
  // ===========================
  const startEditReply = (reply) => {
    setEditingReply(reply._id);
    setEditInput(reply.content);
  };

  const handleUpdateReply = async (replyId) => {
    try {
      await api.put(`/admin/reply/${replyId}`, { content: editInput });
      setEditingReply(null);
      setEditInput("");
      fetchUnrepliedReviews(); // Refresh after update
    } catch (err) {
      setError(err.response?.data?.msg || "Lỗi cập nhật reply.");
    }
  };

  const cancelEditReply = () => {
    setEditingReply(null);
    setEditInput("");
  };

  // ===========================
  // DELETE REPLY
  // ===========================
  const handleDeleteReply = async (replyId) => {
    if (!window.confirm("Bạn có chắc muốn xoá reply này?")) return;
    try {
      await api.delete(`/admin/reply/${replyId}`);
      fetchUnrepliedReviews(); // Refresh after delete
    } catch (err) {
      setError(err.response?.data?.msg || "Lỗi xoá reply.");
    }
  };

  // ===========================
  // DASHBOARD DATA
  // ===========================
  const statsCards = [
    {
      title: "Categories",
      value: categories.length,
      color: { backgroundColor: "#f0fdf4", borderLeft: "4px solid #22c55e" },
      icon: <Layers size={24} style={{ color: "#16a34a" }} />,
    },
    {
      title: "Total Users",
      value: users.length,
      color: { backgroundColor: "#eff6ff", borderLeft: "4px solid #3b82f6" },
      icon: <Users size={24} style={{ color: "#2563eb" }} />,
    },
    {
      title: "Products",
      value: products.length,
      color: { backgroundColor: "#faf5ff", borderLeft: "4px solid #a855f7" },
      icon: <BarChart2 size={24} style={{ color: "#9333ea" }} />,
    },
    {
      title: "Reviews",
      value: unrepliedReviews.length,
      color: { backgroundColor: "#fef3c7", borderLeft: "4px solid #f59e0b" },
      icon: <MessageSquare size={24} style={{ color: "#d97706" }} />,
    },
  ];

  const renderDashboard = () => (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statsCards.map((card, index) => (
          <div
            key={index}
            className="stats-card"
            style={{
              backgroundColor: card.color.backgroundColor,
              borderLeft: card.color.borderLeft,
            }}
            onMouseEnter={(e) => { e.target.classList.add('stats-card-hover'); }}
            onMouseLeave={(e) => { e.target.classList.remove('stats-card-hover'); }}
          >
            <div className="stats-card-content">
              <div>
                <p className="stats-card-title">
                  {card.title}
                </p>
                <p className="stats-card-value">{card.value}</p>
              </div>
              <div className="stats-card-icon">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Charts */}
      <div className="charts-grid">
        <div className="earnings-chart-container">
          <h2 className="chart-title">Reviews Overview</h2>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reviewsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  tickFormatter={(value) => `${value} reviews`}
                />
                <Tooltip
                  formatter={(value) => [`${value} reviews`, ""]}
                  contentStyle={{ backgroundColor: "#f9fafb", border: "none", borderRadius: "8px" }}
                />
                <Bar
                  dataKey="value"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-text">Đang tải...</div>
      </div>
    );

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-avatar"></div>
          <span className="sidebar-title">ADMIN</span>
        </div>
        <nav className="sidebar-nav">
          <button
            onClick={() => setCurrentView("dashboard")}
            className={`nav-btn ${currentView === "dashboard" ? 'nav-btn-active' : ''}`}
          >
            <BarChart2 size={20} />
            <span className="nav-text">Dashboard</span>
          </button>
          <div className="nav-section">
            <span>Shop</span>
          </div>

          <button
            onClick={() => setCurrentView("products")}
            className={`nav-btn ${currentView === "products" ? 'nav-btn-active' : ''}`}
          >
            <ShoppingBag size={18} />
            <span className="nav-text">Products</span>
          </button>
          <button
            onClick={() => setCurrentView("reviews")}
            className={`nav-btn ${currentView === "reviews" ? 'nav-btn-active' : ''}`}
          >
            <MessageSquare size={18} />
            <span className="nav-text">Reviews</span>
          </button>
          <button
            onClick={() => setCurrentView("orders")}
            className={`nav-btn ${currentView === "orders" ? 'nav-btn-active' : ''}`}
          >
            <MessageSquare size={18} />
            <span className="nav-text">Orders</span>
          </button>
          <button
            onClick={() => setCurrentView("reports")}
            className={`nav-btn ${currentView === "reports" ? 'nav-btn-active' : ''}`}
          >
            <Flag size={18} />
            <span className="nav-text">Reports</span>
          </button>
        </nav>
      </div>
      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <div className="top-bar">
          <div className="top-bar">
            <div className="top-bar-right">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="menu-btn"
              >
                <Menu size={24} />
              </button>

            </div>


            {/* User */}
            <div className="user-info">
              <div className="user-avatar">👤</div>
            </div>
          </div>
        </div>
        {/* Content Area */}
        <div className="content-area">
          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          {currentView === "dashboard" && renderDashboard()}
          {currentView === "products" && (
            <ProductsManagement
              products={products}
              onDeleteProduct={handleDeleteProduct}
              onEditProduct={handleEditProduct}
              productForm={productForm}
              onProductInputChange={handleProductInputChange}
              selectedFile={selectedFile}
              onFileChange={handleFileChange}
              showCreateModal={showCreateModal}
              onOpenCreateModal={handleOpenCreateModal}
              onCloseCreateModal={handleCloseCreateModal}
              onSubmitProduct={handleSubmitProduct}
              showEditModal={showEditModal}
              editForm={editForm}
              onEditInputChange={handleEditInputChange}
              editSelectedFile={editSelectedFile}
              onEditFileChange={handleEditFileChange}
              onSubmitEdit={handleSubmitEdit}
              onCloseEditModal={handleCloseEditModal}
            />
          )}
          {currentView === "reviews" && (
            <ReviewsManagement
              unrepliedReviews={unrepliedReviews}
              replyInputs={replyInputs}
              onReplyChange={handleReplyChange}
              onReplySubmit={handleReplySubmit}
              editingReply={editingReply}
              onStartEditReply={startEditReply}
              editInput={editInput}
              onEditInputChange={(e) => setEditInput(e.target.value)}
              onUpdateReply={handleUpdateReply}
              onDeleteReply={handleDeleteReply}
              onCancelEditReply={cancelEditReply}
            />
          )}
          {currentView === "orders" && (
            <OrdersManagement />
          )}
          {currentView === "reports" && (
            <ReportsManagement />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;