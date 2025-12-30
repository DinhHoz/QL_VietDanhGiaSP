import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

export default function UserReviewedProducts() {
  const { userKey } = useParams(); // URL: /user/:userKey/reviews
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userKey) return;

    const fetchReviews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get(`/reviews/user/${userKey}/products`);
        if (Array.isArray(res.data?.data)) {
          setReviews(res.data.data);
        } else {
          setError("Dữ liệu trả về không hợp lệ.");
          setReviews([]);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Không thể tải danh sách sản phẩm đã đánh giá.");
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [userKey]);

  if (isLoading)
    return (
      <div style={{ textAlign: "center", padding: 40, fontSize: 18 }}>
        🔄 Đang tải dữ liệu...
      </div>
    );

  if (error)
    return (
      <div style={{ textAlign: "center", padding: 40, color: "red" }}>
        ❌ {error}
      </div>
    );

  if (!reviews.length)
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        😔 Bạn chưa đánh giá sản phẩm nào.
      </div>
    );

  return (
    <div
      style={{
        backgroundColor: "#f9f9f9",
        minHeight: "100vh",
        padding: "40px 5%",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: 30,
          fontWeight: "700",
          color: "#222",
          marginBottom: 30,
        }}
      >
        Danh sách sản phẩm bạn đã đánh giá
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 24,
        }}
      >
        {reviews.map((item) => {
          const image =
            item.images?.[0] ||
            "https://via.placeholder.com/300x300?text=No+Image";

          const reviewKey = item.reviewId || item._id;

          return (
            <div
              key={reviewKey}
              style={{
                border: "1px solid #eee",
                borderRadius: 16,
                overflow: "hidden",
                background: "#fff",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 16px rgba(0,0,0,0.08)";
              }}
            >
              {/* Ảnh sản phẩm */}
              <div
                style={{
                  position: "relative",
                  background: "#fafafa",
                  overflow: "hidden",
                }}
              >
                <img
                  src={image}
                  alt={item.productName}
                  style={{
                    width: "100%",
                    height: 220,
                    objectFit: "contain",
                    padding: 12,
                    transition: "transform 0.4s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.08)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                  onError={(e) =>
                    (e.target.src =
                      "https://via.placeholder.com/300x300?text=Image+Error")
                  }
                />
              </div>

              {/* Nội dung */}
              <div style={{ padding: "16px 18px" }}>
                <h3
                  style={{
                    fontSize: 18,
                    marginBottom: 8,
                    fontWeight: "600",
                    color: "#333",
                  }}
                >
                  {item.productName}
                </h3>
                <p style={{ fontSize: 14, color: "#555", marginBottom: 6 }}>
                  ⭐ <b>Đánh giá:</b> {item.rating}/5
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: "#444",
                    fontStyle: "italic",
                    marginBottom: 8,
                  }}
                >
                  💬 “{item.comment}”
                </p>
                <p style={{ fontSize: 13, color: "#777" }}>
                  📅 {new Date(item.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>

              {/* Nút xem chi tiết */}
              <div style={{ textAlign: "center", padding: "12px 0 16px" }}>
                <Link
                  to={`/product/${item.productId}`}
                  style={{
                    display: "inline-block",
                    padding: "8px 16px",
                    background:
                      "linear-gradient(135deg, #007bff 0%, #0056d2 100%)",
                    color: "#fff",
                    borderRadius: 8,
                    textDecoration: "none",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
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
