// src/routes/reportReviewRoutes.js
const express = require("express");
const router = express.Router();

const { auth, requireAdmin } = require("../middlewares/auth");
const controller = require("../controllers/reportReviewController");

// USER báo cáo review
router.post("/reviews/:reviewId/report", auth, controller.reportReview);

// ADMIN xem danh sách báo cáo
router.get("/admin/reviews", auth, requireAdmin, controller.getReports);

// ADMIN xem chi tiết 1 báo cáo
router.get("/admin/reviews/:reportId", auth, requireAdmin, controller.getReportById);

// ADMIN ẩn review
router.patch("/admin/reviews/:reportId/hide", auth, requireAdmin, controller.hideReview);

// ADMIN xóa review
router.delete("/admin/reviews/:reportId", auth, requireAdmin, controller.deleteReview);

// ADMIN hiện (khôi phục) review
router.patch("/admin/reviews/:reportId/restore", auth, requireAdmin, controller.restoreReview);
// ADMIN từ chối báo cáo
router.patch("/admin/reviews/:reportId/reject", auth, requireAdmin, controller.rejectReport);

// ADMIN cảnh cáo user
router.post("/admin/reviews/warn", auth, requireAdmin, controller.warnUser);


module.exports = router;
