import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../services/api"; // Giả định

const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    isAdmin: false, // Admin checkbox
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (formData.password.length < 6) {
      setIsError(true);
      setMessage("Mật khẩu phải ít nhất 6 ký tự.");
      return;
    }

    try {
      const res = await apiClient.post("/auth/register", formData);
      setMessage(res.data.message || "Đăng ký thành công!");
      setFormData({ name: "", email: "", password: "", isAdmin: false });

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.msg || "Đăng ký thất bại, vui lòng thử lại.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#8cbdf1",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: 40,
          borderRadius: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: 400,
          textAlign: "center",
        }}
      >
        <h2>Đăng Ký Tài Khoản</h2>

        {message && (
          <p
            style={{
              color: isError ? "red" : "green",
              marginBottom: 15,
              fontWeight: 500,
            }}
          >
            {message}
          </p>
        )}

        <div style={{ marginBottom: 15, textAlign: "left" }}>
          <label style={{ fontWeight: 500, color: "#333" }}>Họ Tên</label>
          <input
            type="text"
            name="name"
            placeholder="Tên của bạn"
            value={formData.name}
            onChange={handleChange}
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

        <div style={{ marginBottom: 15, textAlign: "left" }}>
          <label style={{ fontWeight: 500, color: "#333" }}>Email</label>
          <input
            type="email"
            name="email"
            placeholder="example@email.com"
            value={formData.email}
            onChange={handleChange}
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

        <div style={{ marginBottom: 20, textAlign: "left" }}>
          <label style={{ fontWeight: 500, color: "#333" }}>Mật khẩu</label>
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu (ít nhất 6 ký tự)"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
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

        {/* Admin checkbox */}
        <div style={{ marginBottom: 25, textAlign: "left" }}>
          <label style={{ display: "flex", alignItems: "center", fontSize: 14, color: "#555", cursor: "pointer" }}>
            <input
              type="checkbox"
              name="isAdmin"
              checked={formData.isAdmin}
              onChange={handleChange}
              style={{ marginRight: 10, transform: "scale(1.2)" }}
            />
            Đăng ký quyền Admin (Dev/Test)
          </label>
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
          Đăng Ký
        </button>

        <p style={{ marginTop: 20, fontSize: 14, color: "#555" }}>
          Đã có tài khoản?{" "}
          <Link to="/login" style={{ color: "#007bff", textDecoration: "none", fontWeight: 600 }}>
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterForm;
