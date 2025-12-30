// controllers/userController.js
const User = require("../models/User");

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name"); // Chỉ lấy 'name' để bảo mật
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }
    res.status(200).json({ name: user.name });
  } catch (error) {
    console.error("Lỗi lấy user:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};