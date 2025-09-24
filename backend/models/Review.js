const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  ipAddress: {
    type: String,
    required: true
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
reviewSchema.index({ rating: -1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ isApproved: 1 });
reviewSchema.index({ email: 1 }, { unique: false }); // Allow multiple reviews per email

// Virtual for formatted date
reviewSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('pt-BR');
});

// Static method to get average rating
reviewSchema.statics.getAverageRating = async function() {
  const stats = await this.aggregate([
    {
      $match: { isApproved: true }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  return stats[0] || { averageRating: 0, totalReviews: 0 };
};

// Static method to get rating distribution
reviewSchema.statics.getRatingDistribution = async function() {
  const distribution = await this.aggregate([
    {
      $match: { isApproved: true }
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: -1 }
    }
  ]);
  
  // Fill in missing ratings with 0 count
  const result = [5, 4, 3, 2, 1].map(rating => {
    const found = distribution.find(d => d._id === rating);
    return {
      rating,
      count: found ? found.count : 0
    };
  });
  
  return result;
};

// Pre-save middleware
reviewSchema.pre('save', function(next) {
  // Ensure rating is an integer
  this.rating = Math.round(this.rating);
  next();
});

module.exports = mongoose.model('Review', reviewSchema);