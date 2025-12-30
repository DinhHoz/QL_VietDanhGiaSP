// Updated: src/components/ProductList.jsx (Added search functionality with URL params)
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || ''); // Read from URL
  const navigate = useNavigate();

  // ================== LOAD SẢN PHẨM (WITH SEARCH) ==================
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }

    api
      .get(`/api/products?${params.toString()}`) // Add search param to API call
      .then((res) => {
        if (Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          setError("Dữ liệu API trả về không hợp lệ.");
        }
      })
      .catch((err) => {
        console.error("Lỗi gọi API /api/products:", err);
        setError("Không thể tải sản phẩm. Kiểm tra Backend.");
      })
      .finally(() => setIsLoading(false));
  }, [searchQuery]); // Re-fetch when searchQuery changes

  // ================== HANDLE SEARCH SUBMIT ==================
  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedQuery = e.target.search.value.trim();
    if (trimmedQuery) {
      setSearchQuery(trimmedQuery);
      setSearchParams({ search: trimmedQuery });
    } else {
      // Clear search
      setSearchQuery('');
      setSearchParams({}); // Clear URL params
    }
  };

  // ================== NÚT XEM SẢN PHẨM ĐÃ ĐÁNH GIÁ ==================
  const handleViewReviewedProducts = () => {
    const storedUser = localStorage.getItem("user");
    let userId = null;

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        userId = parsed._id; // backend dùng _id
      } catch (err) {
        console.error("Lỗi parse user:", err);
      }
    }

    if (!userId) {
      alert("Vui lòng đăng nhập để xem sản phẩm đã đánh giá!");
      navigate("/login");
      return;
    }

    navigate(`/user/${userId}/reviews`);
  };

  // ================== UI LOADING / ERROR ==================
  if (isLoading)
    return (
      <div style={{ padding: 40, textAlign: "center", fontSize: 18 }}>
        🔄 Đang tải danh sách sản phẩm...
      </div>
    );

  if (error)
    return (
      <div style={{ padding: 40, textAlign: "center", color: "red" }}>
        ❌ Lỗi: {error}
      </div>
    );

  if (products.length === 0)
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        {searchQuery ? (
          <>
            <p>😔 Không tìm thấy sản phẩm nào với "{searchQuery}".</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setSearchParams({}); // Clear URL
              }} 
              style={{ 
                marginTop: 10, 
                padding: "8px 16px", 
                background: "#6c757d", 
                color: "white", 
                border: "none", 
                borderRadius: 4, 
                cursor: "pointer" 
              }}
            >
              Xóa tìm kiếm và xem tất cả
            </button>
          </>
        ) : (
          <p>😔 Chưa có sản phẩm nào.</p>
        )}
      </div>
    );

  // ================== MAIN UI ==================
  return (
    <div
      style={{
        backgroundColor: "#fefeff",
        minHeight: "100vh",
        padding: "40px 5%",
      }}
    >
      {/* HEADER + SEARCH FORM + BUTTON */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 20,
          marginBottom: 30,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, flex: 1 }}>
          <h1
            style={{
              fontSize: 32,
              color: "#222",
              fontWeight: "700",
              margin: 0,
            }}
          >
            Danh sách sản phẩm ({products.length})
          </h1>
          {searchQuery && (
            <span style={{ color: "#666", fontSize: 14 }}>
              - Tìm kiếm: "{searchQuery}"
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* Search Form */}
          <form onSubmit={handleSearch} style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              name="search"
              placeholder="Tìm kiếm sản phẩm..."
              defaultValue={searchQuery}
              style={{
                padding: "10px 15px",
                border: "1px solid #ddd",
                borderRadius: 8,
                minWidth: 250,
                fontSize: 14,
              }}
            />
            <button
              type="submit"
              style={{
                padding: "10px 15px",
                background: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Tìm
            </button>
          </form>

          <button
            onClick={handleViewReviewedProducts}
            style={{
              background: "linear-gradient(135deg, #28a745, #218838)",
              color: "#fff",
              padding: "10px 18px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontWeight: "500",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease",
            }}
          >
            ⭐ Sản phẩm đã đánh giá
          </button>
        </div>
      </div>

      {/* GRID PRODUCTS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 24,
        }}
      >
        {products.map((p) => {
          const imageUrl = p.image || "https://via.placeholder.com/300?text=No+Image";

          return (
            <div
              key={p._id} // dùng _id từ backend
              style={{
                border: "1px solid #eee",
                borderRadius: 16,
                overflow: "hidden",
                background: "#fff",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
              }}
            >
              {/* IMAGE */}
              <div style={{ backgroundColor: "#fafafa" }}>
                <img
                  src={imageUrl}
                  alt={p.name}
                  style={{
                    width: "100%",
                    height: 240,
                    objectFit: "contain",
                    padding: 16,
                  }}
                  onError={(e) =>
                    (e.target.src =
                      "https://via.placeholder.com/300?text=Image+Not+Found")
                  }
                />
              </div>

              {/* INFO */}
              <div style={{ padding: "16px 18px" }}>
                <h3 style={{ fontSize: 18, marginBottom: 8, fontWeight: 600 }}>
                  {p.name}
                </h3>

                <p style={{ color: "#666", fontSize: 14, minHeight: 40 }}>
                  {p.description}
                </p>

                <p>
                  <b>Giá:</b>{" "}
                  <span style={{ color: "#d32f2f", fontWeight: 600 }}>
                    {p.price?.toLocaleString("vi-VN")}₫
                  </span>
                </p>

                <p style={{ fontSize: 14, color: "#777" }}>
                  ⭐ <b>Đánh giá TB:</b> {p.meta?.avgRating ?? "Chưa có"}
                </p>
              </div>

              {/* BUTTON */}
              <div style={{ textAlign: "center", paddingBottom: 16 }}>
                <Link
                  to={`/product/${p._id}`} // đúng route detail
                  style={{
                    padding: "10px 20px",
                    background: "linear-gradient(135deg, #007bff, #0056d2)",
                    color: "#fff",
                    borderRadius: 8,
                    textDecoration: "none",
                    fontWeight: "500",
                  }}
                >
                  🔍 Xem chi tiết
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}