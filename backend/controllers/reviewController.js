const asyncHandler = require('express-async-handler');
const Breakdown = require('../models/breakdownModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');

const reviewController = {
    createReview: asyncHandler(async (req, res) => {
        const { workshop, rating, comment, breakdown } = req.body;
        const user = req.user._id; // Get user from authentication middleware

        // 1. Validate required fields
        if (!workshop || !rating) {
            return res.status(400).json({ message: 'Workshop and rating are required' });
        }

        // 2. Check if the user has a completed breakdown with the workshop
        const completedBreakdown = await Breakdown.findOne({
            user: user,
            assignedWorkshop: workshop,
        });

        if (!completedBreakdown) {
            return res.status(400).json({
                message: 'You can only review a workshop after a completed breakdown with them.'
            });
        }

        // 3. Check if a review already exists for this user and workshop
        const existingReview = await Review.findOne({ user: user, workshop: workshop });
        if (existingReview) {
            return res.status(400).json({
                message: 'You have already reviewed this workshop.'
            });
        }

        try {
            const review = await Review.create({
                user,
                workshop,
                rating,
                comment,
                breakdown: completedBreakdown._id // Link to the breakdown if available
            });

            res.status(201).json(review);

        } catch (error) {
            console.error("Error creating review:", error);
            if (error.name === 'ValidationError') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Server error creating review' });
        }
    }),

    getReviews: asyncHandler(async (req, res) => {
        const workshopId = req.params.workshopId; // Get workshop ID from URL parameter
    
        try {
            const reviews = await Review.find({ workshop: workshopId }) // Filter by workshop
                .populate('user')
                .populate('workshop');
    
            if (!reviews || reviews.length === 0) {
              return res.status(404).json({ message: 'No reviews found for this workshop' });
            }
            res.json(reviews);
        } catch (error) {
            console.error("Error getting reviews by workshop:", error);
            res.status(500).json({ message: 'Server error getting reviews' });
        }
    }),

    getReviewById: asyncHandler(async (req, res) => {
        const reviewId = req.params.id;
        try {
            const review = await Review.findById(reviewId).populate('user').populate('workshop');
            if (!review) {
                return res.status(404).json({ message: 'Review not found' });
            }
            res.json(review);
        } catch (error) {
            console.error("Error getting review by ID:", error);
            res.status(500).json({ message: 'Server error getting review' });
        }
    }),

    // ... other review functions (update, delete - add authorization as needed)

    updateReview: asyncHandler(async (req, res) => {
        const reviewId = req.params.id;
        const { rating, comment } = req.body;
        const userId = req.user._id;

        try {
            const review = await Review.findById(reviewId);
            if (!review) {
                return res.status(404).json({ message: 'Review not found' });
            }

            if (review.user.toString() !== userId.toString()) {
                return res.status(403).json({ message: 'Unauthorized: You are not the owner of this review' });
            }

            review.rating = rating || review.rating;
            review.comment = comment || review.comment;

            const updatedReview = await review.save();
            res.json(updatedReview);

        } catch (error) {
            console.error("Error updating review:", error);
            if (error.name === 'ValidationError') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Server error updating review' });
        }
    }),

    deleteReview: asyncHandler(async (req, res) => {
        const reviewId = req.params.id;
        const userId = req.user._id;

        try {
            const review = await Review.findById(reviewId);
            if (!review) {
                return res.status(404).json({ message: 'Review not found' });
            }

            if (review.user.toString() !== userId.toString()) {
                return res.status(403).json({ message: 'Unauthorized: You are not the owner of this review' });
            }

            await review.remove();
            res.json({ message: 'Review deleted successfully' });
        } catch (error) {
            console.error("Error deleting review:", error);
            res.status(500).json({ message: 'Server error deleting review' });
        }
    }),
};

module.exports = reviewController;  