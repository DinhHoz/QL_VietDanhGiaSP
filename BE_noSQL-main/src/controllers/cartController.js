// src/controllers/cartController.js
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Lấy giỏ hàng của user (populate product details)
const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    let cart = await Cart.findOne({ user: userId }).populate('items.product', 'name price images');
    
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
      await cart.save();
      // Populate after save (though items empty)
      await cart.populate('items.product', 'name price images');
    }

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.items.reduce((sum, item) => sum + (item.product?.price * item.quantity || 0), 0);

    res.status(200).json({
      success: true,
      cart: {
        _id: cart._id,
        items: cart.items,
        totalItems,
        totalPrice,
      },
    });
  } catch (error) {
    console.error('Get cart error:', error); // Add logging for debug
    res.status(500).json({ success: false, message: error.message });
  }
};

// Thêm sản phẩm vào cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body; // Default quantity to 1
    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId bắt buộc' });
    }
    if (quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity phải >= 1' });
    }

    // Kiểm tra product tồn tại
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
      await cart.save(); // Save new cart before adding items
    }

    // Kiểm tra item đã tồn tại chưa
    const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate('items.product', 'name price images');

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.items.reduce((sum, item) => sum + (item.product?.price * item.quantity || 0), 0);

    res.status(201).json({
      success: true,
      message: 'Thêm vào giỏ hàng thành công',
      cart: {
        _id: cart._id,
        items: cart.items,
        totalItems,
        totalPrice,
      },
    });
  } catch (error) {
    console.error('Add to cart error:', error); // Add logging
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật quantity của item
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id;

    // 1. Validate số lượng đầu vào
    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Số lượng phải >= 1' });
    }

    // 2. Tìm Giỏ hàng
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Giỏ hàng không tồn tại' });
    }

    // 3. Tìm Sản phẩm trong kho để check tồn kho (LOGIC MỚI)
    const productInDb = await Product.findById(productId);
    
    if (!productInDb) {
        return res.status(404).json({ success: false, message: 'Sản phẩm không còn tồn tại hệ thống' });
    }

    // 4. Kiểm tra logic tồn kho (LOGIC MỚI)
    // Giả sử trường lưu kho là 'stock'
    if (quantity > productInDb.stock) {
        return res.status(400).json({ 
            success: false, 
            message: `Xin lỗi, kho chỉ còn ${productInDb.stock} sản phẩm.` 
        });
    }

    // 5. Tìm vị trí item trong giỏ hàng
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không có trong giỏ hàng' });
    }

    // 6. Cập nhật số lượng
    cart.items[itemIndex].quantity = quantity;
    
    // Lưu giỏ hàng
    await cart.save();
    
    // Populate để lấy thông tin giá và hình ảnh hiển thị lại cho FE
    await cart.populate('items.product', 'name price images stock');

    // 7. Tính toán lại tổng tiền (Lưu ý: dùng giá hiện tại từ product vừa populate)
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.items.reduce((sum, item) => {
        // Kiểm tra an toàn phòng trường hợp product bị null sau khi populate
        const price = item.product ? item.product.price : 0; 
        return sum + (price * item.quantity);
    }, 0);

    res.status(200).json({
      success: true,
      message: 'Cập nhật thành công',
      cart: {
        _id: cart._id,
        items: cart.items,
        totalItems,
        totalPrice,
      },
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa 1 item
const deleteCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Giỏ hàng không tồn tại' });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    
    if (cart.items.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Item không tồn tại' });
    }

    await cart.save();
    await cart.populate('items.product', 'name price images');

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.items.reduce((sum, item) => sum + (item.product?.price * item.quantity || 0), 0);

    res.status(200).json({
      success: true,
      message: 'Xóa item thành công',
      cart: {
        _id: cart._id,
        items: cart.items,
        totalItems,
        totalPrice,
      },
    });
  } catch (error) {
    console.error('Delete cart item error:', error); // Add logging
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa toàn bộ cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    let cart = await Cart.findOneAndUpdate(
      { user: userId }, 
      { items: [] }, 
      { new: true, upsert: true } // Upsert if not exist
    ).populate('items.product', 'name price images');

    // If upsert created new, populate (empty)
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
      await cart.save();
      await cart.populate('items.product', 'name price images');
    }

    res.status(200).json({
      success: true,
      message: 'Xóa toàn bộ giỏ hàng thành công',
      cart: { 
        _id: cart._id,
        items: cart.items, 
        totalItems: 0, 
        totalPrice: 0 
      },
    });
  } catch (error) {
    console.error('Clear cart error:', error); // Add logging
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  clearCart,
};