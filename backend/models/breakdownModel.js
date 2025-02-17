const mongoose = require('mongoose');

// Breakdown Schema (as before, with minor adjustments)
const breakdownSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    message: 'User is required'
  },
  vehicle: {
    type: Object,
    required: true,
    message: 'Vehicle details are required'
  },
  location: { /* ... */ }, // Same as before
  address: { /* ... */ }, // Same as before
  description: { /* ... */ }, // Same as before
  photos: { /* ... */ }, // Same as before
  status: { /* ... */ }, // Same as before
  assignedWorkshop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    message: 'Assigned workshop must reference a valid user'
  },
  estimatedArrivalTime: { type: Date },
  serviceDetails: { type: String }, // Details of the service provided
  reportedBy: { // Add a field for who reported, in case it's not the vehicle owner.
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    message: 'Reported by must reference a valid user'
  },
  paymentStatus: { // 'pending', 'completed'
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending',
    message: 'Invalid payment status'
  },
  totalCost: {
    type: Number,
    min: 0,
    message: 'Total cost cannot be negative'
  },
}, { timestamps: true });

const Breakdown = mongoose.model('Breakdown', breakdownSchema);

module.exports = Breakdown


