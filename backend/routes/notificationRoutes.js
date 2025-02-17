const express = require('express');
const notificationRouter = express.Router();
const notificationController = require('../controllers/notificationController');
const isAuth = require('../middlewares/isAuth');


// Notification Routes (protected)
notificationRouter.get('/', isAuth, notificationController.getNotifications);
notificationRouter.put('/:id/read', isAuth, notificationController.markAsRead);
notificationRouter.delete('/:id', isAuth, notificationController.deleteNotification);

module.exports = notificationRouter;