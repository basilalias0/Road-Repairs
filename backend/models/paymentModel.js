const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    breakdown: { type: mongoose.Schema.Types.ObjectId, ref: 'Breakdown', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workshop: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['stripe', 'paypal', 'cash'], required: true },
    transactionId: { type: String }, // Transaction ID from Stripe or PayPal
    status: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    notes: {type: String}, // Additional notes about the payment
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;