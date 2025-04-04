const express = require('express');
const productRouter = express.Router();
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

productRouter.post('/', protect, authorize('workshop'), productController.addProduct);
productRouter.get('/workshop', protect, authorize('workshop'), productController.getWorkshopProducts);
productRouter.put('/:id', protect, authorize('workshop'), productController.updateProduct);
productRouter.put('/:id/count', protect, authorize('workshop'), productController.updateProductCount);
productRouter.delete('/:id', protect, authorize('workshop'), productController.deleteProduct);

productRouter.get('/', productController.getAllProducts);
productRouter.post('/purchase', protect, authorize('customer'), productController.purchaseProduct);
productRouter.get('/orders', protect, authorize('customer'), productController.getCustomerOrders);

module.exports = productRouter;