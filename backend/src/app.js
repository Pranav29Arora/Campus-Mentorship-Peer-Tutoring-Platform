const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const errorMiddleware = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const compression = require('compression');

const app = express();

// High-performance gzip response compression
app.use(compression({
  threshold: 512, // Compress any response > 512 bytes
  level: 6
}));

// Core middlewares with 24-hour CORS preflight caching
app.use(cors({
  origin: true,
  credentials: true,
  maxAge: 86400 // Cache OPTIONS preflight checks for 24h to avoid redundant round-trips
}));
app.use(express.json());

// Base health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CampusConnect Backend REST API is running and healthy.'
  });
});

// Router bindings
app.use('/api/auth', authRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Global fallback error handler
app.use(errorMiddleware);

module.exports = app;
