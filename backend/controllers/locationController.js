const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const geolib = require('geolib');

const locationController = {
    // @desc    Find nearby workshops
    // @route   GET /api/locations/workshops/nearby
    // @access  Public
    findNearbyWorkshops: asyncHandler(async (req, res) => {
        const { latitude, longitude, radius } = req.query; // Radius in meters

        if (!latitude || !longitude || !radius) {
            res.status(400);
            throw new Error('Latitude, longitude, and radius are required');
        }

        const workshops = await User.find({ role: 'workshop', isVerified: true });

        const nearbyWorkshops = workshops.filter((workshop) => {
            if (workshop.location && workshop.location.coordinates) {
                const workshopLatitude = workshop.location.coordinates[1];
                const workshopLongitude = workshop.location.coordinates[0];

                const distance = geolib.getDistance(
                    { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
                    { latitude: workshopLatitude, longitude: workshopLongitude }
                );

                return distance <= parseFloat(radius);
            }
            return false;
        });

        res.json(nearbyWorkshops);
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