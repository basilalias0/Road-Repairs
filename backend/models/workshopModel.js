const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema({
    businessName: { type: String, required: true },
    ownerFirstName: { type: String, required: true },
    ownerLastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], index: '2dsphere' }, // [longitude, latitude]
    },
    servicesOffered: [{ type: String }],
    photos: [{ type: String }],
    videos: [{ type: String }],
    verified: { type: Boolean, default: false },
    verificationToken: { type: String },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    inventory: [{
        partId: { type: mongoose.Schema.Types.ObjectId, ref: 'Part' }, // Corrected ref name
        quantity: { type: Number, default: 0 }
    }],
    role:{type:String, default: "workshop"},
}, { timestamps: true });

const Workshop = mongoose.model('Workshop', workshopSchema);
module.exports = Workshop;