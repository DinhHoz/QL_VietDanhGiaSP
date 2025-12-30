// src/models/Reply.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReplySchema = new Schema({
  reviewId: { type: Schema.Types.ObjectId, ref: 'Review', required: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // tác giả (user hoặc admin)
  authorRole: { type: String, enum: ['user', 'admin'], default: 'user' }, // phân biệt
  toUserId: { type: Schema.Types.ObjectId, ref: 'User', default: null }, // nếu reply trực tiếp cho 1 user khác
  parentReplyId: { type: Schema.Types.ObjectId, ref: 'Reply', default: null }, // hỗ trợ threading (nếu reply vào reply)
  content: { type: String, required: true, trim: true },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
});

module.exports = mongoose.model('Reply', ReplySchema);
