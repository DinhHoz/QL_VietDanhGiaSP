// src/models/Category.js
const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  // Optional: Thêm slug cho SEO, icon, etc.
  // slug: { type: String, unique: true, lowercase: true },
}, {
  timestamps: true, // Tự động createdAt/updatedAt
});

module.exports = mongoose.model("Category", CategorySchema);