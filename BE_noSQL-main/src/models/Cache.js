// src/models/Cache.js
const mongoose = require("mongoose");

const CacheSchema = new mongoose.Schema({
  _id: { type: String }, // userId string
  cachedAt: Number,
  data: Array,
});

module.exports = mongoose.model("Cache", CacheSchema);
