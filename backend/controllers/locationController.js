const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const geolib = require('geolib');

const locationController = {
    // @desc    Find nearby workshops
    // @route   GET /api/locations/workshops/nearby
    // @access  Public
    findNearbyAndRatedWorkshops: asyncHandler(async (req, res) => {
        const { latitude, longitude, radius, issueType } = req.query; // Radius in meters

        if (!latitude || !longitude || !radius || !issueType) {
            res.status(400);
            throw new Error('Latitude, longitude, radius, and issueType are required');
        }

        const workshops = await User.aggregate([
            {
                $match: {
                    role: 'workshop',
                    isVerified: true,
                    servicesOffered: issueType,
                },
            },
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)],
                    },
                    distanceField: 'distance',
                    maxDistance: parseFloat(radius) * 1000, // Convert kilometers to meters
                    spherical: true,
                },
            },
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'workshop',
                    as: 'reviews',
                },
            },
            {
                $project: {
                    _id: 1,
                    businessName: 1,
                    servicesOffered: 1,
                    distance: 1,
                    averageRating: { $avg: '$reviews.rating' },
                },
            },
            { $sort: { averageRating: -1 } },
            { $limit: 15 },
        ]);

        res.json(workshops);
    }),

    // @desc    Calculate distance between two points
    // @route   GET /api/locations/distance
    // @access  Public
    calculateDistance: asyncHandler(async (req, res) => {
        const { lat1, lon1, lat2, lon2 } = req.query;

        if (!lat1 || !lon1 || !lat2 || !lon2) {
            res.status(400);
            throw new Error('Latitude and longitude for both points are required');
        }

        const distance = geolib.getDistance(
            { latitude: parseFloat(lat1), longitude: parseFloat(lon1) },
            { latitude: parseFloat(lat2), longitude: parseFloat(lon2) }
        );

        res.json({ distance });
    }),
};

module.exports = locationController;