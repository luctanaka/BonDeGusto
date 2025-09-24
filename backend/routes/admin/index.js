const express = require('express');
const authRoutes = require('./auth');
const menuRoutes = require('./menu');
const galleryRoutes = require('./gallery');
const reviewsRoutes = require('./reviews');
const usersRoutes = require('./users');
const { restrictAdminIPDev } = require('../../middleware/ipRestriction');

const router = express.Router();

// Apply IP-based authorization to all admin routes
router.use(restrictAdminIPDev);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Admin API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Authentication routes (IP-authorized)
router.use('/auth', authRoutes);

// Admin routes (IP-authorized with full access)
router.use('/menu', menuRoutes);
router.use('/gallery', galleryRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/users', usersRoutes);

// Admin dashboard overview endpoint
router.get('/dashboard', async (req, res) => {
  try {
    const Menu = require('../../models/Menu');
    const Gallery = require('../../models/Gallery');
    const Review = require('../../models/Review');
    
    // Get overview statistics
    const [menuStats, galleryStats, reviewStats] = await Promise.all([
      // Menu statistics
      Promise.all([
        Menu.countDocuments(),
        Menu.countDocuments({ disponivel: true }),
        Menu.distinct('categoria').then(cats => cats.length)
      ]),
      
      // Gallery statistics
      Promise.all([
        Gallery.countDocuments({ isActive: true }),
        Gallery.countDocuments({ isFeatured: true }),
        Gallery.distinct('categoria').then(cats => cats.length)
      ]),
      
      // Review statistics
      Promise.all([
        Review.countDocuments(),
        Review.countDocuments({ status: 'pending' }),
        Review.aggregate([
          { $group: { _id: null, avgRating: { $avg: '$nota' } } }
        ]).then(result => result[0]?.avgRating || 0)
      ])
    ]);
    
    // Recent activity
    const recentActivity = await Promise.all([
      Menu.find().sort({ createdAt: -1 }).limit(5).select('nome categoria createdAt'),
      Gallery.find({ isActive: true }).sort({ createdAt: -1 }).limit(5).select('titulo categoria createdAt'),
      Review.find().sort({ createdAt: -1 }).limit(5).select('nome nota status createdAt')
    ]);
    
    const dashboard = {
      overview: {
        menu: {
          total: menuStats[0],
          available: menuStats[1],
          categories: menuStats[2]
        },
        gallery: {
          total: galleryStats[0],
          featured: galleryStats[1],
          categories: galleryStats[2]
        },
        reviews: {
          total: reviewStats[0],
          pending: reviewStats[1],
          averageRating: Math.round(reviewStats[2] * 10) / 10
        }
      },
      recentActivity: {
        menu: recentActivity[0],
        gallery: recentActivity[1],
        reviews: recentActivity[2]
      },
      admin: {
        id: req.admin._id,
        username: req.admin.username,
        role: req.admin.role,
        lastLogin: req.admin.lastLogin
      }
    };
    
    res.json({
      success: true,
      data: {
        dashboard
      }
    });
    
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao carregar dashboard.'
    });
  }
});

// Dashboard stats endpoint (separate from full dashboard)
router.get('/dashboard/stats', async (req, res) => {
  try {
    const Menu = require('../../models/Menu');
    const Gallery = require('../../models/Gallery');
    const Review = require('../../models/Review');
    
    // Get overview statistics
    const [menuStats, galleryStats, reviewStats] = await Promise.all([
      // Menu statistics
      Promise.all([
        Menu.countDocuments(),
        Menu.countDocuments({ disponivel: true }),
        Menu.distinct('categoria').then(cats => cats.length)
      ]),
      
      // Gallery statistics
      Promise.all([
        Gallery.countDocuments({ isActive: true }),
        Gallery.countDocuments({ isFeatured: true }),
        Gallery.distinct('categoria').then(cats => cats.length)
      ]),
      
      // Review statistics
      Promise.all([
        Review.countDocuments(),
        Review.countDocuments({ status: 'pending' }),
        Review.aggregate([
          { $group: { _id: null, avgRating: { $avg: '$nota' } } }
        ]).then(result => result[0]?.avgRating || 0)
      ])
    ]);
    
    const stats = {
      menu: {
        total: menuStats[0],
        available: menuStats[1],
        categories: menuStats[2]
      },
      gallery: {
        total: galleryStats[0],
        featured: galleryStats[1],
        categories: galleryStats[2]
      },
      reviews: {
        total: reviewStats[0],
        pending: reviewStats[1],
        averageRating: Math.round(reviewStats[2] * 10) / 10
      }
    };
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao carregar estatísticas do dashboard.'
    });
  }
});

// Admin profile management
router.get('/profile', (req, res) => {
  try {
    const adminProfile = {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      permissions: req.user.permissions,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isActive: true,
      isIPAuthorized: req.user.isIPAuthorized || false
    };
    
    res.json({
      success: true,
      data: {
        profile: adminProfile
      }
    });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao carregar perfil.'
    });
  }
});

// Update admin profile
router.put('/profile', async (req, res) => {
  try {
    const { username, email } = req.body;
    
    // Validation
    if (!username || !email) {
      return res.status(400).json({
        success: false,
        message: 'Username e email são obrigatórios.'
      });
    }
    
    // Check if username/email already exists (excluding current admin)
    const existingAdmin = await req.admin.constructor.findOne({
      $or: [
        { username: username },
        { email: email }
      ],
      _id: { $ne: req.admin._id }
    });
    
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Username ou email já está em uso.'
      });
    }
    
    // Update profile
    req.admin.username = username;
    req.admin.email = email;
    await req.admin.save();
    
    const updatedProfile = {
      id: req.admin._id,
      username: req.admin.username,
      email: req.admin.email,
      role: req.admin.role,
      permissions: req.admin.permissions,
      lastLogin: req.admin.lastLogin,
      createdAt: req.admin.createdAt
    };
    
    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso.',
      data: {
        profile: updatedProfile
      }
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos.',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao atualizar perfil.'
    });
  }
});

// System information endpoint
router.get('/system', (req, res) => {
  try {
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: {
        system: systemInfo
      }
    });
    
  } catch (error) {
    console.error('System info error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao obter informações do sistema.'
    });
  }
});

// Error handling middleware for admin routes
router.use((error, req, res, next) => {
  console.error('Admin route error:', error);
  
  // Multer errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Arquivo muito grande. Tamanho máximo: 5MB.'
    });
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Campo de arquivo inesperado.'
    });
  }
  
  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido.'
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado.'
    });
  }
  
  // Default error
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor.',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

module.exports = router;