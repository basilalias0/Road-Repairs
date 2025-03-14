const express = require('express');
const reportRouter = express.Router();
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

reportRouter.get('/breakdowns', protect, authorize('admin'), reportController.generateBreakdownReport);
reportRouter.get('/users', protect, authorize('admin'), reportController.generateUserReport);
reportRouter.get('/reviews', protect, authorize('admin'), reportController.generateReviewReport);
reportRouter.get('/payments', protect, authorize('admin'), reportController.generatePaymentReport);
reportRouter.get('/custom', protect, authorize('admin'), reportController.generateCustomReport);

module.exports = reportRouter;