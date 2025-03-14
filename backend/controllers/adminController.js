const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Breakdown = require('../models/breakdownModel');
const Review = require('../models/reviewModel');
const Notification = require('../models/notificationModel');
const bcrypt = require('bcryptjs')

const adminController = {
    // Get all users (customers, workshops, admins)
    getAllUsers: asyncHandler(async (req, res) => {
        const users = await User.find();
        res.json(users);
    }),

    // Get all workshops
    getAllWorkshops: asyncHandler(async (req, res) => {
        const workshops = await User.find({ role: 'workshop' });
        res.json(workshops);
    }),

    // Get all customers
    getAllCustomers: asyncHandler(async (req, res) => {
        const customers = await User.find({ role: 'customer' });
        res.json(customers);
    }),

    // Get all breakdowns
    getAllBreakdowns: asyncHandler(async (req, res) => {
        const breakdowns = await Breakdown.find().populate('user').populate('assignedWorkshop');
        res.json(breakdowns);
    }),

    // Get all reviews
    getAllReviews: asyncHandler(async (req, res) => {
        const reviews = await Review.find().populate('user').populate('workshop');
        res.json(reviews);
    }),

    // Get all notifications
    getAllNotifications: asyncHandler(async (req, res) => {
        const notifications = await Notification.find().populate('user').populate('relatedObjectId');
        res.json(notifications);
    }),

    // Verify a workshop
    verifyWorkshop: asyncHandler(async (req, res) => {
        const workshopId = req.params.id;
        const workshop = await User.findById(workshopId);

        if (!workshop) {
            res.status(404).json({ message: 'Workshop not found' });
            return;
        }

        if (workshop.role !== 'workshop') {
            res.status(400).json({ message: 'User is not a workshop' });
            return;
        }

        workshop.isVerified = true;
        await workshop.save();

        res.json({ message: 'Workshop verified successfully' });
    }),

    // Suspend a workshop
    suspendWorkshop: asyncHandler(async (req, res) => {
        const workshopId = req.params.id;
        const workshop = await User.findById(workshopId);

        if (!workshop) {
            res.status(404).json({ message: 'Workshop not found' });
            return;
        }

        if (workshop.role !== 'workshop') {
            res.status(400).json({ message: 'User is not a workshop' });
            return;
        }

        workshop.isVerified = false; // Set to unverified
        await workshop.save();

        res.json({ message: 'Workshop suspended successfully' });
    }),

    // Delete a workshop (and related data)
    deleteWorkshop: asyncHandler(async (req, res) => {
        const workshopId = req.params.id;
        const workshop = await User.findById(workshopId);

        if (!workshop) {
            res.status(404).json({ message: 'Workshop not found' });
            return;
        }

        if (workshop.role !== 'workshop') {
            res.status(400).json({ message: 'User is not a workshop' });
            return;
        }

        // Delete related data (breakdowns, reviews, etc.)
        await Breakdown.deleteMany({ assignedWorkshop: workshopId });
        await Review.deleteMany({ workshop: workshopId });

        await User.findByIdAndDelete(workshopId);

        res.json({ message: 'Workshop deleted successfully' });
    }),

    // Add an admin
    addAdmin: asyncHandler(async (req, res) => {
        const { name, email, password, phone, address } = req.body;

        if(!name || !email || !password) {
            res.status(400).json({ message: 'Please fill in all fields' });
            return;
        }
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            res.status(400).json({ message: 'Admin already exists' });
            return;
        }
          // Encrypt the password
        const salt = await bcrypt.genSalt(10); // Generate a salt
        const hashedPassword = await bcrypt.hash(password, salt); // Hash the password


        const admin = await User.create({
            name,
            email,
            password:hashedPassword,
            phone,
            address,
            role: 'admin',
            isVerified: true, // Automatically verify the admin
        });

        res.status(201).json(admin);
    }),
};

module.exports = adminController;