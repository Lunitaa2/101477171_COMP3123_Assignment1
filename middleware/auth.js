const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn('AUTH_FAILED_NO_TOKEN', { path: req.originalUrl, ip: req.ip });
    return res.status(401).json({ status: false, message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn('AUTH_FAILED_INVALID_TOKEN', { path: req.originalUrl, ip: req.ip, error: err.message });
    return res.status(401).json({ status: false, message: 'Invalid or expired token.' });
  }
};

module.exports = authenticateToken;
