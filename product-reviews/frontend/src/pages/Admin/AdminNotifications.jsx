import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:4000";

const AdminNotifications = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = getToken();

      const res = await axios.get(`${BASE_URL}/api/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading)
    return (
      <div style={{ padding: 30, fontSize: 18 }}>Đang tải thông báo...</div>
    );

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h1 style={styles.title}>Thông báo</h1>

        {/* Nút quay lại trang admin */}
        <button onClick={() => navigate("/admin")} style={styles.btnBack}>
          ⬅ Quay lại quản lý
        </button>
      </div>

      {notifications.length === 0 && (
        <div style={styles.empty}>Không có thông báo nào.</div>
      )}

      {notifications.map((n) => (
        <div
          key={n._key}
          style={styles.card}
          onClick={() => navigate("/admin/replies")}
        >
          <div style={styles.left}>
            <div style={styles.badge}>
              ✏️ Review mới
            </div>

            <h3 style={styles.msg}>{n.message}</h3>

            <p style={styles.detail}>
              <strong>Người dùng:</strong> {n.userName}
            </p>

            <div style={styles.time}>
              {new Date(n.createdAt).toLocaleString("vi-VN")}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  btnBack: {
    padding: "10px 16px",
    background: "#3498db",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: "bold",
  },
  title: { fontSize: 26, fontWeight: "bold" },
  empty: {
    padding: 20,
    background: "#f3f6ff",
    borderRadius: 10,
    fontSize: 16,
  },
  card: {
    background: "#f2f7ff",
    border: "1px solid #dbe5ff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    cursor: "pointer",
    transition: "0.2s",
  },
  left: { flex: 1 },
  badge: {
    display: "inline-block",
    background: "#3f8cff",
    color: "white",
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: 13,
    marginBottom: 10,
  },
  msg: { margin: "5px 0 10px", fontSize: 18, fontWeight: 600 },
  detail: { margin: "5px 0", fontSize: 14.5 },
  time: { marginTop: 8, fontSize: 13, color: "#777" },
};

export default AdminNotifications;
