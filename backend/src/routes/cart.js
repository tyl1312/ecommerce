const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');
const cartController = require('../controllers/cartController');

// All cart routes require authentication
router.use(authMiddleware);

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.delete('/:productId', cartController.deleteFromCart);
router.put('/:productId', cartController.updateCartItem);

module.exports = router;