// src/components/RepliedReviews.jsx
import React, { useEffect, useState } from "react";
import { FaTrash, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import api from "../utils/api";
import "./ReviewsManagement.css";

const RepliedReviews = ({ repliedReviews, repliedLoading }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- For editing a reply ---
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editContent, setEditContent] = useState("");

  // --- New reply per review ---
  const [newReply, setNewReply] = useState({});

  // Load initial data
  useEffect(() => {
    populate(repliedReviews);
  }, [repliedReviews]);

  // Expand review data (user, product, replies)
  const populate = async (raw) => {
    if (!raw || raw.length === 0) {
      setRows([]);
      return;
    }

    setLoading(true);
    try {
      const data = await Promise.all(
        raw.map(async (rv) => {
          let userName = "Người dùng ẩn danh";
          let productName = "Không xác định";

          try {
            if (rv.userId) {
              const u = await api.get(`/users/${rv.userId}`);
              userName =
                u.data.name || u.data.username || u.data.fullName || userName;
            }
          } catch { }

          try {
            if (rv.productId) {
              const p = await api.get(`/products/${rv.productId}`);
              productName = p.data.name || productName;
            }
          } catch { }

          let replies = [];
          try {
            const res = await api.get(`/admin/replies/review/${rv._id}`);
            replies = res.data.replies || [];
          } catch { }

          return { ...rv, userName, productName, replies };
        })
      );

      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  // START edit
  const startEdit = (reply) => {
    setEditingReplyId(reply._id);
    setEditContent(reply.content);
  };

  // CANCEL edit
  const cancelEdit = () => {
    setEditingReplyId(null);
    setEditContent("");
  };

  // SAVE updated reply
  const saveEdit = async (replyId) => {
    if (!editContent.trim()) return alert("Nội dung không được trống!");

    try {
      await api.put(`/admin/reply/${replyId}`, { content: editContent });

      // reload table
      const res = await api.get("/admin/replied-reviews");
      populate(res.data.data);

      cancelEdit();
    } catch (err) {
      console.error(err);
      alert("Không thể cập nhật reply");
    }
  };

  // DELETE reply
  const deleteReply = async (replyId) => {
    if (!window.confirm("Bạn có chắc muốn xóa reply này?")) return;

    try {
      await api.delete(`/admin/reply/${replyId}`);

      const res = await api.get("/admin/replied-reviews");
      populate(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Không thể xóa reply");
    }
  };

  // ADD new reply
  const addReply = async (reviewId) => {
    const content = newReply[reviewId]?.trim();
    if (!content) return alert("Nội dung không được trống!");

    try {
      await api.post(`/admin/reply/${reviewId}`, { content });

      setNewReply((prev) => ({ ...prev, [reviewId]: "" }));

      const res = await api.get("/admin/replied-reviews");
      populate(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Không gửi được reply mới");
    }
  };

  // initials
  const initials = (name) => {
    const p = name.trim().split(" ");
    if (p.length >= 2) return (p[0][0] + p[p.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      {repliedLoading || loading ? (
        <div className="loading-state-card">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="empty-state-card">
          <p>Không có review nào đã được phản hồi</p>
        </div>
      ) : (
        <div className="review-table-wrapper">
          <table className="review-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Sản phẩm</th>
                <th>Điểm</th>
                <th>Đánh giá</th>
                <th>Phản hồi của Admin</th>
                <th>Thêm phản hồi mới</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((rv) => (
                <tr key={rv._id}>
                  {/* USER */}
                  <td>
                    <div className="user-cell">
                      <div className="user-badge">{initials(rv.userName)}</div>
                      <span>{rv.userName}</span>
                    </div>
                  </td>

                  {/* PRODUCT */}
                  <td>{rv.productName}</td>

                  {/* RATING */}
                  <td>{rv.rating}/5 ⭐</td>

                  {/* COMMENT */}
                  <td className="comment-cell">{rv.comment}</td>

                  {/* REPLIES (EDIT + DELETE) */}
                  <td className="reply-cell">
                    {rv.replies.map((rp) => (
                      <div key={rp._id} className="reply-wrapper">
                        {editingReplyId === rp._id ? (
                          <>
                            <textarea
                              className="edit-reply-textarea"
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                            />

                            <div className="edit-reply-actions">
                              <button
                                className="save-reply-btn"
                                onClick={() => saveEdit(rp._id)}
                              >
                                <FaSave /> Lưu
                              </button>
                              <button
                                className="cancel-reply-btn"
                                onClick={cancelEdit}
                              >
                                <FaTimes /> Hủy
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="reply-text">{rp.content}</div>

                            <div className="action-cell" style={{ marginTop: 6 }}>
                              <button
                                className="icon-btn reply-btn-icon"
                                onClick={() => startEdit(rp)}
                                title="Sửa reply"
                              >
                                <FaEdit />
                              </button>

                              <button
                                className="icon-btn delete-btn"
                                onClick={() => deleteReply(rp._id)}
                                title="Xóa reply"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </td>

                  {/* ADD NEW REPLY */}
                  <td>
                    <textarea
                      className="new-reply-textarea"
                      placeholder="Nhập reply..."
                      value={newReply[rv._id] || ""}
                      onChange={(e) =>
                        setNewReply((p) => ({
                          ...p,
                          [rv._id]: e.target.value,
                        }))
                      }
                    />

                    <button
                      className="submit-reply-btn"
                      onClick={() => addReply(rv._id)}
                    >
                      Gửi
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default RepliedReviews;
