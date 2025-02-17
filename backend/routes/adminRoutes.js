const express = require('express');
const adminRouter = express.Router();
const adminController = require('../controllers/adminController');
const isAdmin = require('../middlewares/isAdmin');
const isAuth = require('../middlewares/isAuth');

// Admin Routes (Protected by both authenticate and isAdmin)

adminRouter.post('/', isAuth, isAdmin, adminController.createAdmin); // Create a new admin
adminRouter.get('/', isAuth, isAdmin, adminController.getAdmins);     // Get all admins
adminRouter.get('/:id', isAuth, isAdmin, adminController.getAdminById); // Get admin by ID
adminRouter.put('/:id', isAuth, isAdmin, adminController.updateAdmin); // Update admin
adminRouter.delete('/:id', isAuth, isAdmin, adminController.deleteAdmin); // Delete admin

adminRouter.get('/breakdowns', isAuth, isAdmin, adminController.getBreakdowns);
adminRouter.get('/breakdowns/:id', isAuth, isAdmin, adminController.getBreakdownById);

adminRouter.get('/reviews', isAuth, isAdmin, adminController.getReviews);
adminRouter.get('/reviews/:id', isAuth, isAdmin, adminController.getReviewById);

adminRouter.get('/workshops', isAuth, isAdmin, adminController.getWorkshops);
adminRouter.get('/workshops/:id', isAuth, isAdmin, adminController.getWorkshopById);

adminRouter.get('/users', authenticaisAuthte, isAdmin, adminController.getUsers);
adminRouter.get('/users/:id', isAuth, isAdmin, adminController.getUserById);

adminRouter.get('/cars', isAuth, isAdmin, adminController.getCars);
adminRouter.get('/cars/:id', isAuth, isAdmin, adminController.getCarById);

module.exports = adminRouter;