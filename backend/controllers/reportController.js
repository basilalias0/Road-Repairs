const asyncHandler = require('express-async-handler');
const Breakdown = require('../models/breakdownModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');
const Payment = require('../models/paymentModel');

const reportController = {
    // @desc    Generate breakdown report
    // @route   GET /api/reports/breakdowns
    // @access  Private (Admin only)
    generateBreakdownReport: asyncHandler(async (req, res) => {
        const breakdowns = await Breakdown.find().populate('user').populate('assignedWorkshop');
        res.json(breakdowns);
    }),

    // @desc    Generate user report
    // @route   GET /api/reports/users
    // @access  Private (Admin only)
    generateUserReport: asyncHandler(async (req, res) => {
        const users = await User.find();
        res.json(users);
    }),

    // @desc    Generate review report
    // @route   GET /api/reports/reviews
    // @access  Private (Admin only)
    generateReviewReport: asyncHandler(async (req, res) => {
        const reviews = await Review.find().populate('user').populate('workshop');
        res.json(reviews);
    }),

    // @desc    Generate payment report
    // @route   GET /api/reports/payments
    // @access  Private (Admin only)
    generatePaymentReport: asyncHandler(async (req, res) => {
        const payments = await Payment.find().populate('breakdown').populate('customer').populate('workshop');
        res.json(payments);
    }),

    // @desc    Generate custom report based on query parameters
    // @route   GET /api/reports/custom
    // @access  Private (Admin only)
    generateCustomReport: asyncHandler(async (req, res) => {
        const { model, query } = req.query; // model: Breakdown, User, Review, Payment; query: JSON string

        let data;
        try {
            const parsedQuery = query ? JSON.parse(query) : {};

            switch (model) {
                case 'Breakdown':
                    data = await Breakdown.find(parsedQuery).populate('user').populate('assignedWorkshop');
                    break;
                case 'User':
                    data = await User.find(parsedQuery);
                    break;
                case 'Review':
                    data = await Review.find(parsedQuery).populate('user').populate('workshop');
                    break;
                case 'Payment':
                    data = await Payment.find(parsedQuery).populate('breakdown').populate('customer').populate('workshop');
                    break;
                default:
                    res.status(400).json({ message: 'Invalid model specified' });
                    return;
            }

            res.json(data);
        } catch (error) {
            res.status(400).json({ message: 'Invalid query format', error: error.message });
        }
    }),
};

module.exports = reportController;