const mongoose = require('mongoose');

const breakdownRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleDetails: { type: mongoose.Schema.Types.ObjectId, ref: 'User.vehicleDetails' },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], index: '2dsphere' }, // [longitude, latitude]
    },
    description: { type: String, required: true },
    photos: [{ type: String }],
    status: { type: String, enum: ['pending', 'accepted', 'declined', 'completed'], default: 'pending' },
    workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', default: null },
    estimatedArrivalTime: { type: Date },
    priceQuote: { type: Number },
}, { timestamps: true });

const BreakdownRequest = mongoose.model('BreakdownRequest', breakdownRequestSchema);
module.exports = BreakdownRequest;