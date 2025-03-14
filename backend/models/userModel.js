const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    role: {
        type: String,
        enum: ['customer', 'workshop', 'admin'],
        required: true,
    },
    isVerified: { type: Boolean, default: false }, // For workshop verification
    profilePicture: { type: String }, // URL to profile picture
    // Workshop-specific fields
    businessName: { type: String },
    servicesOffered: [{ type: String }],
    hoursOfOperation: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String },
    },
    location: { // For storing GPS coordinates
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },
    resetPin: { type: String }, // Add resetPin field
    resetPinExpiry: { type: Date }, // Add resetPinExpiry field
}, { timestamps: true });

userSchema.index({ location: '2dsphere' }); // For geospatial queries

const User = mongoose.model('User', userSchema);

module.exports = User;