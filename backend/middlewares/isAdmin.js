
const User = require('../models/User'); // Import your User model
const Admin = require('../models/Admin')

const isAdmin = async (req, res, next) => {
    if (req.user.id) {
      try {
        // Now fetch the user from the database (only for admin check)
        const user = await User.findById(req.user._id);
  
        if (!user) {
          return res.status(401).json({ message: 'User not found' });
        }
  
        const admin = await Admin.findOne({ user: req.user._id });
        if (admin) {
          req.admin = admin;
          next();
        } else {
          res.status(403).json({ message: 'Unauthorized, not an admin' });
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        res.status(500).json({ message: 'Server Error' });
      }
    } else {
      res.status(401).json({ message: 'Unauthorized, no token' });
    }
  };
  
  module.exports = isAdmin