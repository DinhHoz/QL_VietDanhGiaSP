// src/routes/reviews.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const reviewCtrl = require("../controllers/reviewController");
const { auth } = require("../middlewares/auth");

const uploadDir = path.join(__dirname, "..", "uploads", "reviews");
const fs = require("fs");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname)
    ),
});
const upload = multer({ storage });

router.post("/", auth, upload.array("images", 5), reviewCtrl.create);
router.put("/:reviewId", auth, upload.array("images", 5), reviewCtrl.update);
router.delete("/:reviewId", auth, reviewCtrl.delete);
router.get("/product/:productId", reviewCtrl.getByProduct);
// Route lấy sản phẩm đã đánh giá bởi user
router.get("/user/:userId/products", reviewCtrl.getByUserReviewedProducts);
// GET tất cả reviews
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;
