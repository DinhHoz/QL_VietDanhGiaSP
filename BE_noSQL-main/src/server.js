const express = require("express");
const cors = require("cors"); // ⭐ THÊM IMPORT CORS
const app = express();
const connectDB = require("./config/db");
const path = require("path");
require("dotenv").config();

// connect db
connectDB();

//  CORS MIDDLEWARE - THÊM ĐÂY (CHO PHÉP FRONTEND 5173 GỌI)
app.use(
  cors({
    origin: "http://localhost:5173", // Origin frontend Vite
    credentials: true, // Hỗ trợ token/cookie
    methods: ["GET", "PATCH", "POST", "PUT", "DELETE", "OPTIONS"], // Methods cần
    allowedHeaders: ["Content-Type", "Authorization"], // Headers token/form-data
  })
);

// middlewares khác (giữ nguyên)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// expose uploads statically
// app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// routes (giữ nguyên)
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/admin", require("./routes/adminReplies"));
app.use("/api", require("./routes/userRoutes"));
const orderRoutes = require("./routes/orderRoutes");

//  MOUNT ROUTE CART - THÊM MỚI (để tránh crash, đảm bảo src/routes/cart.js tồn tại)
const cartRoutes = require("./routes/cart");
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
// simple home
app.get("/", (req, res) => res.send("Product Review System API"));
const repliesRouter = require("./routes/replies");
app.use("/api/replies", repliesRouter);
//  MOUNT ROUTE REVIEWS-BY-MONTH
const reviewsByMonthRoutes = require("./routes/reviews-by-month");
app.use("/api/admin", reviewsByMonthRoutes); // Mount chung với admin để thống nhất

const reportReviewRoutes = require("./routes/reportRoutes");
app.use("/api/reports", reportReviewRoutes);

//  THÊM 404 HANDLER (xử lý route không tồn tại)
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

//  THÊM GLOBAL ERROR HANDLER (xử lý lỗi chung, ví dụ middleware crash)
app.use((err, req, res, next) => {
  console.error("Global error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// start
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
