const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
    unique: true, // One user can only have one admin profile
    message: 'Admin must be associated with a unique user'
  },
  role: {
    type: String,
    enum: ['superadmin', 'moderator', 'editor'], // Define roles
    default: 'moderator',
    required: true,
    message: 'Admin role is required'
  },
  permissions: { // Optional: More granular control
    type: [String],
    // Example: ['read_users', 'write_users', 'delete_users', 'read_workshops', ...]
  },
  // Add other admin-specific fields as needed, e.g.:
  lastLogin: { type: Date },
  notes: { type: String }, // Admin notes about the user
  // ... any other fields relevant to admin users

}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;