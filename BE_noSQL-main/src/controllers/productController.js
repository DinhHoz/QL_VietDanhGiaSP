// src/controllers/productController.js (Updated with search, pagination, and fixes)
const Product = require("../models/Product");
const fs = require("fs");
const path = require("path");

// Hàm xóa file local với try-catch để tránh crash
const deleteFileIfLocal = (filePath) => {
  if (!filePath || !filePath.startsWith("/uploads/")) return;
  try {
    const absPath = path.join(__dirname, "..", filePath);
    if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
  } catch (err) {
    console.error("Lỗi xóa file:", err.message); // Log nhưng không throw để tránh 500
  }
};

// ================= GET ALL PRODUCTS =================
exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const includeDeleted = req.query.includeDeleted === "true";
    const category = req.query.category; // Lọc theo category
    const search = req.query.search; // Tìm kiếm theo name hoặc description

    let filter = includeDeleted ? {} : { isDeleted: { $ne: true } };

    // Thêm filter category nếu có
    if (category) {
      filter.category = category;
    }

    // Thêm filter search nếu có (tìm trong name và description)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(filter)
      .populate("category", "name") // Populate category name nếu có ref
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const totalCount = await Product.countDocuments(filter);

    res.json({
      products,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      totalCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ================= GET PRODUCT BY ID =================
exports.getById = async (req, res) => {
  try {
    const includeDeleted = req.query.includeDeleted === "true";
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .lean();
    if (!product) return res.status(404).json({ error: "Not found" });
    if (!includeDeleted && product.isDeleted) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ================= CREATE PRODUCT =================
exports.create = async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, stock } = req.body;

    let imagePath = null;
    if (req.file) imagePath = `/uploads/products/${req.file.filename}`;
    else if (imageUrl) imagePath = imageUrl;

    const images = imagePath ? [imagePath] : [];

    const product = new Product({
      name,
      description,
      price: parseFloat(price) || 0, // Fallback nếu invalid
      category,
      images,
      stock: parseInt(stock) || 0,
    });

    await product.save();
    const populatedProduct = await Product.findById(product._id)
      .populate("category", "name")
      .lean();
    res.status(201).json(populatedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ================= UPDATE PRODUCT =================
exports.update = async (req, res) => {
  try {
    console.log("Update request:", req.params.id, req.body, !!req.file); // Debug log để check input

    const { name, description, price, category, imageUrl, stock } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Not found" });

    // Khởi tạo newImages từ images hiện tại để tránh ReferenceError
    let newImages = Array.isArray(product.images) ? [...product.images] : [];
    const oldImage = newImages.length ? newImages[0] : null;

    if (req.file) {
      // Upload file mới → xóa file cũ
      const newPath = `/uploads/products/${req.file.filename}`;
      deleteFileIfLocal(oldImage);
      newImages = [newPath];
    } else if (imageUrl !== undefined) {
      if (!imageUrl) {
        // Xóa ảnh nếu imageUrl rỗng
        deleteFileIfLocal(oldImage);
        newImages = [];
      } else if (imageUrl !== oldImage) {
        deleteFileIfLocal(oldImage);
        newImages = [imageUrl];
      }
      // Nếu imageUrl === oldImage, giữ nguyên newImages
    }
    // Nếu không có thay đổi image, newImages vẫn là giá trị cũ

    // Update fields với fallback (giữ cũ nếu không gửi hoặc invalid)
    product.name = name !== undefined ? name : product.name;
    product.description =
      description !== undefined ? description : product.description;
    product.price =
      price !== undefined ? parseFloat(price) || product.price : product.price;
    product.category = category !== undefined ? category : product.category;
    product.stock =
      stock !== undefined ? parseInt(stock) || product.stock : product.stock;
    product.images = newImages;

    await product.save();
    const populatedProduct = await Product.findById(product._id)
      .populate("category", "name")
      .lean();
    res.json({ ok: true, product: populatedProduct });
  } catch (err) {
    console.error("Lỗi update:", err.message, err.stack); // Log chi tiết stack trace
    res.status(500).json({ error: err.message || "Lỗi server" });
  }
};

// ================= DELETE PRODUCT =================
exports.remove = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Not found" });

    const image =
      product.images && product.images.length ? product.images[0] : null;
    deleteFileIfLocal(image);

    await product.deleteOne();
    res.json({ ok: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ================= SOFT DELETE PRODUCT =================
exports.softDelete = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Not found" });
    if (product.isDeleted)
      return res.status(400).json({ error: "Already deleted" });

    product.isDeleted = true;
    product.deletedAt = new Date();
    await product.save();

    res.json({ ok: true, softDeleted: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ================= RESTORE PRODUCT =================
exports.restore = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Not found" });
    if (!product.isDeleted)
      return res.status(400).json({ error: "Product is not deleted" });

    product.isDeleted = false;
    product.deletedAt = null;
    await product.save();

    res.json({ ok: true, restored: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
