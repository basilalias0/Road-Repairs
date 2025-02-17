const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler'); // Install: npm install express-async-handler
const transporter = require('../utils/nodeMailerTransporter');


const userController={
    generateToken:(id) => {
        return jwt.sign({ id }, process.env.JWT_SECRET, {
          expiresIn: '30d',
        });
      },
    registerUser:asyncHandler(async (req, res) => {
        const { firstName, 
                lastName, 
                email, 
                password, 
                userType, 
                phone, 
                emergencyContact, 
                vehicleDetails } = req.body;
         if (!firstName || !lastName || !email || !password || !userType || !phone) {
        res.status(400);
        throw new Error('Please fill in all required fields'); // More specific error message
        }

        if (userType !== 'owner' && userType !== 'workshop') {
            res.status(400);
            throw new Error('Invalid user type. Must be "owner" or "workshop"');
        }

        if (userType === 'owner' && (!emergencyContact || !vehicleDetails || vehicleDetails.length === 0)) {
            res.status(400);
            throw new Error('Emergency contact and vehicle details are required for owners');
        }

        if (userType === 'workshop' && !req.body.businessName) { // Example: Business name is required for workshops
            res.status(400);
            throw new Error('Business name is required for workshops');
        }
      
        const userExists = await User.findOne({ email });
        if (userExists) {
          res.status(400);
          throw new Error('User already exists'); // Express-async-handler will catch this
        }
      
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
      
        const userCreated = await User.create({
          firstName,
          lastName,
          email,
          password: hashedPassword,
          userType,
          phone,
          emergencyContact,
          vehicleDetails,
        });
      
        if (!userCreated) {
            res.status(500).send("User is not created")
        }
        const verificationToken = crypto.randomBytes(3).toString('hex');
        userCreated.verificationToken = verificationToken;
            await userCreated.save();
        
            const verificationLink = `${process.env.FRONTEND_URL}/verify/${verificationToken}`; // Create verification link
        
            const mailOptions = {
              from: process.env.EMAIL_USER,
              to: userCreated.email,
              subject: "Verify Your Email",
              html: `Please click this link to verify your email: <a href="${verificationLink}">${verificationLink}</a>`, // Use HTML for email content
            };
        
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                res.status(500).json({message: "User registered but email could not be sent."})
              } else {
                console.log("Email sent: " + info.response);
              }
            })
          res.status(201).json({
            _id: userCreated._id,
            firstName: userCreated.firstName,
            lastName: userCreated.lastName,
            email: userCreated.email,
            userType: userCreated.userType,
            message: 'User registered successfully. Please check your email to verify your account.'
          });
      }),

      verifyEmail:asyncHandler(async (req, res) => {
        const { token } = req.params;
      
        const userFound = await User.findOne({ verificationToken: token });
      
        if (!userFound) {
          res.status(400);
          throw new Error('Invalid verification token');
        }
      
        userFound.isVerified = true;
        userFound.verificationToken = undefined;
        await userFound.save();
      
        res.json({ message: 'Email verified successfully' });
      }),
      loginUser:asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        if(!email || !password) {
          res.status(400).json({message: 'Please provide both email and password.'})
          }
      
        const user = await User.findOne({ email });
      
        if (user && (await bcrypt.compare(password, user.password))) {
          if (!user.isVerified) {
            res.status(400);
            throw new Error('Please verify your email first');
          }
          res.json({
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            userType: user.userType,
            token: userController.generateToken(user._id),
          });
        } else {
          res.status(401);
          throw new Error('Invalid credentials');
        }
      }),
      getUserProfile:asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            res.status(404);
            throw new Error('User not found');
          }
        res.json(user);
      }),
      updateUserProfile: asyncHandler(async (req, res) => {
        const { firstName, lastName, email, phone, address, location, emergencyContact, vehicleDetails } = req.body;
      
        const user = await User.findById(req.user._id);
      
        if (user) {
          user.firstName = firstName || user.firstName;
          user.lastName = lastName || user.lastName;
          user.email = email || user.email;
          user.phone = phone || user.phone;
          user.address = address || user.address;
          user.location = location || user.location;
          user.emergencyContact = emergencyContact || user.emergencyContact;
          user.vehicleDetails = vehicleDetails || user.vehicleDetails;
      
          const updatedUser = await user.save();
      
          res.json({
            _id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            phone: updatedUser.phone,
            address: updatedUser.address,
            location: updatedUser.location,
            emergencyContact: updatedUser.emergencyContact,
            vehicleDetails: updatedUser.vehicleDetails,
          });
        } else {
          res.status(404);
          throw new Error('User not found');
        }
      }),
      forgotPassword:asyncHandler(async (req, res) => {
        const { email } = req.body;
      
        const user = await User.findOne({ email });
      
        if (!user) {
          res.status(404);
          throw new Error('User not found');
        }
      
        const resetToken = crypto.randomBytes(20).toString('hex');
      
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();
      
        const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: 'Password Reset Request',
          html: `Please click this link to reset your password: <a href="${resetURL}">${resetURL}</a>`,
        };
      
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
            res.status(500).json({ message: "Password reset email could not be sent." }); // More specific message
          } else {
            console.log("Email sent: " + info.response);
            res.json({ message: 'Password reset email sent' }); // Send success response *after* successful email sending
          }
        });
      }),
      resetPassword: asyncHandler(async (req, res) => {
        const { token } = req.params;
        const { password } = req.body;
      
        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
      
        if (!user) {
          res.status(400);
          throw new Error('Invalid or expired reset token');
        }
      
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
      
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
      
        res.json({ message: 'Password reset successfully' });
      }),
      changePassword:asyncHandler(async (req, res) => {
        const { currentPassword, newPassword } = req.body;
      
        if (!currentPassword || !newPassword) {
          res.status(400);
          throw new Error('Please provide both current and new passwords');
        }
      
        if (newPassword.length < 6) { // Example: Minimum password length
          res.status(400);
          throw new Error('New password must be at least 6 characters long');
        }
      
        const user = await User.findById(req.user._id); // req.user is set by authenticate middleware
      
        if (!user) {
          res.status(404);
          throw new Error('User not found'); // Should not happen if authenticate is working
        }
      
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      
        if (!passwordMatch) {
          res.status(401);
          throw new Error('Incorrect current password');
        }
      
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
      
        user.password = hashedPassword;
        await user.save();
      
        res.json({ message: 'Password changed successfully' });
      }),

      deleteUser:asyncHandler(async (req, res) => {
        const userId = req.user._id; // Get ID from req.user (authenticated user)
    
        const user = await User.findById(userId);
    
        if (!user) {
            res.status(404);
            throw new Error('User not found'); // Should not happen if authentication is working correctly
        }
    
        await user.remove(); // Or User.findByIdAndDelete(userId)
    
        res.json({ message: 'User deleted successfully' });
    })
}

module.exports = userController