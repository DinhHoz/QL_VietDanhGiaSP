// src/models/AdminReply.js (Updated với timestamps để tự động handle createdAt/updatedAt)
const mongoose = require("mongoose");

const AdminReplySchema = new mongoose.Schema(
  {
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      required: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true, // Tự động quản lý createdAt và updatedAt (override nếu cần)
  }
);

module.exports = mongoose.model("AdminReply", AdminReplySchema);
