// src/controllers/categoryController.js
const Category = require("../models/Category");

// GET ALL (cho frontend dropdown)
exports.getAll = async (req, res) => {
  try {
    const categories = await Category.find({}).select('name description _id').sort({ name: 1 }).lean();
    res.json(categories); // [{ _id: '...', name: 'Laptop', description: '...' }]
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET BY ID
exports.getById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).lean();
    if (!category) return res.status(404).json({ error: "Not found" });
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// CREATE
exports.create = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = new Category({ name, description });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    ).lean();
    if (!category) return res.status(404).json({ error: "Not found" });
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE (Cẩn thận: Có thể cascade xóa products hoặc set null category)
exports.remove = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: "Not found" });
    // Optional: Update products set category = null hoặc migrate
    res.json({ ok: true, message: "Category deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};