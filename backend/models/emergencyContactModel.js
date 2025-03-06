const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
}, { timestamps: true });

const EmergencyContact = mongoose.model('EmergencyContact', emergencyContactSchema);
module.exports = EmergencyContact;