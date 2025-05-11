const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Modules/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('../Modules/product');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });





router.get('/Register', (req, res) => {
    res.sendFile(path.join(__dirname, '../login', 'Login.js'));
});



// Register route
router.post('/Register', async (req, res) => {
    // console.log('Request body:', req.body);
    const { firstName, lastName, email, contactNumber, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = new User({ firstName, lastName, email, contactNumber, password });
        await user.save();

        res.status(201).json({ success: true, message: ' registered successfully' });
    } catch (err) {
        console.error('Register Error:', err);  // More explicit
        res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
});


// Login route
router.post('/Login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ success: true, token, user: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// Fetch all users
router.get('/user', async (req, res) => {
    try {
      const users = await User.find({}, '-password -resetToken -resetTokenExpiry');
      res.status(200).json({ success: true, users });
    } catch (err) {
      console.error('Fetch Users Error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  



  router.post('/ForgotPassword', async (req, res) => {
    let { email } = req.body;
  
    try {
      if (!email) return res.status(400).json({ message: 'Email is required' });
  
      email = email.toLowerCase().trim();
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
      user.resetToken = resetToken;
      user.resetTokenExpiry = Date.now() + 3600000;
  
      try {
        await user.save();
      } catch (saveErr) {
        console.error('Error saving user:', saveErr);
        return res.status(500).json({ message: 'Failed to save reset token' });
      }
  
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.email,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
  
      const resetLink = `http://localhost:4000/ResetPassword/${resetToken}`;
      console.log(`Sending reset link to ${user.email}: ${resetLink}`);
  
      try {
        await transporter.sendMail({
          to: user.email,
          subject: 'Password Reset Request',
          html: `<p>You requested a password reset.</p><p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
        });
      } catch (emailErr) {
        console.error('Email send error:', emailErr);
        return res.status(500).json({ message: 'Failed to send reset email' });
      }
  
      return res.status(200).json({ success: true, message: 'Password reset link sent to your email.' });
  
    } catch (err) {
      console.error('Error in ForgotPassword:', err);
      return res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
  });
  
// Reset password route
router.post('/ResetPassword', async (req, res) => {
  const { newPassword, token } = req.body;

  try {
      // Verify the token and check expiration time
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ _id: decoded.id, resetToken: token, resetTokenExpiry: { $gt: Date.now() } });

      if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

      // Hash the new password and save it
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.resetToken = undefined;  // Remove reset token and expiry after resetting password
      user.resetTokenExpiry = undefined;
      await user.save();

      res.status(200).json({ success: true, message: 'Password has been reset successfully' });
  } catch (err) {
      console.error('ResetPassword error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
  }
});



  
  




router.get('/product', async (req, res) => {
    try {
      const products = await Product.find();
      // console.log('Fetched Products:', products); // <=== Add this line
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error.message);
      res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
});


module.exports = router;