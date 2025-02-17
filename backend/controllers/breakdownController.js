const asyncHandler = require('express-async-handler');
const Breakdown = require('../models/breakdownModel');
const User = require('../models/userModel');
const notificationController = require('./notificationController');

const breakdownController = {
    createBreakdownByOwner: asyncHandler(async (req, res) => {
        const { vehicle, location, address, description, photos } = req.body; // Removed estimatedArrivalTime and totalCost

        // 1. Validate required fields (owner initiated)
        if (!vehicle || !location || !address || !description) { // Removed estimatedArrivalTime and totalCost
            return res.status(400).json({ message: 'Please fill in all required fields' });
        }

        // 2. Get the user from req.user (middleware)
        const user = req.user._id;

        // 4. Validate vehicle (example)
        if (typeof vehicle !== 'object' || Object.keys(vehicle).length === 0) {
            return res.status(400).json({ message: 'Invalid vehicle data' });
        }

        // 5. Create the breakdown (with try...catch for database errors):
        try {
            const breakdown = await Breakdown.create({
                user,
                vehicle,
                location,
                address,
                description,
                photos: photos || [],
                reportedBy: user,
            });

            res.status(201).json(breakdown);

           const notificationCreated =  await notificationController.handleBreakdownRequest(breakdown);
           if(!notificationCreated){
            res.status(500).json({ message: 'Failed to create notification' });
            }

        } catch (error) {
            console.error("Error creating breakdown:", error);
            if (error.name === 'ValidationError') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Server error creating breakdown' });
        }
    }),
    createBreakdownByWorkshop: asyncHandler(async (req, res) => {
        const { status, paymentStatus, estimatedArrivalTime, totalCost, serviceDetails } = req.body; // Removed assignedWorkshop from req.body
    
        const workshopId = req.user._id; // Get workshop ID from req.user (from auth middleware)
    
        try {
            const breakdownId = req.params.id;
            const breakdown = await Breakdown.findById(breakdownId);
    
            if (!breakdown) {
                return res.status(404).json({ message: 'Breakdown request not found' });
            }
    
            // Validate that the breakdown is not already assigned
            if (breakdown.assignedWorkshop) {
                return res.status(400).json({ message: 'Breakdown is already assigned to a workshop' });
            }
    
    
            // Update the breakdown (only allowed fields):
            breakdown.status = status || breakdown.status;
            breakdown.paymentStatus = paymentStatus || breakdown.paymentStatus;
            breakdown.assignedWorkshop = workshopId; // Assign the workshop from req.user
            breakdown.estimatedArrivalTime = estimatedArrivalTime || breakdown.estimatedArrivalTime;
            breakdown.totalCost = totalCost || breakdown.totalCost;
            breakdown.serviceDetails = serviceDetails || breakdown.serviceDetails;
    
            const updatedBreakdown = await breakdown.save();
            res.json(updatedBreakdown);
            const notificationCreated = await notificationController.handleBreakdownApproval(updatedBreakdown)
            if(!notificationCreated){
                res.status(500).json({ message: 'Failed to create notification' });
                }
    
        } catch (error) {
            console.error("Error updating breakdown by workshop:", error);
            if (error.name === 'ValidationError') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Server error updating breakdown' });
        }
    }),

    getBreakdowns: asyncHandler(async (req, res) => {
        try {
            const user = req.user; // Get user from auth middleware

            if (user.userType === 'owner') {
                // Owner gets breakdowns related to their vehicles
                const breakdowns = await Breakdown.find({ user: user._id })  // Filter by user
                    .populate('user')
                    .populate('assignedWorkshop')
                    .populate('reportedBy');
                res.json(breakdowns);
            } else if (user.userType === 'workshop') {
                // Workshop gets breakdowns they are assigned to
                const breakdowns = await Breakdown.find({ assignedWorkshop: user._id }) // Filter by assignedWorkshop
                    .populate('user')
                    .populate('assignedWorkshop')
                    .populate('reportedBy');
                res.json(breakdowns);
            } else if (user.userType === 'admin') {
                // Admin gets all breakdowns
                const breakdowns = await Breakdown.find()
                    .populate('user')
                    .populate('assignedWorkshop')
                    .populate('reportedBy');
                res.json(breakdowns);
            } else {
              return res.status(403).json({ message: 'Unauthorized: Invalid user type' });
            }

        } catch (error) {
            console.error("Error getting breakdowns:", error);
            res.status(500).json({ message: 'Server error getting breakdowns' });
        }
    }),

    getBreakdownById: asyncHandler(async (req, res) => {
        const breakdownId = req.params.id;
        const user = req.user;

        try {
            const breakdown = await Breakdown.findById(breakdownId)
                .populate('user')
                .populate('assignedWorkshop')
                .populate('reportedBy');

            if (!breakdown) {
                return res.status(404).json({ message: 'Breakdown not found' });
            }

            // Authorization check based on user type
            if (user.userType === 'owner' && breakdown.user.toString() !== user._id.toString()) {
                return res.status(403).json({ message: 'Unauthorized: You are not the owner of this breakdown' });
            } else if (user.userType === 'workshop' && breakdown.assignedWorkshop?.toString() !== user._id.toString()) {
                return res.status(403).json({ message: 'Unauthorized: You are not assigned to this breakdown' });
            } else if (user.userType !== 'admin') {
              return res.status(403).json({ message: 'Unauthorized: Invalid user type' });
            }

            res.json(breakdown);
        } catch (error) {
            console.error("Error getting breakdown by ID:", error);
            res.status(500).json({ message: 'Server error getting breakdown' });
        }
    }),

    updateBreakdownByOwner: asyncHandler(async (req, res) => {
        const breakdownId = req.params.id;
        const { vehicle, location, address, description, photos } = req.body; // Only these fields are editable by the owner

        try {
            const breakdown = await Breakdown.findById(breakdownId);
            if (!breakdown) {
                return res.status(404).json({ message: 'Breakdown not found' });
            }

            // Verify that the current user is the owner of the breakdown
            if (breakdown.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Unauthorized: You are not the owner of this breakdown' });
            }

            breakdown.vehicle = vehicle || breakdown.vehicle;
            breakdown.location = location || breakdown.location;
            breakdown.address = address || breakdown.address;
            breakdown.description = description || breakdown.description;
            breakdown.photos = photos || breakdown.photos;

            const updatedBreakdown = await breakdown.save();
            res.json(updatedBreakdown);

        } catch (error) {
            console.error("Error updating breakdown by owner:", error);
            if (error.name === 'ValidationError') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Server error updating breakdown' });
        }
    }),

    cancelBreakdownByOwner: asyncHandler(async (req, res) => {
        const breakdownId = req.params.id;

        try {
            const breakdown = await Breakdown.findById(breakdownId);
            if (!breakdown) {
                return res.status(404).json({ message: 'Breakdown not found' });
            }

            if (breakdown.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Unauthorized: You are not the owner of this breakdown' });
            }

            // Set the status to 'cancelled' or any other appropriate status
            breakdown.status = 'cancelled'; // Or another status like 'rejected'
            await breakdown.save();

            res.json({ message: 'Breakdown request cancelled successfully' });

        } catch (error) {
            console.error("Error cancelling breakdown:", error);
            res.status(500).json({ message: 'Server error cancelling breakdown' });
        }
    }),

    updateBreakdownByWorkshop: asyncHandler(async (req, res) => {
        const { status, paymentStatus } = req.body; // Only these fields are updated by workshop

        const workshopId = req.user._id;

        try {
            const breakdownId = req.params.id;
            const breakdown = await Breakdown.findById(breakdownId);

            if (!breakdown) {
                return res.status(404).json({ message: 'Breakdown request not found' });
            }

            if (!breakdown.assignedWorkshop || breakdown.assignedWorkshop.toString() !== workshopId.toString()) {
              return res.status(403).json({ message: 'Unauthorized: You are not assigned to this breakdown' });
            }

            breakdown.status = status || breakdown.status;
            breakdown.paymentStatus = paymentStatus || breakdown.paymentStatus;


            const updatedBreakdown = await breakdown.save();
            res.json(updatedBreakdown);

        } catch (error) {
            console.error("Error updating breakdown by workshop:", error);
            if (error.name === 'ValidationError') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Server error updating breakdown' });
        }
    }),
    deleteBreakdown: asyncHandler(async (req, res) => {
        const breakdownId = req.params.id;
        try {
            const breakdown = await Breakdown.findById(breakdownId);
            if (!breakdown) {
                return res.status(404).json({ message: 'Breakdown not found' });
            }
            await breakdown.remove();
            res.json({ message: 'Breakdown deleted successfully' });
        } catch (error) {
            console.error("Error deleting breakdown:", error);
            res.status(500).json({ message: 'Server error deleting breakdown' });
        }
    }),
};

module.exports = breakdownController;