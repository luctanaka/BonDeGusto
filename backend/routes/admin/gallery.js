const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Gallery = require('../../models/Gallery');
const { authenticateAdmin, requirePermission } = require('../../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateAdmin);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/gallery');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `gallery-${uniqueSuffix}${ext}`);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de imagem são permitidos (JPEG, JPG, PNG, GIF, WebP)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// @route   GET /api/admin/gallery
// @desc    Get all gallery images with pagination and filtering
// @access  Private (gallery:read)
router.get('/', requirePermission('gallery', 'read'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (category) {
      filter.categoria = category;
    }
    
    if (search) {
      filter.$or = [
        { titulo: { $regex: search, $options: 'i' } },
        { descricao: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [images, total] = await Promise.all([
      Gallery.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('uploadedBy', 'username'),
      Gallery.countDocuments(filter)
    ]);
    
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.json({
      success: true,
      data: {
        images,
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
    console.error('Get gallery images error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao buscar imagens da galeria.'
    });
  }
});

// @route   GET /api/admin/gallery/categories
// @desc    Get all gallery categories
// @access  Private (gallery:read)
router.get('/categories', requirePermission('gallery', 'read'), async (req, res) => {
  try {
    const categories = await Gallery.distinct('categoria');
    
    res.json({
      success: true,
      data: {
        categories: categories.filter(cat => cat) // Remove null/undefined values
      }
    });
    
  } catch (error) {
    console.error('Get gallery categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao buscar categorias.'
    });
  }
});

// @route   GET /api/admin/gallery/:id
// @desc    Get single gallery image
// @access  Private (gallery:read)
router.get('/:id', requirePermission('gallery', 'read'), async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id)
      .populate('uploadedBy', 'username');
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Imagem não encontrada.'
      });
    }
    
    res.json({
      success: true,
      data: {
        image
      }
    });
    
  } catch (error) {
    console.error('Get gallery image error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID da imagem inválido.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao buscar imagem.'
    });
  }
});

// @route   POST /api/admin/gallery/upload
// @desc    Upload new gallery image
// @access  Private (gallery:write)
router.post('/upload', requirePermission('gallery', 'write'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma imagem foi enviada.'
      });
    }
    
    const {
      titulo,
      descricao,
      categoria = 'geral',
      tags,
      altText
    } = req.body;
    
    // Validation
    if (!titulo) {
      // Delete uploaded file if validation fails
      await fs.unlink(req.file.path).catch(console.error);
      return res.status(400).json({
        success: false,
        message: 'Título é obrigatório.'
      });
    }
    
    // Process tags
    let processedTags = [];
    if (tags) {
      processedTags = typeof tags === 'string' 
        ? tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : Array.isArray(tags) ? tags : [];
    }
    
    // Create gallery entry
    const newImage = new Gallery({
      titulo,
      descricao,
      categoria,
      tags: processedTags,
      altText: altText || titulo,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      url: `/uploads/gallery/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedBy: req.admin._id
    });
    
    const savedImage = await newImage.save();
    
    // Populate uploadedBy for response
    await savedImage.populate('uploadedBy', 'username');
    
    res.status(201).json({
      success: true,
      message: 'Imagem enviada com sucesso.',
      data: {
        image: savedImage
      }
    });
    
  } catch (error) {
    console.error('Upload gallery image error:', error);
    
    // Delete uploaded file if database save fails
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    
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
      message: 'Erro interno do servidor ao enviar imagem.'
    });
  }
});

// @route   PUT /api/admin/gallery/:id
// @desc    Update gallery image metadata
// @access  Private (gallery:write)
router.put('/:id', requirePermission('gallery', 'write'), async (req, res) => {
  try {
    const {
      titulo,
      descricao,
      categoria,
      tags,
      altText
    } = req.body;
    
    // Process tags
    let processedTags;
    if (tags !== undefined) {
      processedTags = typeof tags === 'string' 
        ? tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : Array.isArray(tags) ? tags : [];
    }
    
    // Find and update image
    const updatedImage = await Gallery.findByIdAndUpdate(
      req.params.id,
      {
        ...(titulo && { titulo }),
        ...(descricao !== undefined && { descricao }),
        ...(categoria && { categoria }),
        ...(processedTags !== undefined && { tags: processedTags }),
        ...(altText !== undefined && { altText }),
        updatedAt: new Date()
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('uploadedBy', 'username');
    
    if (!updatedImage) {
      return res.status(404).json({
        success: false,
        message: 'Imagem não encontrada.'
      });
    }
    
    res.json({
      success: true,
      message: 'Imagem atualizada com sucesso.',
      data: {
        image: updatedImage
      }
    });
    
  } catch (error) {
    console.error('Update gallery image error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID da imagem inválido.'
      });
    }
    
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
      message: 'Erro interno do servidor ao atualizar imagem.'
    });
  }
});

// @route   DELETE /api/admin/gallery/:id
// @desc    Delete gallery image
// @access  Private (gallery:delete)
router.delete('/:id', requirePermission('gallery', 'delete'), async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Imagem não encontrada.'
      });
    }
    
    // Delete file from filesystem
    try {
      await fs.unlink(image.path);
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
      // Continue with database deletion even if file deletion fails
    }
    
    // Delete from database
    await Gallery.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Imagem excluída com sucesso.',
      data: {
        deletedImage: {
          id: image._id,
          titulo: image.titulo
        }
      }
    });
    
  } catch (error) {
    console.error('Delete gallery image error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID da imagem inválido.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao excluir imagem.'
    });
  }
});

// @route   POST /api/admin/gallery/bulk-delete
// @desc    Delete multiple gallery images
// @access  Private (gallery:delete)
router.post('/bulk-delete', requirePermission('gallery', 'delete'), async (req, res) => {
  try {
    const { imageIds } = req.body;
    
    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Lista de IDs de imagens é obrigatória.'
      });
    }
    
    // Find images to delete
    const images = await Gallery.find({ _id: { $in: imageIds } });
    
    if (images.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Nenhuma imagem encontrada para exclusão.'
      });
    }
    
    // Delete files from filesystem
    const fileDeletePromises = images.map(async (image) => {
      try {
        await fs.unlink(image.path);
      } catch (error) {
        console.error(`Error deleting file ${image.path}:`, error);
      }
    });
    
    await Promise.all(fileDeletePromises);
    
    // Delete from database
    const deleteResult = await Gallery.deleteMany({ _id: { $in: imageIds } });
    
    res.json({
      success: true,
      message: `${deleteResult.deletedCount} imagens excluídas com sucesso.`,
      data: {
        deletedCount: deleteResult.deletedCount,
        requestedCount: imageIds.length
      }
    });
    
  } catch (error) {
    console.error('Bulk delete gallery images error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao excluir imagens.'
    });
  }
});

module.exports = router;