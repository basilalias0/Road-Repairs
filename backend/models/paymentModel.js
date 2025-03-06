const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop' },
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'BreakdownRequest' },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['card', 'cash'] },
    stripePaymentId: { type: String },
    status: { type: String, enum: ['success', 'failed'], default: 'pending' },
    vendorOrder: {type: mongoose.Schema.Types.ObjectId, ref: 'Order'}, //for vendor orders
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;