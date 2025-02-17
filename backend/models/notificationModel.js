const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { // User who should receive the notification
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    message: 'Recipient user is required'
  },
  type: { // e.g., 'breakdown_request', 'workshop_response', 'payment_received', 'review_received', 'breakdown_assigned', 'breakdown_completed'
    type: String,
    required: true,
    enum: [ // Define all possible notification types
      'breakdown_request',
      'workshop_response',
      'payment_received',
      'review_received',
      'breakdown_assigned',
      'breakdown_completed',
      'breakdown_cancelled',
      'user_registered', // For admin notifications
      'workshop_approved', // For workshop approval notifications
      'message_received', // For chat messages
      // ... add other notification types as needed
    ],
    message: 'Invalid notification type'
  },
  relatedObjectId: { // ID of the related object (e.g., Breakdown ID, Review ID, Message ID)
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'modelType', // Dynamically reference the model
    message: 'Related object ID is required'
  },
  modelType: { // The model the relatedObjectId refers to
    type: String,
    enum: ['Breakdown', 'User', 'Review', 'Message'], // Add other model names as needed
    required: true,
    message: 'Model type is required'
  },
  message: { // A human-readable message (can be generated dynamically)
    type: String,
    required: true,
    message: 'Notification message is required'
  },
  read: { // Whether the user has read the notification
    type: Boolean,
    default: false
  },
  createdAt: { // Override default timestamps for more control
    type: Date,
    default: Date.now
  }
}, { timestamps: false }); // Disable default timestamps

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;