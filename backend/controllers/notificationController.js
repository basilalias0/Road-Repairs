const asyncHandler = require('express-async-handler');
const Notification = require('../models/notificationModel');
const Breakdown = require('../models/breakdownModel'); // Import Breakdown model
const User = require('../models/userModel'); // Import User model
const transporter = require('../config/nodemailer'); // Import your nodemailer transporter

const notificationController = {
    // Function to create a notification (used internally)
    createNotification: async (user, type, relatedObjectId, modelType, message) => {
        try {
            const notification = await Notification.create({
                user,
                type,
                relatedObjectId,
                modelType,
                message,
            });
            return notification;
        } catch (error) {
            console.error("Error creating notification:", error);
            throw error; // Re-throw the error for handling in the calling function
        }
    },

    // Function to send email notification
    sendEmailNotification: async (user, message) => {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: "New Notification", // Customize the email subject
                html: `<p>${message}</p>`, // Customize the email body
            };

            const info = await transporter.sendMail(mailOptions);
            console.log("Email sent: " + info.response);
        } catch (error) {
            console.error("Error sending email:", error);
            // Handle the error appropriately (e.g., log it, but don't stop the notification process)
        }
    },

    // Example: Create notification when a breakdown is requested
    handleBreakdownRequest: async (breakdown) => {
        try {
            const workshopUsers = await User.find({ userType: 'workshop' }); // Find all workshops

            if (!workshopUsers || workshopUsers.length === 0) {
                console.log("No workshops found to send notifications.");
                return; // No workshops found to send notifications
            }

            for (const workshop of workshopUsers) {
                const message = `A new breakdown request has been submitted. Breakdown ID: ${breakdown._id}`;

                const notification = await notificationController.createNotification(
                    workshop._id,
                    'breakdown_request',
                    breakdown._id,
                    'Breakdown',
                    message
                );

                if (notification) {
                    await notificationController.sendEmailNotification(workshop, message);
                }

            }

        } catch (error) {
            console.error("Error handling breakdown request:", error);
        }
    },

    // Example: Create notification when a workshop approves a breakdown
    handleBreakdownApproval: async (breakdown) => {
        try {
            const owner = await User.findById(breakdown.user); // Find the owner
            if (!owner) {
                console.error('Owner not found for this breakdown');
                return;
            }

            const message = `Your breakdown request has been approved. Breakdown ID: ${breakdown._id}`;

            const notification = await notificationController.createNotification(
                owner._id,
                'workshop_response',
                breakdown._id,
                'Breakdown',
                message
            );

            if (notification) {
                await notificationController.sendEmailNotification(owner, message);
            }

        } catch (error) {
            console.error("Error handling breakdown approval:", error);
        }
    },


    getNotifications: asyncHandler(async (req, res) => {
        try {
            const userId = req.user._id;
            const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 }); // Sort by latest
            res.json(notifications);
        } catch (error) {
            console.error("Error getting notifications:", error);
            res.status(500).json({ message: 'Server error getting notifications' });
        }
    }),

    markAsRead: asyncHandler(async (req, res) => {
        const notificationId = req.params.id;
        const userId = req.user._id;

        try {
            const notification = await Notification.findById(notificationId);
            if (!notification) {
                return res.status(404).json({ message: 'Notification not found' });
            }

            if (notification.user.toString() !== userId.toString()) {
                return res.status(403).json({ message: 'Unauthorized: You are not the owner of this notification' });
            }

            notification.read = true;
            await notification.save();
            res.json({ message: 'Notification marked as read' });
        } catch (error) {
            console.error("Error marking notification as read:", error);
            res.status(500).json({ message: 'Server error updating notification' });
        }
    }),

    deleteNotification: asyncHandler(async (req, res) => {
        const notificationId = req.params.id;
        const userId = req.user._id;

        try {
            const notification = await Notification.findById(notificationId);
            if (!notification) {
                return res.status(404).json({ message: 'Notification not found' });
            }

            if (notification.user.toString() !== userId.toString()) {
                return res.status(403).json({ message: 'Unauthorized: You are not the owner of this notification' });
            }

            await notification.remove();
            res.json({ message: 'Notification deleted successfully' });
        } catch (error) {
            console.error("Error deleting notification:", error);
            res.status(500).json({ message: 'Server error deleting notification' });
        }
    }),
};

module.exports = notificationController;