// src/routes/categories.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

const { auth } = require('../middlewares/auth'); // ⭐ sửa ở đây

router.use(auth);

router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.post('/', auth, admin, categoryController.create); // Admin only
router.put('/:id', auth, admin, categoryController.update);
router.delete('/:id', auth, admin, categoryController.remove);

module.exports = router;