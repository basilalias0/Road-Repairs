const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: [
            'breakdown_request',
            'workshop_response',
            'payment_received',
            'review_received',
            'breakdown_assigned',
            'breakdown_completed',
            'breakdown_cancelled',
            'user_registered',
            'workshop_approved',
            'message_received',
            'workshop_on_the_way',
            'payment_confirmation',
            'breakdown_accepted',
            'breakdown_rejected'
        ],
        required: true,
    },
    relatedObjectId: { type: mongoose.Schema.Types.ObjectId, refPath: 'modelType' },
    modelType: { type: String, enum: ['Breakdown', 'User', 'Review', 'Message'] },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: false });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;