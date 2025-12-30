// src/controllers/reviewController.js
const Review = require("../models/Review");
const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order"); // <--- THÊM IMPORT ORDER
const AdminReply = require("../models/AdminReply");
const Reply = require('../models/Reply'); 
const fs = require("fs");
const path = require("path");

// ================== HELPER ==================
const deleteFileIfLocal = (p) => {
  if (!p) return;
  if (p.startsWith("/uploads/reviews") || p.startsWith("/uploads/products")) {
    const abs = path.join(__dirname, "..", p);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  }
};

async function updateProductMeta(productId) {
  const agg = await Review.aggregate([
    { $match: { productId, isDeleted: { $ne: true }, rating: { $ne: null } } },
    {
      $group: {
        _id: "$productId",
        avg: { $avg: "$rating" },
        total: { $sum: 1 },
      },
    },
  ]);
  const stats = agg[0] || { avg: 0, total: 0 };
  await Product.findByIdAndUpdate(productId, {
    "meta.avgRating": Math.round((stats.avg || 0) * 10) / 10,
    "meta.totalReviews": stats.total || 0,
  });
  return stats;
}

// ================== CREATE REVIEW ==================
exports.create = async (req, res) => {
  console.log("FILES:", req.files);
  console.log("BODY:", req.body);
  try {
    const { productId, rating, comment } = req.body;
    const user = req.user;

    // 1. Validate input cơ bản
    if (!productId || !comment?.trim()) {
      (req.files || []).forEach((f) =>
        fs.unlinkSync(path.join(__dirname, "..", f.path))
      );
      return res.status(400).json({ error: "Thiếu productId hoặc nội dung đánh giá" });
    }

    // ⭐ 2. CHECK: ĐÃ MUA HÀNG VÀ ĐƠN HÀNG ĐÃ HOÀN THÀNH CHƯA?
    // Giả sử Model Order có trường 'items.product' và 'status'
    const hasPurchased = await Order.findOne({
      user: user._id,                // Của user đang đăng nhập
      "items.product": productId,    // Có chứa sản phẩm này
      status: "completed"            // Trạng thái đơn hàng là đã hoàn thành
    });

    if (!hasPurchased) {
      // Xóa ảnh vừa upload nếu check thất bại để tránh rác server
      (req.files || []).forEach((f) =>
        fs.unlinkSync(path.join(__dirname, "..", f.path))
      );
      return res.status(403).json({ 
        error: "Bạn cần mua sản phẩm này và đơn hàng đã hoàn thành để viết đánh giá." 
      });
    }

    //  (Optional) CHECK: ĐÃ ĐÁNH GIÁ CHƯA? (Nếu muốn chặn spam 1 người review nhiều lần)
    /*
    const existingReview = await Review.findOne({ productId, userId: user._id, isDeleted: false });
    if (existingReview) {
       (req.files || []).forEach((f) => fs.unlinkSync(path.join(__dirname, "..", f.path)));
       return res.status(400).json({ error: "Bạn đã đánh giá sản phẩm này rồi." });
    }
    */

    // 3. Xử lý ảnh
    const imagePaths = (req.files || []).map(
      (f) => `/uploads/reviews/${f.filename}`
    );

    // 4. Tạo Review
    const review = new Review({
      productId,
      userId: user._id,
      rating: parseInt(rating),
      comment: comment.trim(),
      images: imagePaths,
    });
    await review.save();

    // 5. Cập nhật mảng reviews trong Product (Denormalization)
    await Product.findByIdAndUpdate(productId, {
      $push: {
        reviews: {
          reviewId: review._id,
          userId: user._id,
          userName: user.name || "User",
          rating: review.rating,
          comment: review.comment,
          images: review.images,
          createdAt: review.createdAt,
        },
      },
    });

    // 6. Tính toán lại rating trung bình
    await updateProductMeta(productId);

    res.status(201).json({ message: "Đánh giá thành công", review });
  } catch (err) {
    console.error("Create review error", err);
    // Cleanup ảnh nếu lỗi server
    (req.files || []).forEach((f) => {
      try {
        fs.unlinkSync(path.join(__dirname, "..", f.path));
      } catch {}
    });
    res.status(500).json({ error: "Lỗi server khi tạo đánh giá" });
  }
};

