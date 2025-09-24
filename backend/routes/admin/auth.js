const express = require('express');
const Admin = require('../../models/Admin');
const {
  generateAccessToken,
  generateRefreshToken,
  authenticateAdmin,
  refreshAccessToken
} = require('../../middleware/auth');

const router = express.Router();

// IP-based authorization handles all security

// @route   POST /api/admin/auth/login
// @desc    Admin login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.'
      });
    }
    
    // Find admin by credentials
    const admin = await Admin.findByCredentials(username, password);
    
    // Generate tokens
    const accessToken = generateAccessToken(admin._id);
    const refreshToken = generateRefreshToken(admin._id);
    
    // Save refresh token
    await admin.addRefreshToken(refreshToken);
    
    // Update last login
    admin.lastLogin = new Date();
    await admin.save();
    
    // Remove sensitive data
    const adminData = {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      lastLogin: admin.lastLogin
    };
    
    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        admin: adminData,
        accessToken,
        refreshToken
      }
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    
    // Handle specific error messages
    if (error.message === 'Invalid credentials' || 
        error.message.includes('Account is temporarily locked')) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during login.'
    });
  }
});

// @route   POST /api/admin/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', async (req, res) => {
  try {
    const adminData = {
      id: req.admin._id,
      username: req.admin.username,
      email: req.admin.email,
      role: req.admin.role,
      permissions: req.admin.permissions,
      lastLogin: req.admin.lastLogin
    };
    
    res.json({
      success: true,
      message: 'Token refreshed successfully.',
      data: {
        admin: adminData,
        accessToken: req.newAccessToken
      }
    });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during token refresh.'
    });
  }
});

// @route   POST /api/admin/auth/logout
// @desc    Admin logout
// @access  Private
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      // Remove the specific refresh token
      await req.admin.removeRefreshToken(refreshToken);
    }
    
    res.json({
      success: true,
      message: 'Logout successful.'
    });
    
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout.'
    });
  }
});

// @route   POST /api/admin/auth/logout-all
// @desc    Logout from all devices
// @access  Private
router.post('/logout-all', async (req, res) => {
  try {
    // Remove all refresh tokens
    req.admin.refreshTokens = [];
    await req.admin.save();
    
    res.json({
      success: true,
      message: 'Logged out from all devices successfully.'
    });
    
  } catch (error) {
    console.error('Admin logout-all error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout.'
    });
  }
});

// @route   GET /api/admin/auth/me
// @desc    Get current admin info
// @access  Private
router.get('/me', async (req, res) => {
  try {
      const adminData = {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        permissions: req.user.permissions,
        lastLogin: new Date().toISOString(),
        isActive: true,
        isIPAuthorized: req.user.isIPAuthorized || false
      };
    
    res.json({
      success: true,
      data: {
        admin: adminData
      }
    });
    
  } catch (error) {
    console.error('Get admin info error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// @route   PUT /api/admin/auth/change-password
// @desc    Change admin password
// @access  Private
router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.'
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long.'
      });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await req.admin.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }
    
    // Update password
    req.admin.password = newPassword;
    await req.admin.save();
    
    // Remove all refresh tokens to force re-login
    req.admin.refreshTokens = [];
    await req.admin.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully. Please login again.'
    });
    
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during password change.'
    });
  }
});

module.exports = router;