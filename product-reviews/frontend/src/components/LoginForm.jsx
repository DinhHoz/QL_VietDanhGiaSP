// src/components/LoginForm.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Thực hiện login
      await login(email, password);

      // Lấy thông tin user sau khi login thành công
      const loggedInUser = JSON.parse(localStorage.getItem("user"));

      if (loggedInUser?.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại Email và Mật khẩu."
      );
    }
  };

  if (isAuthenticated) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "50px",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <h2>Bạn đã đăng nhập rồi!</h2>
        <p>Xin chào, {user?.name || "Người dùng"}.</p>
        <Link
          to="/"
          style={{ color: "#007bff", textDecoration: "none", fontWeight: 500 }}
        >
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#8cbdf1",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          width: 400,
          padding: 40,
          backgroundColor: "#fff",
          borderRadius: 12,
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: 30,
            color: "#34495e",
            fontSize: 28,
          }}
        >
          Đăng Nhập
        </h1>

        {error && (
          <div
            style={{
              backgroundColor: "#e74c3c",
              color: "#fff",
              padding: 12,
              borderRadius: 8,
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                marginBottom: 5,
                fontWeight: 500,
                color: "#555",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: 12,
                marginTop: 6,
                border: "1px solid #ccc",
                borderRadius: 8,
                fontSize: 15,
              }}
            />
          </div>

          <div style={{ marginBottom: 30 }}>
            <label
              style={{
                display: "block",
                marginBottom: 5,
                fontWeight: 500,
                color: "#555",
              }}
            >
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: 12,
                marginTop: 6,
                border: "1px solid #ccc",
                borderRadius: 8,
                fontSize: 15,
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              background: "linear-gradient(90deg, #007bff, #00aaff)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.03)";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            🔐 Đăng Nhập
          </button>

          <p
            style={{
              marginTop: 20,
              fontSize: 14,
              color: "#555",
              textAlign: "center",
            }}
          >
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              style={{ color: "#007bff", textDecoration: "none", fontWeight: 500 }}
            >
              Đăng ký ngay
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
