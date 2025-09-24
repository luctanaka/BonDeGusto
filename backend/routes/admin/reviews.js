const express = require('express');
const Review = require('../../models/Review');
const { authenticateAdmin, requirePermission } = require('../../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateAdmin);

// @route   GET /api/admin/reviews
// @desc    Get all reviews with pagination and filtering
// @access  Private (reviews:read)
router.get('/', requirePermission('reviews', 'read'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      rating,
      status = 'all',
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (rating) {
      filter.nota = parseInt(rating);
    }
    
    if (status !== 'all') {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { nome: { $regex: search, $options: 'i' } },
        { comentario: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.createdAt.$lte = new Date(dateTo);
      }
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments(filter)
    ]);
    
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao buscar avaliações.'
    });
  }
});

// @route   GET /api/admin/reviews/analytics
// @desc    Get review analytics and statistics
// @access  Private (reviews:read)
router.get('/analytics', requirePermission('reviews', 'read'), async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    
    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);
    
    // Basic statistics
    const [totalReviews, averageRating, ratingDistribution, recentReviews, statusDistribution] = await Promise.all([
      // Total reviews
      Review.countDocuments(),
      
      // Average rating
      Review.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$nota' } } }
      ]),
      
      // Rating distribution
      Review.aggregate([
        {
          $group: {
            _id: '$nota',
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      // Recent reviews count
      Review.countDocuments({
        createdAt: { $gte: startDate }
      }),
      
      // Status distribution
      Review.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);
    
    // Reviews over time (last 30 days)
    const reviewsOverTime = await Review.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          avgRating: { $avg: '$nota' }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1
        }
      }
    ]);
    
    // Top keywords from comments
    const topKeywords = await Review.aggregate([
      {
        $match: {
          comentario: { $exists: true, $ne: '' },
          createdAt: { $gte: startDate }
        }
      },
      {
        $project: {
          words: {
            $split: [
              {
                $toLower: {
                  $replaceAll: {
                    input: '$comentario',
                    find: /[^\w\s]/g,
                    replacement: ' '
                  }
                }
              },
              ' '
            ]
          }
        }
      },
      { $unwind: '$words' },
      {
        $match: {
          words: { $nin: ['', 'o', 'a', 'e', 'de', 'do', 'da', 'em', 'um', 'uma', 'com', 'para', 'por', 'que', 'não', 'se', 'na', 'no', 'os', 'as', 'dos', 'das', 'ao', 'à'] },
          $expr: { $gt: [{ $strLenCP: '$words' }, 2] }
        }
      },
      {
        $group: {
          _id: '$words',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    
    // Response time analytics (if moderated)
    const responseTimeStats = await Review.aggregate([
      {
        $match: {
          status: 'approved',
          moderatedAt: { $exists: true },
          createdAt: { $gte: startDate }
        }
      },
      {
        $project: {
          responseTime: {
            $divide: [
              { $subtract: ['$moderatedAt', '$createdAt'] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' },
          minResponseTime: { $min: '$responseTime' },
          maxResponseTime: { $max: '$responseTime' }
        }
      }
    ]);
    
    // Format response
    const analytics = {
      overview: {
        totalReviews,
        recentReviews,
        averageRating: averageRating[0]?.avgRating || 0,
        period: `${periodDays} dias`
      },
      ratingDistribution: ratingDistribution.reduce((acc, item) => {
        acc[`rating_${item._id}`] = item.count;
        return acc;
      }, {}),
      statusDistribution: statusDistribution.reduce((acc, item) => {
        acc[item._id || 'pending'] = item.count;
        return acc;
      }, {}),
      reviewsOverTime: reviewsOverTime.map(item => ({
        date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
        count: item.count,
        avgRating: Math.round(item.avgRating * 10) / 10
      })),
      topKeywords: topKeywords.map(item => ({
        word: item._id,
        count: item.count
      })),
      responseTime: responseTimeStats[0] ? {
        average: Math.round(responseTimeStats[0].avgResponseTime * 10) / 10,
        minimum: Math.round(responseTimeStats[0].minResponseTime * 10) / 10,
        maximum: Math.round(responseTimeStats[0].maxResponseTime * 10) / 10,
        unit: 'horas'
      } : null
    };
    
    res.json({
      success: true,
      data: {
        analytics
      }
    });
    
  } catch (error) {
    console.error('Get reviews analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao buscar analytics.'
    });
  }
});

// @route   GET /api/admin/reviews/:id
// @desc    Get single review
// @access  Private (reviews:read)
router.get('/:id', requirePermission('reviews', 'read'), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avaliação não encontrada.'
      });
    }
    
    res.json({
      success: true,
      data: {
        review
      }
    });
    
  } catch (error) {
    console.error('Get review error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID da avaliação inválido.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao buscar avaliação.'
    });
  }
});

