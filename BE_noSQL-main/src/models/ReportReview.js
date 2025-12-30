// src/models/ReportReview.js
const mongoose = require("mongoose");

const reportReviewSchema = new mongoose.Schema({
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review",
    required: true,
  },
  reportedBy: { // Người ĐI báo cáo (req.user._id)
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // 👇 THÊM TRƯỜNG NÀY: Người BỊ báo cáo (Tác giả review)
  reportedUser: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, 
  },
  reason: {
    type: String,
    enum: ["not_related", "sensitive_image", "spam", "abusive", "other"],
    required: true,
  },
  description: { type: String, default: "" },
  handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Phải có dòng này
  status: {
    type: String,
    enum: ["pending", "resolved", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ReportReview", reportReviewSchema);