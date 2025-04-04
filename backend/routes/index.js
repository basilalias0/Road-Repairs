const express = require('express');
const adminRouter = require('./adminRoutes');
const userRouter = require('./userRoutes');
const breakdownRouter = require('./breakdownRoutes');
const notificationRouter = require('./notificationRoutes');
const reviewRouter = require('./reviewRoutes');
const paymentRouter = require('./paymentRouter');
const chatRouter = require('./chatRoutes');
const locationRouter = require('./locationRoutes');
const reportRouter = require('./reportRoutes');
const productRouter = require('./productRouter');
const router = express();


router.use("/user",userRouter)
router.use("/admin",adminRouter)
router.use("/breakdown",breakdownRouter)
router.use("/notification",notificationRouter)
router.use("/review",reviewRouter)
router.use('/payment',paymentRouter)
router.use('/chat',chatRouter)
router.use('location',locationRouter)
router.use('/report',reportRouter)
router.use('/product',productRouter)

module.exports = router