// @route   PUT /api/admin/reviews/:id/moderate
// @desc    Moderate review (approve/reject)
// @access  Private (reviews:moderate)
router.put('/:id/moderate', requirePermission('reviews', 'moderate'), async (req, res) => {
  try {
    const { status, moderationNote } = req.body;
    
    // Validation
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status deve ser: approved, rejected ou pending.'
      });
    }
    
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      {
        status,
        moderatedBy: req.admin._id,
        moderatedAt: new Date(),
        moderationNote: moderationNote || undefined
      },
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!updatedReview) {
      return res.status(404).json({
        success: false,
        message: 'Avaliação não encontrada.'
      });
    }
    
    res.json({
      success: true,
      message: `Avaliação ${status === 'approved' ? 'aprovada' : status === 'rejected' ? 'rejeitada' : 'marcada como pendente'} com sucesso.`,
      data: {
        review: updatedReview
      }
    });
    
  } catch (error) {
    console.error('Moderate review error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID da avaliação inválido.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao moderar avaliação.'
    });
  }
});

// @route   DELETE /api/admin/reviews/:id
// @desc    Delete review
// @access  Private (reviews:delete)
router.delete('/:id', requirePermission('reviews', 'delete'), async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.id);
    
    if (!deletedReview) {
      return res.status(404).json({
        success: false,
        message: 'Avaliação não encontrada.'
      });
    }
    
    res.json({
      success: true,
      message: 'Avaliação excluída com sucesso.',
      data: {
        deletedReview: {
          id: deletedReview._id,
          nome: deletedReview.nome,
          nota: deletedReview.nota
        }
      }
    });
    
  } catch (error) {
    console.error('Delete review error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID da avaliação inválido.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao excluir avaliação.'
    });
  }
});

// @route   POST /api/admin/reviews/bulk-moderate
// @desc    Bulk moderate reviews
// @access  Private (reviews:moderate)
router.post('/bulk-moderate', requirePermission('reviews', 'moderate'), async (req, res) => {
  try {
    const { reviewIds, status, moderationNote } = req.body;
    
    // Validation
    if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Lista de IDs de avaliações é obrigatória.'
      });
    }
    
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status deve ser: approved, rejected ou pending.'
      });
    }
    
    const updateResult = await Review.updateMany(
      { _id: { $in: reviewIds } },
      {
        status,
        moderatedBy: req.admin._id,
        moderatedAt: new Date(),
        moderationNote: moderationNote || undefined
      }
    );
    
    res.json({
      success: true,
      message: `${updateResult.modifiedCount} avaliações moderadas com sucesso.`,
      data: {
        modifiedCount: updateResult.modifiedCount,
        requestedCount: reviewIds.length,
        status
      }
    });
    
  } catch (error) {
    console.error('Bulk moderate reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao moderar avaliações.'
    });
  }
});

// @route   GET /api/admin/reviews/export
// @desc    Export reviews to CSV
// @access  Private (reviews:read)
router.get('/export', requirePermission('reviews', 'read'), async (req, res) => {
  try {
    const {
      format = 'csv',
      dateFrom,
      dateTo,
      status,
      rating
    } = req.query;
    
    // Build filter
    const filter = {};
    
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (rating) {
      filter.nota = parseInt(rating);
    }
    
    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    
    if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'ID,Nome,Email,Nota,Comentário,Status,Data de Criação,Data de Moderação\n';
      const csvRows = reviews.map(review => {
        const row = [
          review._id,
          '"' + (review.nome || '') + '"',
          '"' + (review.email || '') + '"',
          review.nota,
          '"' + (review.comentario || '').replace(/"/g, '""') + '"',
          review.status || 'pending',
          review.createdAt ? new Date(review.createdAt).toISOString() : '',
          review.moderatedAt ? new Date(review.moderatedAt).toISOString() : ''
        ];
        return row.join(',');
      }).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="avaliacoes_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send('\uFEFF' + csvContent); // Add BOM for Excel compatibility
    } else {
      // Return JSON
      res.json({
        success: true,
        data: {
          reviews,
          count: reviews.length,
          exportedAt: new Date().toISOString()
        }
      });
    }
    
  } catch (error) {
    console.error('Export reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao exportar avaliações.'
    });
  }
});

module.exports = router;