const express = require('express');
const userRouter = express.Router();
const userController = require('../controllers/userController');
const isAuth = require('../middlewares/isAuth');
const isAdmin = require('../middlewares/isAdmin');

// **User Routes**

// Registration
userRouter.post('/', userController.registerUser);
userRouter.get('/verify/:token', userController.verifyEmail);

// Authentication
userRouter.post('/login', userController.loginUser);

// User Profile (Protected)
userRouter.get('/profile', isAuth, userController.getUserProfile);
userRouter.put('/profile', isAuth, userController.updateUserProfile); // Or PATCH

// Password Reset
userRouter.post('/forgot-password', userController.forgotPassword);
userRouter.post('/reset-password/:token', userController.resetPassword);

//change Password
userRouter.put('/change-password', isAuth, userController.changePassword)

//Delete User
userRouter.delete('/profile', authenticate, userController.deleteUser);


module.exports = userRouter;