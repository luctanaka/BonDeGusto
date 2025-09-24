const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true,
    maxlength: [100, 'Título não pode exceder 100 caracteres']
  },
  descricao: {
    type: String,
    trim: true,
    maxlength: [500, 'Descrição não pode exceder 500 caracteres']
  },
  categoria: {
    type: String,
    required: true,
    enum: {
      values: ['pratos', 'ambiente', 'eventos', 'equipe', 'geral'],
      message: 'Categoria deve ser: pratos, ambiente, eventos, equipe ou geral'
    },
    default: 'geral'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  altText: {
    type: String,
    trim: true,
    maxlength: [200, 'Texto alternativo não pode exceder 200 caracteres']
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true,
    min: [0, 'Tamanho do arquivo deve ser positivo']
  },
  mimetype: {
    type: String,
    required: true,
    enum: {
      values: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      message: 'Tipo de arquivo deve ser JPEG, JPG, PNG, GIF ou WebP'
    }
  },
  dimensions: {
    width: {
      type: Number,
      min: [0, 'Largura deve ser positiva']
    },
    height: {
      type: Number,
      min: [0, 'Altura deve ser positiva']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  views: {
    type: Number,
    default: 0,
    min: [0, 'Visualizações devem ser positivas']
  },
  downloads: {
    type: Number,
    default: 0,
    min: [0, 'Downloads devem ser positivos']
  },
  metadata: {
    exif: {
      camera: String,
      lens: String,
      settings: {
        iso: Number,
        aperture: String,
        shutterSpeed: String,
        focalLength: String
      },
      location: {
        latitude: Number,
        longitude: Number,
        address: String
      },
      dateTaken: Date
    },
    colors: {
      dominant: String,
      palette: [String]
    }
  }
}, {
  timestamps: true
});

// Virtual for file size in human readable format
gallerySchema.virtual('sizeFormatted').get(function() {
  const bytes = this.size;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Virtual for aspect ratio
gallerySchema.virtual('aspectRatio').get(function() {
  if (this.dimensions && this.dimensions.width && this.dimensions.height) {
    return (this.dimensions.width / this.dimensions.height).toFixed(2);
  }
  return null;
});

// Virtual for full URL (if needed for absolute URLs)
gallerySchema.virtual('fullUrl').get(function() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  return `${baseUrl}${this.url}`;
});

// Instance method to increment views
gallerySchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Instance method to increment downloads
gallerySchema.methods.incrementDownloads = function() {
  this.downloads += 1;
  return this.save();
};

// Instance method to toggle featured status
gallerySchema.methods.toggleFeatured = function() {
  this.isFeatured = !this.isFeatured;
  return this.save();
};

// Instance method to toggle active status
gallerySchema.methods.toggleActive = function() {
  this.isActive = !this.isActive;
  return this.save();
};

// Static method to get featured images
gallerySchema.statics.getFeatured = function(limit = 10) {
  return this.find({ isFeatured: true, isActive: true })
    .sort({ displayOrder: 1, createdAt: -1 })
    .limit(limit)
    .populate('uploadedBy', 'username');
};

// Static method to get images by category
gallerySchema.statics.getByCategory = function(categoria, options = {}) {
  const {
    limit = 20,
    skip = 0,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;
  
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  return this.find({ categoria, isActive: true })
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('uploadedBy', 'username');
};

// Static method to search images
gallerySchema.statics.searchImages = function(searchTerm, options = {}) {
  const {
    limit = 20,
    skip = 0,
    categoria
  } = options;
  
  const query = {
    isActive: true,
    $or: [
      { titulo: { $regex: searchTerm, $options: 'i' } },
      { descricao: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ]
  };
  
  if (categoria) {
    query.categoria = categoria;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('uploadedBy', 'username');
};

// Static method to get popular images (by views)
gallerySchema.statics.getPopular = function(limit = 10, timeframe = null) {
  const query = { isActive: true };
  
  // Add timeframe filter if specified
  if (timeframe) {
    const date = new Date();
    switch (timeframe) {
      case 'week':
        date.setDate(date.getDate() - 7);
        break;
      case 'month':
        date.setMonth(date.getMonth() - 1);
        break;
      case 'year':
        date.setFullYear(date.getFullYear() - 1);
        break;
    }
    query.createdAt = { $gte: date };
  }
  
  return this.find(query)
    .sort({ views: -1, createdAt: -1 })
    .limit(limit)
    .populate('uploadedBy', 'username');
};

// Pre-save middleware to ensure tags are lowercase and trimmed
gallerySchema.pre('save', function(next) {
  if (this.tags && Array.isArray(this.tags)) {
    this.tags = this.tags
      .map(tag => tag.toLowerCase().trim())
      .filter(tag => tag.length > 0);
  }
  next();
});

// Index for performance
gallerySchema.index({ categoria: 1, isActive: 1 });
gallerySchema.index({ tags: 1, isActive: 1 });
gallerySchema.index({ isFeatured: 1, isActive: 1 });
gallerySchema.index({ views: -1 });
gallerySchema.index({ createdAt: -1 });
gallerySchema.index({ uploadedBy: 1 });
gallerySchema.index({ 
  titulo: 'text', 
  descricao: 'text', 
  tags: 'text' 
}, {
  weights: {
    titulo: 10,
    tags: 5,
    descricao: 1
  }
});

// Ensure virtual fields are serialized
gallerySchema.set('toJSON', { virtuals: true });
gallerySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Gallery', gallerySchema);