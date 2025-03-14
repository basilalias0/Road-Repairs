const express = require('express');
const reviewRouter = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

reviewRouter.post('/', protect, authorize('customer'), reviewController.createReview);
reviewRouter.get('/workshop/:workshopId', reviewController.getWorkshopReviews);
reviewRouter.get('/my', protect, reviewController.getMyReviews);
reviewRouter.get('/:id', protect, reviewController.getReviewById);
reviewRouter.put('/:id', protect, reviewController.updateReview);
reviewRouter.delete('/:id', protect, authorize('customer', 'admin'), reviewController.deleteReview);

module.exports = reviewRouter;