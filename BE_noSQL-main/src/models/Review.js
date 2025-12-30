// src/models/Review.js
const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  rating: Number,
  comment: String,
  images: { type: [String], default: [] },

  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,

  // ❌ ĐÃ BỎ HOÀN TOÀN
  // adminReplyId: { type: mongoose.Schema.Types.ObjectId, ref: "AdminReply" },

  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
});

module.exports = mongoose.model("Review", ReviewSchema);
