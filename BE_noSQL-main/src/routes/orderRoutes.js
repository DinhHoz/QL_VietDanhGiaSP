const express = require('express');
const router = express.Router();

const { auth, requireAdmin } = require('../middlewares/auth');

// Import đủ 5 hàm (lúc này bên controller đã export đủ nên sẽ không lỗi nữa)
const { 
    createOrder, 
    getMyOrders, 
    getOrderDetails, 
    getAllOrdersAdmin, 
    updateOrderStatus 
} = require('../controllers/orderController');

router.post('/create', auth, createOrder);
router.get('/my-orders', auth, getMyOrders);

// Admin routes
router.get('/admin/all', auth, requireAdmin, getAllOrdersAdmin);
router.put('/admin/:id/status', auth, requireAdmin, updateOrderStatus);

// Route chi tiết (để cuối cùng để tránh nhận nhầm ID là 'admin')
router.get('/:id', auth, getOrderDetails); 

module.exports = router;