const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userType: {
    type: String,
    required: true,
    enum: ['owner', 'workshop'],
    message: 'User type must be "owner" or "workshop"' // Custom error message
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, // Email validation regex
    message: 'Invalid email address'
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters'], // Minlength with custom message
    //  IMPORTANT: Do NOT store plain passwords. Use bcrypt to hash!
  },
  firstName: {
    type: String,
    required: true,
    trim: true // Remove leading/trailing spaces
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    match: /^\d{10}$/, // Example 10-digit phone number validation (adjust as needed)
    message: 'Invalid phone number'
  },
  address: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      message: 'Location type must be "Point"'
    },
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere', // For geospatial queries
      validate: [
        (val) => val.length === 2, // Ensure coordinates array has two elements
        'Coordinates must be an array of [longitude, latitude]'
      ]
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profilePicture: {
    type: String
  },

  // Workshop-specific fields (only if userType is 'workshop')
  businessName: {
    type: String,
    required: function() { return this.userType === 'workshop'; }, // Conditional validation
    trim: true
  },
  servicesOffered: {
    type: [String],
    required: function() { return this.userType === 'workshop'; }
  },
  workshopPhotos: {
    type: [String]
  },
  operatingHours: {
    type: String
  },
  registrationNumber: {
    type: String
  },
  approved: {
    type: Boolean,
    default: false
  },

  // Vehicle Owner Specific
  emergencyContact: {
    type: String,
    required: function() { return this.userType === 'owner'; }
  },
  vehicleDetails: [{
    make: String,
    model: String,
    year: Number,
    registrationNumber: String
  }],

  isActive: {
    type: Boolean,
    default: true
  },

  resetPasswordToken: String,
  resetPasswordExpires: Date,

}, 
{ timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;