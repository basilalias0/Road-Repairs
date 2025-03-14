const mongoose = require('mongoose');

const breakdownSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Customer
    vehicle: {
        make: { type: String },
        model: { type: String },
        year: { type: Number },
        registrationNumber: { type: String },
    },
    location: { // Where the breakdown occurred
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },
    address: { type: String }, // Text address
    description: { type: String, required: true },
    photos: [{ type: String }], // URLs to photos
    status: {
        type: String,
        enum: ['pending', 'accepted', 'in progress', 'completed', 'cancelled'],
        default: 'pending',
    },
    assignedWorkshop: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Workshop
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Customer who reported
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
}, { timestamps: true });

breakdownSchema.index({ location: '2dsphere' });

const Breakdown = mongoose.model('Breakdown', breakdownSchema);

module.exports = Breakdown;