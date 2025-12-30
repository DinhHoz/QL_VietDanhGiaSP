// src/routes/adminReplies.js
const express = require("express");
const router = express.Router();

const adminCtrl = require("../controllers/adminReplyController");
const { auth, requireAdmin } = require("../middlewares/auth");

// NEW: get all replies of a specific review
router.get(
  "/replies/review/:reviewId",
  auth,
  requireAdmin,
  adminCtrl.getRepliesOfReview
);

// Create multiple replies (1 review → many reply)
router.post("/reply/:reviewId", auth, requireAdmin, adminCtrl.createReply);

// Update reply
router.put("/reply/:replyId", auth, requireAdmin, adminCtrl.updateReply);

// Delete reply
router.delete("/reply/:replyId", auth, requireAdmin, adminCtrl.deleteReply);

// List all replies
router.get("/replies", auth, requireAdmin, adminCtrl.listReplies);

// Reviews with no reply
router.get(
  "/unreplied-reviews",
  auth,
  requireAdmin,
  adminCtrl.unrepliedReviews
);

// Reviews with replies (Route mới - thêm ở cuối file)
router.get("/replied-reviews", auth, requireAdmin, adminCtrl.repliedReviews);

module.exports = router;
