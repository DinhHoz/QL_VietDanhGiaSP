// src/controllers/orderController.js
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// 1. Tạo đơn hàng mới
const createOrder = async (req, res) => {
  try {
    const { shippingInfo, paymentMethod } = req.body;
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng trống' });
    }

    let orderItems = [];
    let totalPrice = 0;

    for (const item of cart.items) {
      if (!item.product) continue;
      const itemTotal = item.product.price * item.quantity;
      totalPrice += itemTotal;

      orderItems.push({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images && item.product.images.length > 0 ? item.product.images[0] : '',
      });
    }

    const order = new Order({
      user: userId,
      items: orderItems,
      shippingInfo,
      paymentMethod,
      totalPrice,
      paymentStatus: 'pending', 
      status: 'pending',
    });

    await order.save();

    // Xóa giỏ hàng sau khi đặt
    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công',
      order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Lấy danh sách đơn hàng của user
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Lấy chi tiết 1 đơn hàng
const getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Get order detail error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. ADMIN: Lấy tất cả đơn hàng (Sửa lại thành const)
const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate({
        path: 'items.product',
        select: 'name price images'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ error: "Lỗi server khi lấy danh sách đơn hàng" });
  }
};

// 5. ADMIN: Cập nhật trạng thái (Sửa lại thành const)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const validStatuses = ['pending', 'shipping', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Trạng thái không hợp lệ" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
    }

    order.status = status;
    if (status === 'completed') {
      order.deliveredAt = Date.now();
      if (order.paymentMethod === 'cod') {
          order.paymentStatus = 'paid';
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      order
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ error: "Lỗi server khi cập nhật đơn hàng" });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderDetails,
  getAllOrdersAdmin, 
  updateOrderStatus  
};