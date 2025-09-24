const express = require('express');
const User = require('../../models/User');
const { authenticateAdmin, requirePermission } = require('../../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateAdmin);

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filtering
// @access  Private (Admin only)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      location = '',
      isActive = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (location) {
      filter.location = location;
    }
    
    if (isActive !== '') {
      filter.isActive = isActive === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select('-password -passwordResetToken')
        .populate('createdBy', 'username')
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean(),
      User.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching users.'
    });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get user by ID
// @access  Private (Admin only)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -passwordResetToken')
      .populate('createdBy', 'username');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching user.'
    });
  }
});

// @route   POST /api/admin/users
// @desc    Create new user (Admin only)
// @access  Private (Admin only)
router.post('/', async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      firstName,
      lastName,
      location,
      phone
    } = req.body;

    // Handle both single name and firstName/lastName for backward compatibility
    let finalFirstName, finalLastName;
    if (name) {
      // Split single name into firstName and lastName
      const nameParts = name.trim().split(' ');
      finalFirstName = nameParts[0];
      finalLastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Empresa';
    } else {
      finalFirstName = firstName;
      finalLastName = lastName;
    }

    // Validation
    if (!email || !password || !finalFirstName || !finalLastName || !location || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, name, phone, and location are required.'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists.'
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName: finalFirstName,
      lastName: finalLastName,
      location,
      phone,
      createdBy: req.admin._id,
      emailVerified: true // Admin-created accounts are pre-verified
    });

    await user.save();

    // Remove sensitive data from response
    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      location: user.location,
      phone: user.phone,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      createdBy: req.admin.username
    };

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: { user: userResponse }
    });

  } catch (error) {
    console.error('Create user error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error.',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while creating user.'
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private (Admin only)
router.put('/:id', async (req, res) => {
  try {
    const {
      email,
      name,
      firstName,
      lastName,
      location,
      phone,
      isActive
    } = req.body;

    // Handle both single name and firstName/lastName for backward compatibility
    let finalFirstName, finalLastName;
    if (name) {
      // Split single name into firstName and lastName
      const nameParts = name.trim().split(' ');
      finalFirstName = nameParts[0];
      finalLastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Empresa';
    } else {
      finalFirstName = firstName;
      finalLastName = lastName;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists.'
        });
      }
      user.email = email;
    }

    // Update fields
    if (finalFirstName) user.firstName = finalFirstName;
    if (finalLastName) user.lastName = finalLastName;
    if (location) user.location = location;
    if (phone !== undefined) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      location: user.location,
      phone: user.phone,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      success: true,
      message: 'User updated successfully.',
      data: { user: userResponse }
    });

  } catch (error) {
    console.error('Update user error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error.',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while updating user.'
    });
  }
});

// @route   PUT /api/admin/users/:id/reset-password
// @desc    Reset user password (Admin only)
// @access  Private (Admin only)
router.put('/:id/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required.'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Reset password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while resetting password.'
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (Soft delete - deactivate)
// @access  Private (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Soft delete - deactivate user
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully.'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting user.'
    });
  }
});

// @route   GET /api/admin/users/stats/overview
// @desc    Get user statistics
// @access  Private (Admin only)
router.get('/stats/overview', async (req, res) => {
  try {
    const [totalUsers, activeUsers, inactiveUsers, locationStats] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.aggregate([
        { $group: { _id: '$location', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        locationStats
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching user statistics.'
    });
  }
});

module.exports = router;