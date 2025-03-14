const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');
const transporter = require('../utils/emailTransporter');

const userController = {
    // @desc    Register a new user
    // @route   POST /api/users
    // @access  Public
    registerUser: asyncHandler(async (req, res) => {
        const { name, email, password, role, phone, address, businessName, servicesOffered, hoursOfOperation, daysOff, location } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            phone,
            address,
            businessName,
            servicesOffered,
            hoursOfOperation,
            daysOff,
            location,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    }),

    // @desc    Authenticate a user
    // @route   POST /api/users/login
    // @access  Public
    loginUser: asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    }),

    // @desc    Get user profile
    // @route   GET /api/users/profile
    // @access  Private
    getUserProfile: asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                businessName: user.businessName,
                servicesOffered: user.servicesOffered,
                hoursOfOperation: user.hoursOfOperation,
                daysOff: user.daysOff,
                location: user.location,
                profilePicture: user.profilePicture,
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    }),

    // @desc    Update user profile
    // @route   PUT /api/users/profile
    // @access  Private
    updateUserProfile: asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            user.address = req.body.address || user.address;
            user.businessName = req.body.businessName || user.businessName;
            user.servicesOffered = req.body.servicesOffered || user.servicesOffered;
            user.hoursOfOperation = req.body.hoursOfOperation || user.hoursOfOperation;
            user.daysOff = req.body.daysOff || user.daysOff;
            
            if (req.file) {
              user.profilePicture = req.file.path; // Use the path from multer-storage-cloudinary
            }

            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            if (req.body.location) {
              try {
                  const geocodeResponse = await client.geocode({
                      params: {
                          address: req.body.location,
                          key: process.env.GOOGLE_MAPS_API_KEY,
                      },
                      timeout: 1000, // milliseconds
                  });

                  if (geocodeResponse.data.results && geocodeResponse.data.results.length > 0) {
                      const { lat, lng } = geocodeResponse.data.results[0].geometry.location;
                      user.location = {
                          type: 'Point',
                          coordinates: [lng, lat], // [longitude, latitude]
                      };
                  } else {
                      console.error('Geocoding failed: No results found.');
                      // Optionally, handle the error (e.g., return a message to the client)
                  }
              } catch (error) {
                  console.error('Geocoding error:', error);
                  // Optionally, handle the error
              }
          }


            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                token: generateToken(updatedUser._id, updatedUser.role),
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    }),
     // @desc    Forgot password - generate and send reset pin
    // @route   POST /api/users/forgotpassword
    // @access  Public
    forgotPassword: asyncHandler(async (req, res) => {
      const { email } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
          res.status(404);
          throw new Error('User not found');
      }

      const resetPin = crypto.randomInt(100000, 999999).toString(); // Generate 6-digit pin
      user.resetPin = resetPin;
      user.resetPinExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

      await user.save();

      const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: 'Password Reset Pin',
          text: `Your password reset pin is: ${resetPin}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.error(error);
              res.status(500).json({ message: 'Failed to send email' });
          } else {
              console.log('Email sent: ' + info.response);
              res.json({ message: 'Reset pin sent to your email' });
          }
      });
  }),

  // @desc    Reset password using pin
  // @route   PUT /api/users/resetpassword
  // @access  Public
  resetPassword: asyncHandler(async (req, res) => {
      const { email, pin, newPassword } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
          res.status(404);
          throw new Error('User not found');
      }

      if (user.resetPin !== pin || user.resetPinExpiry < Date.now()) {
          res.status(400);
          throw new Error('Invalid or expired reset pin');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      user.password = hashedPassword;
      user.resetPin = undefined; // Clear reset pin
      user.resetPinExpiry = undefined;

      await user.save();

      res.json({ message: 'Password reset successfully' });
  }),
};

module.exports = userController;