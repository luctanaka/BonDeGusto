const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'bondegusto-admin-secret-key-2024';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'bondegusto-refresh-secret-key-2024';

// Generate access token (15 minutes)
const generateAccessToken = (adminId) => {
  return jwt.sign(
    { adminId, type: 'access' },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
};

// Generate refresh token (7 days)
const generateRefreshToken = (adminId) => {
  return jwt.sign(
    { adminId, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

// Verify access token
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

// Authentication middleware
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const decoded = verifyAccessToken(token);
    
    // Find admin and check if still active
    const admin = await Admin.findById(decoded.adminId).select('-password -refreshTokens');
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Admin account not found or inactive.'
      });
    }
    
    // Add admin info to request
    req.admin = admin;
    req.adminId = admin._id;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
      error: error.message
    });
  }
};

// Permission middleware factory
const requirePermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }
    
    if (!req.admin.hasPermission(resource, action)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Insufficient permissions for ${resource}:${action}.`
      });
    }
    
    next();
  };
};

// Super admin middleware
const requireSuperAdmin = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }
  
  if (req.admin.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin privileges required.'
    });
  }
  
  next();
};

// Refresh token middleware
const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required.'
      });
    }
    
    const decoded = verifyRefreshToken(refreshToken);
    
    // Find admin and verify refresh token exists
    const admin = await Admin.findById(decoded.adminId);
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account not found or inactive.'
      });
    }
    
    const tokenExists = admin.refreshTokens.some(rt => rt.token === refreshToken);
    
    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token.'
      });
    }
    
    // Generate new access token
    const newAccessToken = generateAccessToken(admin._id);
    
    req.admin = admin;
    req.newAccessToken = newAccessToken;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token.',
      error: error.message
    });
  }
};

// Rate limiting for auth endpoints
const rateLimit = require('express-rate-limit');

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  authenticateAdmin,
  requirePermission,
  requireSuperAdmin,
  refreshAccessToken,
  authRateLimit
};