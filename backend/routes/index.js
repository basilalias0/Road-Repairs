const express = require('express');
const adminRouter = require('./adminRoutes');
const userRouter = require('./userRoutes');
const breakdownRouter = require('./breakdownRoutes');
const notificationRouter = require('./notificationRoutes');
const router = express();

router.use("/admin",adminRouter)
router.use("/user",userRouter)
router.use("/breakdown",breakdownRouter)
router.use("/notification",notificationRouter)


module.exports = router