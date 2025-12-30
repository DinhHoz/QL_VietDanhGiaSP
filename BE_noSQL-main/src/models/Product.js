// src/models/Product.js
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  images: { type: [String], default: [] },

  // Thêm trường số lượng tồn kho
  stock: {
    type: Number,
    default: 0, // mặc định 0 nếu chưa nhập hàng
    min: 0, // không cho stock < 0
  },

  meta: {
    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },

  reviews: { type: Array, default: [] }, // store small summary of reviews

  // 🔥 Soft delete
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
});

module.exports = mongoose.model("Product", ProductSchema);
