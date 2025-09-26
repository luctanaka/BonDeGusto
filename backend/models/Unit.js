const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Virtual for display name (same as name for units)
unitSchema.virtual('displayName').get(function() {
  return this.name;
});

// Indexes
unitSchema.index({ key: 1 });
unitSchema.index({ isActive: 1 });
unitSchema.index({ createdBy: 1 });

// Ensure virtual fields are serialized
unitSchema.set('toJSON', { virtuals: true });
unitSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Unit', unitSchema);