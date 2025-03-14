const express = require('express');
const notificationRouter = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

notificationRouter.post('/', protect, authorize('admin'), notificationController.createNotification); // Only admin can create notifications for now
notificationRouter.get('/my', protect, notificationController.getUserNotifications);
notificationRouter.get('/:id', protect, notificationController.getNotificationById);
notificationRouter.delete('/:id', protect, notificationController.deleteNotification);

module.exports = notificationRouter;