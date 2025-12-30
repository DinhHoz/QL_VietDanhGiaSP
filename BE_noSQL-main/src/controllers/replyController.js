// src/controllers/replyController.js
const Reply = require('../models/Reply');
const Review = require('../models/Review');
const User = require('../models/User');
const AdminReply = require('../models/AdminReply'); // giữ để không mất dữ liệu cũ

// Tạo reply (user trả lời review hoặc trả lời 1 reply)
exports.createReply = async (req, res) => {
  try {
    const { content, parentReplyId, toUserId } = req.body;
    const reviewId = req.params.reviewId;
    const user = req.user;

    if (!content?.trim()) return res.status(400).json({ error: 'Nội dung reply bắt buộc' });

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ error: 'Review không tồn tại' });

    const reply = new Reply({
      reviewId,
      authorId: user._id,
      authorRole: user.role === 'admin' ? 'admin' : 'user',
      toUserId: toUserId || null,
      parentReplyId: parentReplyId || null,
      content: content.trim(),
    });

    await reply.save();

    // (Tuỳ chọn) bạn có thể push vào review.replies nếu muốn có cached list
    // await Review.findByIdAndUpdate(reviewId, { $push: { replies: { ... } } });

    res.status(201).json({ success: true, reply });
  } catch (err) {
    console.error('Create user reply error', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Lấy replies của 1 review (kết hợp admin replies cũ + user replies mới)
exports.getRepliesOfReview = async (req, res) => {
  try {
    const reviewId = req.params.reviewId;

    // Lấy replies mới (Reply model)
    const userReplies = await Reply.find({ reviewId, isDeleted: { $ne: true } })
      .populate('authorId', 'name role')
      .populate('toUserId', 'name')
      .sort({ createdAt: 1 }) // sắp xếp theo thời gian (cũ -> mới) cho thread
      .lean();

    // Lấy admin replies cũ nếu bạn muốn vẫn show (từ AdminReply)
    const adminReplies = await AdminReply.find({ reviewId })
      .populate('adminId', 'name')
      .sort({ createdAt: 1 })
      .lean();

    res.json({ success: true, data: { userReplies, adminReplies } });
  } catch (err) {
    console.error('Get replies of review error', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update reply (chỉ tác giả hoặc admin)
exports.updateReply = async (req, res) => {
  try {
    const replyId = req.params.replyId;
    const { content } = req.body;
    const user = req.user;

    const reply = await Reply.findById(replyId);
    if (!reply) return res.status(404).json({ error: 'Reply not found' });

    // Kiểm tra quyền: tác giả hoặc admin
    if (!reply.authorId.equals(user._id) && user.role !== 'admin') {
      return res.status(403).json({ error: 'No permission' });
    }

    reply.content = content?.trim() || reply.content;
    reply.updatedAt = new Date();
    await reply.save();

    res.json({ success: true, reply });
  } catch (err) {
    console.error('Update reply error', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete reply (soft delete) - tác giả hoặc admin
exports.deleteReply = async (req, res) => {
  try {
    const replyId = req.params.replyId;
    const user = req.user;

    const reply = await Reply.findById(replyId);
    if (!reply) return res.status(404).json({ error: 'Reply not found' });

    if (!reply.authorId.equals(user._id) && user.role !== 'admin') {
      return res.status(403).json({ error: 'No permission' });
    }

    reply.isDeleted = true;
    await reply.save();

    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    console.error('Delete reply error', err);
    res.status(500).json({ error: 'Server error' });
  }
};
