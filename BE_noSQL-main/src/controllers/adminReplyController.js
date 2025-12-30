const AdminReply = require("../models/AdminReply");
const Review = require("../models/Review");
const User = require("../models/User");

// CREATE MULTIPLE REPLIES
exports.createReply = async (req, res) => {
  try {
    const { content } = req.body;
    const reviewId = req.params.reviewId;

    if (!content?.trim())
      return res.status(400).json({ error: "Reply content is required" });

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ error: "Review not found" });

    const reply = new AdminReply({
      reviewId,
      adminId: req.user._id,
      content: content.trim(),
      createdAt: new Date(),
    });

    await reply.save();

    res.status(201).json({
      message: "Admin reply added",
      reply,
    });
  } catch (err) {
    console.error("Create reply error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE REPLY
exports.updateReply = async (req, res) => {
  try {
    const replyId = req.params.replyId;
    const { content } = req.body;

    const reply = await AdminReply.findById(replyId);
    if (!reply) return res.status(404).json({ error: "Reply not found" });

    reply.content = content.trim();
    reply.updatedAt = new Date();
    await reply.save();

    res.json({ message: "Reply updated", reply });
  } catch (err) {
    console.error("Update reply error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE REPLY
exports.deleteReply = async (req, res) => {
  try {
    const replyId = req.params.replyId;
    const reply = await AdminReply.findById(replyId);

    if (!reply) return res.status(404).json({ error: "Reply not found" });

    await reply.deleteOne();

    res.json({ message: "Reply deleted" });
  } catch (err) {
    console.error("Delete reply error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// LIST ALL REPLIES
exports.listReplies = async (req, res) => {
  try {
    const replies = await AdminReply.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "adminId",
          foreignField: "_id",
          as: "admin",
        },
      },
      { $unwind: "$admin" },
      {
        $lookup: {
          from: "reviews",
          localField: "reviewId",
          foreignField: "_id",
          as: "review",
        },
      },
      { $unwind: "$review" },
      {
        $project: {
          _id: 1,
          content: 1,
          createdAt: 1,
          adminName: "$admin.name",
          reviewComment: "$review.comment",
        },
      },
    ]);

    res.json({ total: replies.length, replies });
  } catch (err) {
    console.error("List replies error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET REPLIES OF A REVIEW
exports.getRepliesOfReview = async (req, res) => {
  try {
    const reviewId = req.params.reviewId;

    const replies = await AdminReply.find({ reviewId })
      .populate("adminId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      total: replies.length,
      replies,
    });
  } catch (err) {
    console.error("Get replies of review error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// REVIEWS THAT HAVE NO REPLIES
exports.unrepliedReviews = async (req, res) => {
  try {
    const reviews = await Review.aggregate([
      {
        $lookup: {
          from: "adminreplies",
          localField: "_id",
          foreignField: "reviewId",
          as: "replies",
        },
      },
      { $match: { replies: { $size: 0 } } },
    ]);

    res.json({
      total: reviews.length,
      reviews,
    });
  } catch (err) {
    console.error("Unreplied reviews error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// REVIEWS THAT HAVE REPLIES (Hàm mới - thêm ở cuối file)
exports.repliedReviews = async (req, res) => {
  try {
    // Sử dụng aggregation để lấy reviews có ít nhất 1 reply (không deleted)
    const reviewsWithReplies = await Review.aggregate([
      {
        $lookup: {
          from: 'adminreplies', // Collection name cho AdminReply
          let: { review_id: '$_id' },
          pipeline: [
            { $match: { 
              $expr: { $eq: ['$reviewId', '$$review_id'] },
              isDeleted: { $ne: true } // Lọc replies không deleted
            } },
          ],
          as: 'replies'
        }
      },
      {
        $match: {
          'replies.0': { $exists: true }, // Có ít nhất 1 reply
          isDeleted: { $ne: true } // Lọc review không deleted (nếu Review model có field này)
        }
      },
      {
        $addFields: {
          replyCount: { $size: '$replies' } // Thêm số lượng replies
        }
      },
      {
        $project: {
          replies: 0, // Ẩn chi tiết replies để tối ưu
          // Thêm populate user/product nếu cần (thêm $lookup)
        }
      },
      {
        $sort: { createdAt: -1 } // Sắp xếp mới nhất trước
      }
    ]);

    res.json({
      success: true,
      data: reviewsWithReplies,
      count: reviewsWithReplies.length
    });
  } catch (err) {
    console.error('Lỗi fetch replied reviews:', err);
    res.status(500).json({ error: err.message });
  }
};