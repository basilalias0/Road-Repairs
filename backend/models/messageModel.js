const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    message: 'Sender is required'
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    message: 'Recipient is required'
  },
  message: {
    type: String,
    required: true,
    message: 'Message content is required'
  },
  timestamp: { // Use a Date for timestamps
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  },
  breakdown: { // Optional: Link message to a specific breakdown
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Breakdown',
    message: 'Message can optionally be linked to a breakdown'
  }
}, { timestamps: false }); // We're handling timestamps ourselves

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;