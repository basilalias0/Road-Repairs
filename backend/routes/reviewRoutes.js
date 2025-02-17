const express = require('express');
const reviewRouter = express.Router();
const reviewController = require('../controllers/reviewController');
const isAuth = require('../middlewares/isAuth');


// Routes for creating and managing reviews

reviewRouter.post('/', isAuth, reviewController.createReview); // Create a new review (protected)
reviewRouter.get('/workshop/:workshopId', reviewController.getReviews); // Get reviews for a specific workshop (public)
reviewRouter.get('/:id', reviewController.getReviewById); // Get a specific review by ID (public)
reviewRouter.put('/:id', isAuth, reviewController.updateReview); // Update a review (protected, requires authorization)
reviewRouter.delete('/:id', isAuth, reviewController.deleteReview); // Delete a review (protected, requires authorization)

module.exports = reviewRouter;