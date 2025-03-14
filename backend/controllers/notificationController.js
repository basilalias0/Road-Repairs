const asyncHandler = require('express-async-handler');
const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const transporter = require('../utils/emailTransporter'); // Your nodemailer transporter
const Breakdown = require('../models/breakdownModel');

const notificationController = {
    // @desc    Create a new notification and send email (if applicable)
    // @route   POST /api/notifications
    // @access  Private (Admin only)
    createNotification: asyncHandler(async (req, res) => {
        const { userId, message, relatedObjectId, type } = req.body;

        const notification = await Notification.create({
            user: userId,
            message,
            relatedObjectId,
            type,
        });

        if (notification) {
            // Send email based on notification type (optional)
            await sendNotificationEmail(userId, message, type, relatedObjectId);

            if (res && res.status) { // checks if res object exists.
                res.status(201).json(notification);
            }
        } else {
            if(res && res.status){
                res.status(400);
                throw new Error('Invalid notification data');
            }
        }
    }),

    // @desc    Get all notifications for a user
    // @route   GET /api/notifications/my
    // @access  Private
    getUserNotifications: asyncHandler(async (req, res) => {
        const notifications = await Notification.find({ user: req.user._id }).populate('relatedObjectId');
        res.json(notifications);
    }),

    // @desc    Get a specific notification by ID
    // @route   GET /api/notifications/:id
    // @access  Private
    getNotificationById: asyncHandler(async (req, res) => {
        const notification = await Notification.findById(req.params.id).populate('relatedObjectId');

        if (notification) {
            res.json(notification);
        } else {
            res.status(404);
            throw new Error('Notification not found');
        }
    }),

    // @desc    Delete a notification
    // @route   DELETE /api/notifications/:id
    // @access  Private
    deleteNotification: asyncHandler(async (req, res) => {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            res.status(404);
            throw new Error('Notification not found');
        }

        await notification.remove();
        res.json({ message: 'Notification deleted successfully' });
    }),
};

// Helper function to send email based on notification type
async function sendNotificationEmail(userId, message, type, relatedObjectId) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            console.error('User not found for notification email.');
            return;
        }

        let subject = 'Notification from our service';
        let emailBody = message;

        // Customize email based on notification type
        if (type === 'new_breakdown') {
            const breakdown = await Breakdown.findById(relatedObjectId);
            if (breakdown) {
                subject = 'New Breakdown Request';
                emailBody = `A new breakdown request has been submitted near you:\n\nDescription: ${breakdown.description}\nLocation: ${breakdown.location}\nVehicle Type: ${breakdown.vehicleType}\nIssue Type: ${breakdown.issueType}\n\nPlease check the application for more details.`;
            }
        } else if (type === 'breakdown_assigned') {
            // Add other notification type specific email content
            subject = 'Breakdown Assigned';
            emailBody = message;
        } else if (type === 'new_review'){
            subject = "New Review Received";
            emailBody = message;
        } else if (type === 'payment_received'){
            subject = "Payment Received";
            emailBody = message;
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: subject,
            text: emailBody,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Notification email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending notification email:', error);
    }
}

module.exports = notificationController;