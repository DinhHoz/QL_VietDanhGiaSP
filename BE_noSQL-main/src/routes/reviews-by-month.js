// Backend: src/routes/reviews-by-month.js (File đầy đủ và sửa lỗi)
const express = require('express');
const router = express.Router();
const Review = require('../models/Review'); // Đảm bảo đường dẫn model đúng (nếu model ở src/models/Review.js)
const User = require("../models/User");

// GET /admin/reviews-by-month - Group reviews theo tháng/năm
router.get('/reviews-by-month', async (req, res) => {
  try {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]; // Sửa thành array để dễ index (tháng bắt đầu từ 0)

    const reviewsByMonth = await Review.aggregate([
      {
        $match: { isDeleted: false } // Chỉ lấy reviews chưa xóa (điều chỉnh field nếu khác)
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          month: {
            $concat: [
              { $arrayElemAt: [monthNames, { $subtract: ["$_id.month", 1] }] }, // Index từ 0
              " ",
              { $toString: "$_id.year" }
            ]
          },
          value: "$count"
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 } // Sắp xếp theo thời gian
      },
      {
        $project: { _id: 0, month: 1, value: 1 }
      }
    ]);

    console.log("reviewsByMonth:", reviewsByMonth); // Log để debug
    res.json(reviewsByMonth); // Trả về [{ month: "Nov 2025", value: 4 }, ...]
  } catch (err) {
    console.error("Lỗi aggregation reviews-by-month:", err); // Log chi tiết lỗi
    res.status(500).json({ msg: 'Lỗi lấy dữ liệu reviews theo tháng' });
  }
});

// GET /api/users/:id
exports.getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").lean();
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json(user);
  } catch (err) {
    console.error("getUserById error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = router;