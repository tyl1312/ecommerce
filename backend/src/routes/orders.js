const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');
const orderController = require('../controllers/orderController');

// All order routes require authentication
router.use(authMiddleware);

router.get('/', orderController.getOrders);
router.post('/', orderController.createOrder);
router.get('/:orderId', orderController.getOrderById);

module.exports = router;