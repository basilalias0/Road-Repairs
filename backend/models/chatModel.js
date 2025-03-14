const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    breakdown: { type: mongoose.Schema.Types.ObjectId, ref: 'Breakdown', required: true },
    status: {
        type: String,
        enum: ['sent', 'received', 'read'],
        default: 'sent',
    },
}, { timestamps: true });

const Chat = mongoose.model('Message', chatSchema);

module.exports = Chat;