// src/routes/products.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const productCtrl = require("../controllers/productController");
const { auth, requireAdmin } = require("../middlewares/auth");

const uploadDir = path.join(__dirname, "..", "uploads", "products");
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

router.get("/", productCtrl.getAll);
router.get("/:id", productCtrl.getById);
router.post(
  "/",
  auth,
  requireAdmin,
  upload.single("image"),
  productCtrl.create
);
router.put(
  "/:id",
  auth,
  requireAdmin,
  upload.single("image"),
  productCtrl.update
);
router.delete("/:id", auth, requireAdmin, productCtrl.remove);

module.exports = router;
