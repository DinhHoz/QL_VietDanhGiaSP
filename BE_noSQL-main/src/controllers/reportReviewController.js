// src/controllers/reportReviewController.js
const fs = require("fs");
const path = require("path");
const ReportReview = require("../models/ReportReview");
const Review = require("../models/Review");
const Product = require("../models/Product");
const AdminReply = require("../models/AdminReply");
const Reply = require("../models/Reply");
const User = require("../models/User");

// === Helper xóa ảnh giống reviewController ===
const deleteFileIfLocal = (p) => {
  if (!p) return;
  if (p.startsWith("/uploads/reviews") || p.startsWith("/uploads/products")) {
    try {
      const abs = path.join(__dirname, "..", p);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    } catch (err) {
      console.error("deleteFileIfLocal error:", err.message);
    }
  }
};

// === Helper cập nhật meta rating ===
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

// --------------------------------------------------
// 1) USER BÁO CÁO REVIEW
// --------------------------------------------------
exports.reportReview = async (req, res) => {
  try {
    const { reason, description } = req.body;
    const reviewId = req.params.reviewId;

    if (!reason) return res.status(400).json({ error: "Lý do là bắt buộc" });

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ error: "Review không tồn tại" });

    const targetUserId = review.userId;

    // Tránh báo cáo trùng
    const existed = await ReportReview.findOne({
      reviewId,
      reportedBy: req.user._id,
      status: "pending",
    });

    if (existed)
      return res.status(400).json({ error: "Bạn đã báo cáo review này rồi" });

    const report = new ReportReview({
      reviewId,
      reportedBy: req.user._id,
      reportedUser: targetUserId,
      reason,
      description: description || "",
    });

    await report.save();

    res.json({ success: true, message: "Đã gửi báo cáo" });
  } catch (err) {
    console.error("reportReview error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// --------------------------------------------------
// 2) ADMIN – LẤY DANH SÁCH BÁO CÁO
// --------------------------------------------------
exports.getReports = async (req, res) => {
  try {
    const status = req.query.status || null;
    const filter = status ? { status } : {};

    const reports = await ReportReview.find(filter)
      .populate("reviewId")
      .populate("reportedBy", "name email") // Người đi báo cáo
      .populate("reportedUser", "name email") // <--- THÊM DÒNG NÀY (Người bị báo cáo)
      .populate({
        path: "handledBy",
        select: "name email",
        strictPopulate: false, // Giữ cái này để tránh lỗi nếu dữ liệu cũ chưa có
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, reports });
  } catch (err) {
    console.error("getReports error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// --------------------------------------------------
// 3) ADMIN – CHI TIẾT 1 BÁO CÁO
// --------------------------------------------------
exports.getReportById = async (req, res) => {
  try {
    const report = await ReportReview.findById(req.params.reportId)
      .populate("reviewId")
      .populate("reportedBy", "name email")
      .populate("reportedUser", "name email") // <--- THÊM DÒNG NÀY
      .populate({
        path: "handledBy",
        select: "name email",
        strictPopulate: false,
      });

    if (!report) return res.status(404).json({ error: "Report không tồn tại" });

    res.json({ success: true, report });
  } catch (err) {
    console.error("getReportById error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// --------------------------------------------------
// 4) ADMIN – ẨN REVIEW (SOFT DELETE)
// --------------------------------------------------
exports.hideReview = async (req, res) => {
  try {
    // 1. Lấy thông tin báo cáo
    const report = await ReportReview.findById(req.params.reportId);
    if (!report) return res.status(404).json({ error: "Report không tồn tại" });

    // 2. Lấy thông tin review gốc (để lấy reviewId và productId)
    const review = await Review.findById(report.reviewId);
    if (!review) return res.status(404).json({ error: "Review không tồn tại" });

    // ------------------------------------------------------------
    // BƯỚC QUAN TRỌNG: XỬ LÝ XÓA KHỎI PRODUCT (Dựa trên cấu trúc hình ảnh)
    // ------------------------------------------------------------
    const product = await Product.findById(review.productId);

    if (product && product.reviews) {
      console.log("Số review trước khi xóa:", product.reviews.length);

      // LOGIC: Tạo ra một mảng mới, GIỮ LẠI những review có ID KHÁC với cái cần xóa.
      // Dùng .toString() để ép kiểu cả 2 về chuỗi ký tự => So sánh chính xác tuyệt đối.
      const newReviews = product.reviews.filter(
        (item) => item.reviewId.toString() !== review._id.toString()
      );

      // Gán mảng mới (đã mất đi 1 phần tử) vào lại product
      product.reviews = newReviews;

      console.log("Số review sau khi xóa:", product.reviews.length);

      // BẮT BUỘC: Vì reviews là mảng object tự do, Mongoose không tự biết nó thay đổi.
      // Dòng này ép Mongoose ghi đè dữ liệu mới xuống DB.
      product.markModified("reviews");

      await product.save();
      console.log(`Đã xóa thành công review ${review._id} khỏi Product`);
    }
    // ------------------------------------------------------------

    // 3. Đánh dấu xóa mềm ở bảng Review (để admin vẫn xem được lịch sử)
    review.isDeleted = true;
    await review.save();

    // 4. Tính lại điểm đánh giá trung bình (Rating)
    await updateProductMeta(review.productId);

    // 5. Cập nhật trạng thái báo cáo thành "Đã giải quyết"
    report.status = "resolved";
    report.handledBy = req.user._id;
    report.handledAt = new Date();
    await report.save();

    res.json({ success: true, message: "Review đã bị xóa khỏi sản phẩm" });
  } catch (err) {
    console.error("hideReview error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
// --------------------------------------------------
// 5) ADMIN – HIỆN LẠI REVIEW (RESTORE / UNHIDE)
// --------------------------------------------------
exports.restoreReview = async (req, res) => {
  try {
    // 1. Lấy thông tin báo cáo
    const report = await ReportReview.findById(req.params.reportId);
    if (!report) return res.status(404).json({ error: "Report không tồn tại" });

    // 2. Lấy thông tin review gốc
    const review = await Review.findById(report.reviewId);
    if (!review) return res.status(404).json({ error: "Review không tồn tại" });

    // ------------------------------------------------------------
    // BƯỚC QUAN TRỌNG: THÊM LẠI VÀO PRODUCT
    // ------------------------------------------------------------
    const product = await Product.findById(review.productId);

    if (product) {
      // Kiểm tra xem review đã tồn tại trong mảng chưa (tránh trùng lặp)
      // Dùng toString() để so sánh ID chính xác
      const isExist = product.reviews.some(
        (item) =>
          item.reviewId && item.reviewId.toString() === review._id.toString()
      );

      if (!isExist) {
        console.log("Review chưa có trong Product, tiến hành thêm lại...");

        // Tái tạo lại object review để push vào mảng
        // (Lấy dữ liệu từ bảng Review gốc đắp sang)
        const restoredReviewData = {
          reviewId: review._id,
          userId: review.userId,
          userName: review.userName, // Đảm bảo field này có trong model Review
          rating: review.rating,
          comment: review.comment,
          images: review.images || [],
          createdAt: review.createdAt || new Date(),
          isDeleted: false,
        };

        // Push vào mảng
        product.reviews.push(restoredReviewData);

        // BẮT BUỘC: Báo cho Mongoose biết mảng đã thay đổi
        product.markModified("reviews");

        await product.save();
        console.log(`Đã khôi phục review ${review._id} vào Product`);
      } else {
        console.log("Review đã tồn tại trong Product, không cần thêm.");
      }
    }
    // ------------------------------------------------------------

    // 3. Cập nhật trạng thái ở bảng Review gốc
    review.isDeleted = false;
    await review.save();

    // 4. Tính lại điểm đánh giá (Rating)
    await updateProductMeta(review.productId);

    // 5. Cập nhật Report (Thường là chuyển sang Rejected - Tức là báo cáo sai, hoặc Resolved)
    // Ở đây mình để là 'resolved' nghĩa là admin đã xử lý xong (quyết định cho hiện lại)
    report.status = "resolved";
    report.handledBy = req.user._id;
    report.handledAt = new Date();
    await report.save();

    res.json({ success: true, message: "Review đã được hiện lại thành công" });
  } catch (err) {
    console.error("restoreReview error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// --------------------------------------------------
// 5) ADMIN – XÓA REVIEW HOÀN TOÀN
// --------------------------------------------------
exports.deleteReview = async (req, res) => {
  try {
    const report = await ReportReview.findById(req.params.reportId);
    if (!report) return res.status(404).json({ error: "Report không tồn tại" });

    const review = await Review.findById(report.reviewId);
    if (!review) return res.status(404).json({ error: "Review không tồn tại" });

    (review.images || []).forEach(deleteFileIfLocal);

    await Review.deleteOne({ _id: review._id });
    await AdminReply.deleteMany({ reviewId: review._id });
    await Reply.updateMany({ reviewId: review._id }, { isDeleted: true });

    await Product.updateOne(
      { _id: review.productId },
      { $pull: { reviews: { reviewId: review._id } } }
    );

    await updateProductMeta(review.productId);

    report.status = "resolved";
    report.handledBy = req.user._id;
    report.handledAt = new Date();
    await report.save();

    res.json({ success: true, message: "Review đã bị xóa" });
  } catch (err) {
    console.error("deleteReview error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// --------------------------------------------------
// 6) ADMIN – TỪ CHỐI BÁO CÁO
// --------------------------------------------------
exports.rejectReport = async (req, res) => {
  try {
    const report = await ReportReview.findById(req.params.reportId);
    if (!report) return res.status(404).json({ error: "Report không tồn tại" });

    report.status = "rejected";
    report.handledBy = req.user._id;
    report.handledAt = new Date();
    await report.save();

    res.json({ success: true, message: "Đã từ chối báo cáo" });
  } catch (err) {
    console.error("rejectReport error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// --------------------------------------------------
// 7) ADMIN – CẢNH CÁO NGƯỜI DÙNG
// --------------------------------------------------
exports.warnUser = async (req, res) => {
  try {
    const report = await ReportReview.findById(req.body.reportId);
    if (!report) return res.status(404).json({ error: "Report không tồn tại" });

    const review = await Review.findById(report.reviewId);
    if (!review) return res.status(404).json({ error: "Review không tồn tại" });

    await User.findByIdAndUpdate(review.userId, {
      $inc: { warnings: 1 },
    });

    report.status = "resolved";
    report.handledBy = req.user._id;
    report.handledAt = new Date();
    await report.save();

    res.json({ success: true, message: "Đã cảnh cáo người dùng" });
  } catch (err) {
    console.error("warnUser error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
