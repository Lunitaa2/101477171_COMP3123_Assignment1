require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

const userRoutes = require('./routes/userRoutes');
const employeeRoutes = require('./routes/employeeRoutes');

const app = express();
const PORT = process.env.PORT || 8081;

connectDB();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { status: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: { status: false, message: 'Rate limit exceeded, please slow down.' }
});

app.use(generalLimiter);

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info('HTTP_REQUEST', {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration: `${Date.now() - start}ms`,
      ip: req.ip
    });
  });
  next();
});

app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  logger.info('HEALTH_CHECK_CALLED', { dbStatus });
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus
  });
});

app.use('/api/v1/user', authLimiter, userRoutes);
app.use('/api/v1/emp', employeeRoutes);

app.use((req, res) => {
  res.status(404).json({ status: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  logger.error('APPLICATION_ERROR', {
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
  
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    status: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  logger.info('SERVER_STARTUP', { port: PORT });
  console.log(`Server running on port: ${PORT}`);
});