// ================== UPDATE REVIEW ==================
exports.update = async (req, res) => {
  // ... (Giữ nguyên code cũ)
  console.log("FILES:", req.files);
  console.log("BODY:", req.body);
  try {
    const rid = req.params.reviewId;
    const { rating, comment, existingImages } = req.body;
    const user = req.user;

    const review = await Review.findById(rid);
    if (!review) return res.status(404).json({ error: "Not found" });
    if (!review.userId.equals(user._id) && user.role !== "admin")
      return res.status(403).json({ error: "No permission" });

    let keep = [];
    try {
      keep = JSON.parse(existingImages || "[]");
    } catch {}

    const newImgs = (req.files || []).map(
      (f) => `/uploads/reviews/${f.filename}`
    );
    const finalImages = [...keep, ...newImgs];

    (review.images || []).forEach((img) => {
      if (!keep.includes(img)) deleteFileIfLocal(img);
    });

    const oldRating = review.rating;
    review.rating = parseInt(rating);
    review.comment = comment.trim();
    review.images = finalImages;
    review.updatedAt = new Date();
    await review.save();

    await Product.updateOne(
      { _id: review.productId, "reviews.reviewId": review._id },
      {
        $set: {
          "reviews.$.rating": review.rating,
          "reviews.$.comment": review.comment,
          "reviews.$.images": review.images,
        },
      }
    );

    if (oldRating !== review.rating) await updateProductMeta(review.productId);

    res.json({ message: "Updated", review });
  } catch (err) {
    console.error("Update review error", err);
    (req.files || []).forEach((f) => {
      try {
        fs.unlinkSync(path.join(__dirname, "..", f.path));
      } catch {}
    });
    res.status(500).json({ error: "Server error" });
  }
};

// ================== DELETE REVIEW ==================
exports.delete = async (req, res) => {
  // ... (Giữ nguyên code cũ)
  try {
    const rid = req.params.reviewId;
    const user = req.user;
    const review = await Review.findById(rid);
    if (!review) return res.status(404).json({ error: "Not found" });
    if (!review.userId.equals(user._id) && user.role !== "admin")
      return res.status(403).json({ error: "No permission" });

    (review.images || []).forEach(deleteFileIfLocal);
    await review.deleteOne();
    await AdminReply.deleteMany({ reviewId: rid });
    await Product.updateOne(
      { _id: review.productId },
      { $pull: { reviews: { reviewId: review._id } } }
    );

    await updateProductMeta(review.productId);

    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("Delete review error", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ================== GET REVIEWS BY PRODUCT ==================
exports.getByProduct = async (req, res) => {
   // ... (Giữ nguyên code cũ)
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const rawReviews = product.reviews || [];
    const results = [];

    for (const rev of rawReviews) {
      const full = await Review.findById(rev.reviewId).lean();
      if (!full || full.isDeleted) continue;

      let userName = "User";
      const user = await User.findById(full.userId).lean();
      if (user) userName = user.name;

      const adminReplies = await AdminReply.find({
        reviewId: full._id,
      })
        .populate("adminId", "name")
        .sort({ createdAt: 1 })
        .lean();

      const userReplies = await Reply.find({
        reviewId: full._id,
        isDeleted: { $ne: true },
      })
        .populate("authorId", "name role")
        .populate("toUserId", "name")
        .sort({ createdAt: 1 })
        .lean();

      results.push({
        ...full,
        userName,
        adminReplies,
        userReplies,
      });
    }

    res.json({
      reviews: results,
      avgRating: product.meta?.avgRating || 0,
      totalReviews: results.length,
    });
  } catch (err) {
    console.error("Get reviews by product error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ================== GET PRODUCTS REVIEWED BY USER ==================
exports.getByUserReviewedProducts = async (req, res) => {
   // ... (Giữ nguyên code cũ)
  try {
    const userId = req.params.userId;

    const reviews = await Review.find({ userId })
      .populate("productId", "name price image images")
      .sort({ createdAt: -1 });

    const data = reviews.map((r) => ({
      reviewId: r._id,
      productId: r.productId._id,
      productName: r.productId.name,
      images: r.productId.images?.length ? r.productId.images : [r.productId.image],
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error("Error getByUserReviewedProducts:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};