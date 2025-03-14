

const transporter = nodemailer.createTransport({
    // Your email service configuration (e.g., Gmail, SendGrid, etc.)
    service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASSWORD, // Your email password or app password
    },
  });


  module.exports = transporter;