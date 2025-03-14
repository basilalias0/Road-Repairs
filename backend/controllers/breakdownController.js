const asyncHandler = require('express-async-handler');
const Breakdown = require('../models/breakdownModel');
const User = require('../models/userModel');
const notificationController = require('./notificationController');
const { Client } = require('@googlemaps/google-maps-services-js');
const client = new Client({});

const breakdownController = {
    // @desc    Create a new breakdown request
    // @route   POST /api/breakdowns
    // @access  Private (Customer only)
    createBreakdown: asyncHandler(async (req, res) => {
        const {
            vehicle, // { make, model, year, registrationNumber }
            address,
            description,
        } = req.body;

        if(!vehicle || !address || !description) {
            return res.status(400).json({ message: 'Please provide all required fields' });
            }
        try {

            const geocoded = await client.geocode({
                params: {
                    address: address,
                    key: process.env.GOOGLE_MAPS_API_KEY,
                },
                timeout: 1000, // Optional: Timeout in milliseconds
            })
            

            if (!geocoded || geocoded.data.results.length === 0) {
                return res.status(400).json({ message: 'Invalid address provided' });
            }
            const { lat, lng } = geocoded.data.results[0].geometry.location;
    
            // Extract Cloudinary URLs from req.files (Multer adds this)
            const photos = req.files?.map((file) => file.path);
    
            // Create the breakdown record
            const breakdown = await Breakdown.create({
                user: req.user._id, // Assuming req.user is set by your protect middleware
                vehicle,
                location: {
                    coordinates: [lng, lat],
                },
                address,
                description,
                photos,
                reportedBy: req.user._id,
            });
    
            res.status(201).json(breakdown);
    
            // Notify nearby workshops (implement this function)
            await notifyNearbyWorkshops(breakdown);
    
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
    acceptBreakdown : asyncHandler(async (req, res) => {
        const breakdown = await Breakdown.findById(req.params.id);
    
        if (!breakdown) {
            res.status(404);
            throw new Error('Breakdown not found');
        }
    
        if (breakdown.status !== 'pending') {
            res.status(400);
            throw new Error('Breakdown is not pending or has already been accepted/rejected.');
        }
    
        const workshopId = req.user._id; // Assuming req.user is set by your protect middleware
        const workshop = await User.findById(workshopId);
    
        if (!workshop || workshop.role !== 'workshop') {
            res.status(400);
            throw new Error('Invalid workshop user.');
        }
    
        breakdown.assignedWorkshop = workshopId;
        breakdown.status = 'accepted';
        await breakdown.save();
    
        // Automatically create a notification for the customer
        await notificationController.createNotification({
            body: {
                userId: breakdown.user,
                message: `Your breakdown has been accepted by ${workshop.businessName || workshop.name}.`,
                relatedObjectId: breakdown._id,
                type: 'breakdown_accepted',
            },
        }, { status: () => ({ json: () => { } }) }); // Mock response object
    
        res.json({ message: 'Breakdown accepted successfully' });
    }),
    rejectBreakdown :asyncHandler(async (req, res) => {
        const breakdown = await Breakdown.findById(req.params.id);
    
        if (!breakdown) {
            res.status(404);
            throw new Error('Breakdown not found');
        }
    
        if (breakdown.status !== 'pending') {
            res.status(400);
            throw new Error('Breakdown is not pending or has already been accepted/rejected.');
        }
    
        // Automatically create a notification for the customer
        await notificationController.createNotification({
            body: {
                userId: breakdown.user,
                message: `Your breakdown has been rejected.`,
                relatedObjectId: breakdown._id,
                type: 'breakdown_rejected',
            },
        }, { status: () => ({ json: () => { } }) }); // Mock response object
    
        res.json({ message: 'Breakdown rejected successfully' });
    }),

    cancelBreakdown : asyncHandler(async (req, res) => {
        const breakdown = await Breakdown.findById(req.params.id);
    
        if (!breakdown) {
            res.status(404);
            throw new Error('Breakdown not found');
        }
    
        if (breakdown.status === 'completed' || breakdown.status === 'cancelled') {
            res.status(400);
            throw new Error('Breakdown is already completed or cancelled.');
        }
    
        breakdown.status = 'cancelled';
        await breakdown.save();
    
        // Automatically create a notification for the customer (optional, but good practice)
        await notificationController.createNotification({
            body: {
                userId: breakdown.user,
                message: `Your breakdown has been cancelled.`,
                relatedObjectId: breakdown._id,
                type: 'breakdown_cancelled',
            },
        }, { status: () => ({ json: () => { } }) });
    
        res.json({ message: 'Breakdown cancelled successfully' });
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
        const breakdown = await Breakdown.findByIdAndDelete(req.params.id);

        if (!breakdown) {
            res.status(404);
            throw new Error('Breakdown not found');
        }
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
                type: 'breakdown_request',
            },
        }, { status: () => ({ json: () => { } }) });

    }
}

module.exports = breakdownController;