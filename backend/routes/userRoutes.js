const express = require('express');
const userRouter = express.Router();

const { protect } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const upload = require('../middleware/uploadMiddleware');


userRouter.post('/', userController.registerUser);
userRouter.post('/login', userController.loginUser);
userRouter.get('/profile', protect, userController.getUserProfile);
userRouter.put('/profile', protect, upload('user').single('profilePicture'), userController.updateUserProfile);
userRouter.post('/forgotpassword', userController.forgotPassword);
userRouter.put('/resetpassword', userController.resetPassword);

module.exports = userRouter;