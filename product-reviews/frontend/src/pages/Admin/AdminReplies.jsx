import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:4000";
const API_URL = `${BASE_URL}/api/admin/replies`;
const REPLY_URL = `${BASE_URL}/api/admin/reply`;
const UNREPLIED_URL = `${BASE_URL}/api/admin/unreplied-reviews`;
const REVIEWS_URL = `${BASE_URL}/api/reviews`; // Đổi từ /api/admin/reviews sang /api/reviews (Dùng cho Hard Delete của User)

const AdminReplies = () => {
  const { getToken, user } = useAuth();
  const navigate = useNavigate();

  const [replies, setReplies] = useState([]);
  const [unrepliedReviews, setUnrepliedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editReply, setEditReply] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [newReply, setNewReply] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  // const [deletingId, setDeletingId] = useState(null); // Bỏ biến này vì đã loại bỏ chức năng Gỡ Review (soft delete)

  // === LẤY DỮ LIỆU ===
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      if (!token) throw new Error("Chưa đăng nhập");

      // Lấy danh sách review chưa có phản hồi Admin
      const unrepliedRes = await axios.get(UNREPLIED_URL, { headers: { Authorization: `Bearer ${token}` } });
      // Lấy TẤT CẢ phản hồi Admin đã gửi (dành cho bảng quản lý dưới)
      const repliesRes = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
      
      setUnrepliedReviews(unrepliedRes.data.unrepliedReviews || []);
      setReplies(repliesRes.data.replies || []);
    } catch (err) {
      setError(`Lỗi: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") fetchData();
  }, [user]);

  // === GỬI PHẢN HỒI (CREATE AdminReply) ===
  const sendReply = async () => {
    if (!newReply.trim()) return alert("Nội dung trống!");
    try {
      const token = getToken();
      // POST đến /api/admin/reply/:reviewId
      await axios.post(`${REPLY_URL}/${replyingTo}`, { content: newReply }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Phản hồi thành công!");
      setReplyingTo(null);
      setNewReply("");
      fetchData();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.error || err.message));
    }
  };

  // === SỬA PHẢN HỒI (UPDATE AdminReply) ===
  const handleSaveEdit = async () => {
    if (!editContent.trim()) return alert("Nội dung trống!");
    try {
      const token = getToken();
      // PUT đến /api/admin/reply/:replyKey
      await axios.put(`${REPLY_URL}/${editReply._key}`, { content: editContent }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Cập nhật thành công!");
      setEditReply(null);
      fetchData();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.error || err.message));
    }
  };

  // === XÓA PHẢN HỒI (DELETE AdminReply) ===
  const handleDeleteReply = async (replyId) => {
    if (!window.confirm("Xóa phản hồi này?")) return;
    try {
      const token = getToken();
      // DELETE đến /api/admin/reply/:replyKey
      await axios.delete(`${REPLY_URL}/${replyId}`, { headers: { Authorization: `Bearer ${token}` } });
      alert("Xóa thành công!");
      fetchData();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.error || err.message));
    }
  };

  // ⚠️ ĐÃ XÓA: Hàm handleDeleteReview (chức năng Gỡ Review/Soft Delete)

  const goToProductManagement = () => navigate("/admin");

  if (loading) return <div style={styles.loading}>Đang tải dữ liệu...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>Quản Lý Phản Hồi Admin</h1>
        <button onClick={goToProductManagement} style={styles.btnPrimary}>
          Quản Lý Sản Phẩm
        </button>
      </div>

      {/* REVIEW CHƯA PHẢN HỒI */}
      <section style={styles.section}>
        <h2 style={styles.h2}>
          Review Chưa Phản Hồi ({unrepliedReviews.length})
        </h2>
        {unrepliedReviews.length === 0 ? (
          <div style={styles.successBox}>Tất cả review đã được xử lý!</div>
        ) : (
          <div>
            {unrepliedReviews.map((r) => (
              <div key={r.reviewId} style={styles.card}>
                <img
                  src={
                    r.productImage?.startsWith("http")
                      ? r.productImage
                      : `${BASE_URL}${r.productImage || "/uploads/no-image.jpg"}`
                  }
                  alt={r.productName}
                  style={styles.img}
                  onError={(e) => (e.target.src = "/uploads/no-image.jpg")}
                />
                <div style={styles.cardContent}>
                  <h4 style={styles.productName}>{r.productName || "Sản phẩm đã xóa"}</h4>
                  <p style={styles.info}><strong>Người dùng:</strong> {r.userName || "Khách"}</p>
                  <p style={styles.info}><strong>Đánh giá:</strong> {"★".repeat(r.rating)} ({r.rating} sao)</p>
                  <p style={styles.comment}>"{r.comment || "Không có nội dung"}"</p>
                  <small style={styles.date}>
                    {new Date(r.createdAt).toLocaleString("vi-VN")}
                  </small>

                  {/* FORM PHẢN HỒI */}
                  {replyingTo === r.reviewId ? (
                    <div style={styles.replyForm}>
                      <textarea
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        placeholder="Viết phản hồi..."
                        style={styles.textarea}
                      />
                      <div style={styles.btnGroup}>
                        <button onClick={sendReply} style={styles.btnSuccess}>Gửi</button>
                        <button onClick={() => setReplyingTo(null)} style={styles.btnCancel}>Hủy</button>
                      </div>
                    </div>
                  ) : (
                    <div style={styles.btnGroup}>
                      <button
                        onClick={() => { setReplyingTo(r.reviewId); setNewReply(""); }}
                        style={styles.btnSuccessSmall}
                      >
                        Viết Phản Hồi
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PHẢN HỒI ĐÃ GỬI */}
      <section style={styles.section}>
        <h2 style={styles.h2}>Phản Hồi Đã Gửi ({replies.length})</h2>
        {replies.length === 0 ? (
          <p>Chưa có phản hồi nào.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Mã Reply</th>
                  <th style={styles.th}>Review ID</th>
                  <th style={styles.th}>Nội dung</th>
                  <th style={styles.th}>Ngày</th>
                  <th style={styles.th}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {replies.map((r) => (
                  <tr key={r._key} style={styles.tr}>
                    <td style={styles.td}>{r._key}</td>
                    <td style={styles.td}>{r.reviewId}</td>
                    <td style={styles.td}>
                      {editReply?._key === r._key ? (
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          style={styles.textarea}
                        />
                      ) : (
                        <div>
                          <div style={{ whiteSpace: "pre-wrap", maxWidth: 400 }}>{r.content}</div>
                          <small style={styles.reviewNote}>
                            Review: {r.reviewComment || "Đã bị gỡ"}
                          </small>
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>{new Date(r.createdAt).toLocaleString("vi-VN")}</td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      {editReply?._key === r._key ? (
                        <>
                          <button onClick={handleSaveEdit} style={styles.btnSuccessSmall}>Lưu</button>
                          <button onClick={() => setEditReply(null)} style={styles.btnCancelSmall}>Hủy</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditReply(r); setEditContent(r.content); }} style={styles.btnEditSmall}>Sửa</button>
                          <button onClick={() => handleDeleteReply(r._key)} style={styles.btnDeleteSmall}>Xóa</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

// === STYLES ===
const styles = {
  container: { padding: "30px", fontFamily: "'Segoe UI', sans-serif", maxWidth: "1400px", margin: "0 auto", background: "#f5f7fa" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  title: { fontSize: "30px", margin: 0, color: "#2c3e50", borderBottom: "4px solid #3498db", paddingBottom: "10px" },
  btnPrimary: { background: "#3498db", color: "white", padding: "12px 24px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "16px", boxShadow: "0 4px 10px rgba(52,152,219,0.3)" },

  loading: { textAlign: "center", padding: "60px", fontSize: "20px", color: "#7f8c8d" },
  error: { color: "#e74c3c", textAlign: "center", padding: "30px", background: "#fadbd8", borderRadius: "10px" },

  section: { marginBottom: "50px" },
  h2: { color: "#2c3e50", fontSize: "24px", margin: "0 0 20px" },

  successBox: { padding: "25px", background: "#d5f5e3", borderRadius: "12px", textAlign: "center", fontWeight: "bold", color: "#27ae60", fontSize: "18px" },

  card: {
    border: "1px solid #ddd",
    padding: "18px",
    margin: "15px 0",
    borderRadius: "14px",
    background: "#fff",
    boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
    display: "flex",
    gap: "18px",
    alignItems: "flex-start",
    transition: "all 0.3s",
  },
  img: { width: 80, height: 80, objectFit: "cover", borderRadius: 12, border: "2px solid #eee" },
  cardContent: { flex: 1 },
  productName: { margin: "0 0 8px", fontSize: "18px", color: "#2c3e50", fontWeight: "bold" },
  info: { margin: "5px 0", fontSize: "14.5px", color: "#34495e" },
  comment: { margin: "10px 0", fontStyle: "italic", color: "#555", background: "#f8f9fa", padding: "10px", borderRadius: "8px" },
  date: { color: "#7f8c8d", fontSize: "13px" },

  replyForm: { marginTop: "16px" },
  textarea: { width: "100%", minHeight: "100px", padding: "12px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "15px", fontFamily: "inherit" },
  btnGroup: { marginTop: "10px", display: "flex", gap: "10px", justifyContent: "flex-end" },

  btnSuccess: { background: "#27ae60", color: "white", padding: "9px 18px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  btnSuccessSmall: { ...this?.btnSuccess, padding: "7px 14px", fontSize: "13.5px" },
  btnCancel: { background: "#95a5a6", color: "white", padding: "9px 18px", border: "none", borderRadius: "8px", cursor: "pointer" },
  btnCancelSmall: { ...this?.btnCancel, padding: "7px 14px", fontSize: "13.5px" },
  btnEditSmall: { background: "#f39c12", color: "white", padding: "7px 14px", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13.5px" },
  btnDeleteSmall: { background: "#e74c3c", color: "white", padding: "7px 14px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "13.5px" },
  // Đã loại bỏ btnDeleteDisabled

  tableWrapper: { overflowX: "auto", borderRadius: "12px", boxShadow: "0 6px 16px rgba(0,0,0,0.1)" },
  table: { width: "100%", borderCollapse: "collapse", background: "white" },
  thRow: { background: "#2c3e50", color: "white" },
  th: { padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "15px" },
  tr: { borderBottom: "1px solid #eee" },
  td: { padding: "14px", verticalAlign: "top", fontSize: "14px" },
  reviewNote: { color: "#95a5a6", fontSize: "12.5px" },
};

export default AdminReplies;