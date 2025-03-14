const asyncHandler = require('express-async-handler');
const Breakdown = require('../models/breakdownModel');
const User = require('../models/userModel');
const notificationController = require('./notificationController'); // Import notification controller

const breakdownController = {
    // @desc    Create a new breakdown request
    // @route   POST /api/breakdowns
    // @access  Private (Customer only)
    createBreakdown: asyncHandler(async (req, res) => {
        const { description, location, vehicleType, issueType } = req.body;

        try {
            const uploadedImages = req.files ? req.files.map((file) => file.path) : []; // Extract image URLs

            const breakdown = await Breakdown.create({
                user: req.user._id,
                description,
                location,
                vehicleType,
                issueType,
                images: uploadedImages, // Store the array of image URLs
            });

            if (breakdown) {
                res.status(201).json(breakdown);
                await notifyNearbyWorkshops(breakdown);
            } else {
                res.status(400);
                throw new Error('Invalid breakdown data');
            }
        } catch (error) {
            console.error('Error creating breakdown:', error);
            res.status(500).json({ message: 'Failed to create breakdown', error: error.message });
        }
    }),

    // @desc    Get all breakdowns for the authenticated user
    // @route   GET /api/breakdowns/my
    // @access  Private
    getMyBreakdowns: asyncHandler(async (req, res) => {
        const breakdowns = await Breakdown.find({ user: req.user._id }).populate('assignedWorkshop');
        res.json(breakdowns);
    }),

    // @desc    Get a specific breakdown by ID
    // @route   GET /api/breakdowns/:id
    // @access  Private
    getBreakdownById: asyncHandler(async (req, res) => {
        const breakdown = await Breakdown.findById(req.params.id).populate('user').populate('assignedWorkshop');

        if (breakdown) {
            res.json(breakdown);
        } else {
            res.status(404);
            throw new Error('Breakdown not found');
        }
    }),

    // @desc    Assign a breakdown to a workshop
    // @route   PUT /api/breakdowns/:id/assign
    // @access  Private (Workshop or Admin)
    assignBreakdown: asyncHandler(async (req, res) => {
        const breakdown = await Breakdown.findById(req.params.id);
        const { workshopId } = req.body;

        if (!breakdown) {
            res.status(404);
            throw new Error('Breakdown not found');
        }

        const workshop = await User.findById(workshopId);

        if (!workshop || workshop.role !== 'workshop') {
            res.status(400);
            throw new Error('Invalid workshop ID');
        }

        breakdown.assignedWorkshop = workshopId;
        await breakdown.save();

        // Automatically create a notification
        await notificationController.createNotification({
            body: {
                userId: breakdown.user,
                message: `Your breakdown has been assigned to ${workshop.businessName || workshop.name}`,
                relatedObjectId: breakdown._id,
                type: 'breakdown_assigned',
            },
        }, { status: () => ({ json: () => { } }) }); // Mock response object

        res.json({ message: 'Breakdown assigned successfully' });
    }),

    // @desc    Update breakdown status
    // @route   PUT /api/breakdowns/:id/status
    // @access  Private (Workshop or Admin)
    updateBreakdownStatus: asyncHandler(async (req, res) => {
        const breakdown = await Breakdown.findById(req.params.id);
        const { status } = req.body;

        if (!breakdown) {
            res.status(404);
            throw new Error('Breakdown not found');
        }

        breakdown.status = status;
        await breakdown.save();

        res.json({ message: 'Breakdown status updated successfully' });
    }),

    // @desc    Delete a breakdown request
    // @route   DELETE /api/breakdowns/:id
    // @access  Private (Customer or Admin)
    deleteBreakdown: asyncHandler(async (req, res) => {
        const breakdown = await Breakdown.findById(req.params.id);

        if (!breakdown) {
            res.status(404);
            throw new Error('Breakdown not found');
        }

        await breakdown.remove();
        res.json({ message: 'Breakdown deleted successfully' });
    }),
};

// Helper function to find nearby workshops and send notifications
async function notifyNearbyWorkshops(breakdown) {
    const workshops = await User.find({ role: 'workshop', isVerified: true });

    for (const workshop of workshops) {
        // Create notification
        await notificationController.createNotification({
            body: {
                userId: workshop._id,
                message: `New breakdown request near you: ${breakdown.description}`,
                relatedObjectId: breakdown._id,
                type: 'new_breakdown',
            },
        }, { status: () => ({ json: () => { } }) });

    }
}

module.exports = breakdownController;