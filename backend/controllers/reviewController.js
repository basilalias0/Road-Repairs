const asyncHandler = require('express-async-handler');
const Review = require('../models/reviewModel');
const User = require('../models/userModel'); // For workshop validation
const notificationController = require('./notificationController'); // Import notification controller

const reviewController = {
    // @desc    Create a new review for a workshop
    // @route   POST /api/reviews
    // @access  Private (Customer only)
    createReview: asyncHandler(async (req, res) => {
        const { workshopId, rating, comment } = req.body;

        const workshop = await User.findById(workshopId);

        if (!workshop || workshop.role !== 'workshop') {
            res.status(400);
            throw new Error('Invalid workshop ID');
        }

        const review = await Review.create({
            user: req.user._id,
            workshop: workshopId,
            rating,
            comment,
        });

        if (review) {
            res.status(201).json(review);
            await notificationController.createNotification({
                body: {
                    userId: workshopId,
                    message: `You have received a new review.`,
                    relatedObjectId: review._id,
                    type: 'new_review',
                },
            }, { status: () => ({ json: () => { } }) });
        } else {
            res.status(400);
            throw new Error('Invalid review data');
        }
    }),

    // @desc    Get all reviews for a workshop
    // @route   GET /api/reviews/workshop/:workshopId
    // @access  Public
    getWorkshopReviews: asyncHandler(async (req, res) => {
        const reviews = await Review.find({ workshop: req.params.workshopId }).populate('user');
        res.json(reviews);
    }),

    // @desc    Get all reviews by the authenticated user
    // @route   GET /api/reviews/my
    // @access  Private
    getMyReviews: asyncHandler(async (req, res) => {
        const reviews = await Review.find({ user: req.user._id }).populate('workshop');
        res.json(reviews);
    }),

    // @desc    Get a specific review by ID
    // @route   GET /api/reviews/:id
    // @access  Private
    getReviewById: asyncHandler(async (req, res) => {
        const review = await Review.findById(req.params.id).populate('user').populate('workshop');

        if (review) {
            res.json(review);
        } else {
            res.status(404);
            throw new Error('Review not found');
        }
    }),

    // @desc    Update a review
    // @route   PUT /api/reviews/:id
    // @access  Private (Review owner only)
    updateReview: asyncHandler(async (req, res) => {
        const review = await Review.findById(req.params.id);

        if (!review) {
            res.status(404);
            throw new Error('Review not found');
        }

        if (review.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to update this review');
        }

        review.rating = req.body.rating || review.rating;
        review.comment = req.body.comment || review.comment;
        await review.save();

        res.json(review);
    }),

    // @desc    Delete a review
    // @route   DELETE /api/reviews/:id
    // @access  Private (Review owner or Admin)
    deleteReview: asyncHandler(async (req, res) => {
        const review = await Review.findById(req.params.id);

        if (!review) {
            res.status(404);
            throw new Error('Review not found');
        }

        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(401);
            throw new Error('Not authorized to delete this review');
        }

        await review.remove();
        res.json({ message: 'Review deleted successfully' });
    }),
};

module.exports = reviewController;