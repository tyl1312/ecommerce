const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');
const productController = require('../controllers/productController');

// Public product routes
router.get('/', productController.getProducts);
router.get('/search', productController.searchProducts);
router.get('/:productId', productController.getProductById);

// Manager-only routes (should be protected by role middleware in production)
router.post('/', authMiddleware, productController.createProduct);
router.put('/:productId', authMiddleware, productController.updateProduct);
router.delete('/:productId', authMiddleware, productController.deleteProduct);
router.post('/:productId/image', authMiddleware, productController.uploadProductImage);

module.exports = router;