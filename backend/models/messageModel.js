const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
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

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;