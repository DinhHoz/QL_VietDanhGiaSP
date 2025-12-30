// src/routes/replies.js
const express = require('express');
const router = express.Router();
const replyCtrl = require('../controllers/replyController');
const { auth, requireAdmin } = require('../middlewares/auth'); // auth middleware bạn có sẵn

// Người dùng (đã đăng nhập) tạo reply cho review
router.post('/review/:reviewId', auth, replyCtrl.createReply);

// Lấy replies của review (user + admin)
router.get('/review/:reviewId', auth, replyCtrl.getRepliesOfReview);

// Update / delete (dành cho Reply model)
router.put('/:replyId', auth, replyCtrl.updateReply);
router.delete('/:replyId', auth, replyCtrl.deleteReply);

module.exports = router;
