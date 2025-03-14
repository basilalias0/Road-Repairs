const express = require('express');
const adminRouter = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

adminRouter.get('/users', protect, authorize('admin'), adminController.getAllUsers);
adminRouter.get('/workshops', protect, authorize('admin'), adminController.getAllWorkshops);
adminRouter.get('/customers', protect, authorize('admin'), adminController.getAllCustomers);
adminRouter.get('/breakdowns', protect, authorize('admin'), adminController.getAllBreakdowns);
adminRouter.get('/reviews', protect, authorize('admin'), adminController.getAllReviews);
adminRouter.get('/notifications', protect, authorize('admin'), adminController.getAllNotifications);

adminRouter.put('/workshops/:id/verify', protect, authorize('admin'), adminController.verifyWorkshop);
adminRouter.put('/workshops/:id/suspend', protect, authorize('admin'), adminController.suspendWorkshop);
adminRouter.delete('/workshops/:id', protect, authorize('admin'), adminController.deleteWorkshop);

adminRouter.post('/admins', protect, authorize('admin'), adminController.addAdmin);

module.exports = adminRouter;