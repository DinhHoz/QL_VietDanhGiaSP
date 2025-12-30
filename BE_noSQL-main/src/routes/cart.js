const express = require('express');
const router = express.Router();

const { getCart, addToCart, updateCartItem, deleteCartItem, clearCart } =
  require('../controllers/cartController');

const { auth } = require('../middlewares/auth'); 

router.use(auth);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/item/:productId', updateCartItem);
router.delete('/item/:productId', deleteCartItem);
router.delete('/clear', clearCart);

module.exports = router;
