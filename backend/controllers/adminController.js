const Admin = require("../models/adminModel");
const User = require("../models/userModel");

const adminController = {
    createAdmin: asyncHandler(async (req, res) => {
        const { user, role, permissions } = req.body;

        const existingUser = await User.findById(user);
        if (!existingUser) {
            res.status(400);
            throw new Error('User not found');
        }

        const adminExists = await Admin.findOne({ user });
        if (adminExists) {
            res.status(400);
            throw new Error('Admin profile already exists for this user');
        }

        const admin = await Admin.create({
            user,
            role,
            permissions: permissions || [],
        });

        if (admin) {
            res.status(201).json({
                _id: admin._id,
                user: admin.user,
                role: admin.role,
                permissions: admin.permissions,
            });
        } else {
            res.status(400);
            throw new Error('Invalid admin data');
        }
    }),

    getAdmins: asyncHandler(async (req, res) => {
        const admins = await Admin.find().populate('user', '-password');
        res.json(admins);
    }),

    getAdminById: asyncHandler(async (req, res) => {
        const adminId = req.params.id;
        const admin = await Admin.findById(adminId).populate('user', '-password');

        if (!admin) {
            res.status(404);
            throw new Error('Admin not found');
        }

        res.json(admin);
    }),

    updateAdmin: asyncHandler(async (req, res) => {
        const adminId = req.params.id;
        const { role, permissions } = req.body;

        const admin = await Admin.findById(adminId);

        if (!admin) {
            res.status(404);
            throw new Error('Admin not found');
        }

        admin.role = role || admin.role;
        admin.permissions = permissions || admin.permissions;

        const updatedAdmin = await admin.save();

        res.json(updatedAdmin);
    }),

    deleteAdmin: asyncHandler(async (req, res) => {
        const adminId = req.params.id;

        const admin = await Admin.findById(adminId);

        if (!admin) {
            res.status(404);
            throw new Error('Admin not found');
        }

        await admin.remove();
        res.json({ message: 'Admin deleted successfully' });
    }),
    getBreakdowns: asyncHandler(async (req, res) => {
        const breakdowns = await Breakdown.find().populate('car').populate('user');
        res.json(breakdowns);
    }),

    getBreakdownById: asyncHandler(async (req, res) => {
        const breakdownId = req.params.id;
        const breakdown = await Breakdown.findById(breakdownId).populate('car').populate('user');

        if (!breakdown) {
            res.status(404);
            throw new Error('Breakdown not found');
        }

        res.json(breakdown);
    }),

    getReviews: asyncHandler(async (req, res) => {
        const reviews = await Review.find().populate('user', 'firstName lastName').populate('workshop');
        res.json(reviews);
    }),

    getReviewById: asyncHandler(async (req, res) => {
        const reviewId = req.params.id;
        const review = await Review.findById(reviewId)
            .populate('user', 'firstName lastName')
            .populate('workshop')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'firstName lastName',
                },
            });

        if (!review) {
            res.status(404);
            throw new Error('Review not found');
        }

        res.json(review);
    }),

    getWorkshops: asyncHandler(async (req, res) => {
        const workshops = await Workshop.find();
        res.json(workshops);
    }),

    getWorkshopById: asyncHandler(async (req, res) => {
        const workshopId = req.params.id;
        const workshop = await Workshop.findById(workshopId);

        if (!workshop) {
            res.status(404);
            throw new Error('Workshop not found');
        }

        res.json(workshop);
    }),

    getUsers: asyncHandler(async (req, res) => {
        const users = await User.find().select('-password');
        res.json(users);
    }),

    getUserById: asyncHandler(async (req, res) => {
        const userId = req.params.id;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        res.json(user);
    }),

    getCars: asyncHandler(async (req, res) => {
        const cars = await Car.find().populate('owner');
        res.json(cars);
    }),

    getCarById: asyncHandler(async (req, res) => {
        const carId = req.params.id;
        const car = await Car.findById(carId).populate('owner');

        if (!car) {
            res.status(404);
            throw new Error('Car not found');
        }

        res.json(car);
    }),
};

module.exports = adminController;