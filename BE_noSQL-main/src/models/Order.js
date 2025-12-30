// src/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        image: { type: String },
      },
    ],
    shippingInfo: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      note: { type: String },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['cod', 'banking'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    // 👇 ĐỔI TÊN orderStatus THÀNH status VÀ SET DEFAULT
    status: {
      type: String,
      enum: ['pending', 'shipping', 'completed', 'cancelled'], // Khớp với logic controller
      default: 'pending', // Mặc định là chờ xử lý
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    deliveredAt: { type: Date }, // Thêm trường này để lưu ngày giao thành công
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);