require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

// Route files
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/productRoutes');
const paymentHandler = require('./routes/payment');
const orderRoutes = require('./routes/orderRoutes');

// const paymentRoute = require('./routes/payment');


// Initialize app
const app = express();

// Enhanced MongoDB Connection
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/product';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit if DB connection fails
});

// Enhanced Middleware
app.use(cors({
  origin: 'http://localhost:4000', // Adjust according to your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json({ limit: '10mb' })); // Handle larger JSON payloads
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'views')));

// Routes
app.use('/auth', authRoutes);
app.use('/api', productRoutes);
app.post('/api/create-payment-intent', paymentHandler);
// app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api', orderRoutes);

// app.use('/api', paymentRoute);

// Frontend routes
// app.get('/Register', (req, res) => {
//   res.sendFile(path.join(__dirname, 'login', 'Register.js'));
// });

// app.get('/ForgotPassword', (req, res) => {
//   res.sendFile(path.join(__dirname, 'login', 'ForgotPassword.js'));
// });

// Enhanced Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation Error',
      details: err.message 
    });
  }
  
  // Handle duplicate key errors
  if (err.code === 11000) {
    return res.status(400).json({ 
      error: 'Duplicate Key Error',
      details: 'A product with this name already exists' 
    });
  }
  
  res.status(500).json({ 
    error: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});


// Routes
app.use('/api/orders', orderRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});
// Server
const PORT = process.env.PORT || 4000; // Changed to match your error message
app.listen(PORT, () => console.log(`Server running at: http://localhost:${PORT}`));