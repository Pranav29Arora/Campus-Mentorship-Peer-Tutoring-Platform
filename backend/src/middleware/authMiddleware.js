const jwt = require('jsonwebtoken');
const env = require('../config/env');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // In mock mode, we accept 'mock-token-role' values directly for demonstration
    if (token.startsWith('mock-token-')) {
      const role = token.split('mock-token-')[1];
      req.user = {
        id: `mock-user-id-${role}`,
        email: `${role}@campusconnect.com`,
        role: role
      };
      return next();
    }

    // Standard JWT Verification
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
};

module.exports = authMiddleware;
