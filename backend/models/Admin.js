const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin'
  },
  permissions: {
    menu: {
      read: { type: Boolean, default: true },
      write: { type: Boolean, default: true },
      delete: { type: Boolean, default: true }
    },
    gallery: {
      read: { type: Boolean, default: true },
      write: { type: Boolean, default: true },
      delete: { type: Boolean, default: true }
    },
    reviews: {
      read: { type: Boolean, default: true },
      moderate: { type: Boolean, default: true },
      delete: { type: Boolean, default: false }
    },
    dashboard: {
      access: { type: Boolean, default: true },
      analytics: { type: Boolean, default: true }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 604800 // 7 days
    }
  }]
}, {
  timestamps: true
});

// Virtual for account lock status
adminSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Instance method to increment login attempts
adminSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
    };
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
adminSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1
    },
    $set: {
      lastLogin: new Date()
    }
  });
};

// Instance method to check permissions
adminSchema.methods.hasPermission = function(resource, action) {
  if (this.role === 'super_admin') return true;
  
  const permission = this.permissions[resource];
  if (!permission) return false;
  
  return permission[action] === true;
};

// Instance method to add refresh token
adminSchema.methods.addRefreshToken = function(token) {
  this.refreshTokens.push({ token });
  
  // Keep only the last 5 refresh tokens
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }
  
  return this.save();
};

// Instance method to remove refresh token
adminSchema.methods.removeRefreshToken = function(token) {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
  return this.save();
};

// Static method to find by credentials
adminSchema.statics.findByCredentials = async function(username, password) {
  const admin = await this.findOne({
    $or: [
      { username: username },
      { email: username }
    ],
    isActive: true
  });
  
  if (!admin) {
    throw new Error('Invalid credentials');
  }
  
  if (admin.isLocked) {
    throw new Error('Account is temporarily locked due to too many failed login attempts');
  }
  
  const isMatch = await admin.comparePassword(password);
  
  if (!isMatch) {
    await admin.incLoginAttempts();
    throw new Error('Invalid credentials');
  }
  
  // Reset login attempts on successful login
  if (admin.loginAttempts > 0) {
    await admin.resetLoginAttempts();
  }
  
  return admin;
};

// Index for performance
adminSchema.index({ username: 1 });
adminSchema.index({ email: 1 });
adminSchema.index({ isActive: 1 });

module.exports = mongoose.model('Admin', adminSchema);