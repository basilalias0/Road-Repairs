const express = require('express');
const breakdownRouter = express.Router();
const breakdownController = require('../controllers/breakdownController');
const isAuth = require('../middlewares/isAuth');
const isAdmin = require('../middlewares/isAdmin');


// Owner Routes (authenticated)
breakdownRouter.post('/owner', isAuth, breakdownController.createBreakdownByOwner);
breakdownRouter.put('/:id/owner', isAuth, breakdownController.updateBreakdownByOwner);
breakdownRouter.put('/:id/cancel', isAuth, breakdownController.cancelBreakdownByOwner);

// Workshop Routes (authenticated)
breakdownRouter.put('/:id/workshop', isAuth, breakdownController.createBreakdownByWorkshop); // Workshop assigns itself and updates status/payment

// Common Routes (authenticated, authorization handled in controller)
breakdownRouter.get('/', isAuth, breakdownController.getBreakdowns);
breakdownRouter.get('/:id', isAuth, breakdownController.getBreakdownById);

// Admin Route (authenticated, you might want separate admin middleware)
breakdownRouter.delete('/:id', isAuth,isAdmin, breakdownController.deleteBreakdown); // Add isAdmin middleware if needed


module.exports = breakdownRouter;