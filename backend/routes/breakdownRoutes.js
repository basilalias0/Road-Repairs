const express = require('express');
const breakdownRouter = express.Router();
const breakdownController = require('../controllers/breakdownController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

breakdownRouter.post('/', protect, authorize('customer'), upload('breakdownPictures').array('breakdownPictures', 10), breakdownController.createBreakdown);
breakdownRouter.get('/my', protect, breakdownController.getMyBreakdowns);
breakdownRouter.get('/:id', protect, breakdownController.getBreakdownById);
breakdownRouter.put('/:id/accept', protect, authorize('workshop'), breakdownController.acceptBreakdown);
breakdownRouter.put('/:id/reject', protect, authorize('workshop'), breakdownController.rejectBreakdown);
breakdownRouter.put('/:id/cancel', protect, authorize('customer'), breakdownController.cancelBreakdown);
breakdownRouter.put('/:id/status', protect, authorize('workshop', 'admin'), breakdownController.updateBreakdownStatus);
breakdownRouter.delete('/:id', protect, authorize('customer', 'admin'), breakdownController.deleteBreakdown);

module.exports = breakdownRouter;