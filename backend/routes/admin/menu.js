const express = require('express');
const Menu = require('../../models/Menu');
const { authenticateAdmin, requirePermission } = require('../../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateAdmin);

// @route   GET /api/admin/menu
// @desc    Get all menu items with pagination and filtering
// @access  Private (menu:read)
router.get('/', requirePermission('menu', 'read'), async (req, res) => {
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
        { nome: { $regex: search, $options: 'i' } },
        { descricao: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [items, total] = await Promise.all([
      Menu.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Menu.countDocuments(filter)
    ]);
    
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.json({
      success: true,
      data: {
        items,
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
    console.error('Get menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching menu items.'
    });
  }
});

// @route   GET /api/admin/menu/categories
// @desc    Get all menu categories
// @access  Private (menu:read)
router.get('/categories', requirePermission('menu', 'read'), async (req, res) => {
  try {
    const categories = await Menu.distinct('categoria');
    
    res.json({
      success: true,
      data: {
        categories: categories.filter(cat => cat) // Remove null/undefined values
      }
    });
    
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching categories.'
    });
  }
});

// @route   GET /api/admin/menu/:id
// @desc    Get single menu item
// @access  Private (menu:read)
router.get('/:id', requirePermission('menu', 'read'), async (req, res) => {
  try {
    const item = await Menu.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found.'
      });
    }
    
    res.json({
      success: true,
      data: {
        item
      }
    });
    
  } catch (error) {
    console.error('Get menu item error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid menu item ID.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching menu item.'
    });
  }
});

// @route   POST /api/admin/menu
// @desc    Create new menu item
// @access  Private (menu:write)
router.post('/', requirePermission('menu', 'write'), async (req, res) => {
  try {
    const {
      nome,
      descricao,
      preco,
      categoria,
      imagem,
      disponivel = true,
      ingredientes,
      alergenos,
      calorias,
      tempoPreparacao
    } = req.body;
    
    // Validation
    if (!nome || !descricao || !preco || !categoria) {
      return res.status(400).json({
        success: false,
        message: 'Nome, descrição, preço e categoria são obrigatórios.'
      });
    }
    
    if (preco <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Preço deve ser maior que zero.'
      });
    }
    
    // Create new menu item
    const newItem = new Menu({
      nome,
      descricao,
      preco,
      categoria,
      imagem,
      disponivel,
      ingredientes,
      alergenos,
      calorias,
      tempoPreparacao,
      createdBy: req.admin._id,
      updatedBy: req.admin._id
    });
    
    const savedItem = await newItem.save();
    
    res.status(201).json({
      success: true,
      message: 'Item do menu criado com sucesso.',
      data: {
        item: savedItem
      }
    });
    
  } catch (error) {
    console.error('Create menu item error:', error);
    
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
      message: 'Erro interno do servidor ao criar item do menu.'
    });
  }
});

// @route   PUT /api/admin/menu/:id
// @desc    Update menu item
// @access  Private (menu:write)
router.put('/:id', requirePermission('menu', 'write'), async (req, res) => {
  try {
    const {
      nome,
      descricao,
      preco,
      categoria,
      imagem,
      disponivel,
      ingredientes,
      alergenos,
      calorias,
      tempoPreparacao
    } = req.body;
    
    // Validation
    if (preco !== undefined && preco <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Preço deve ser maior que zero.'
      });
    }
    
    // Find and update item
    const updatedItem = await Menu.findByIdAndUpdate(
      req.params.id,
      {
        ...(nome && { nome }),
        ...(descricao && { descricao }),
        ...(preco && { preco }),
        ...(categoria && { categoria }),
        ...(imagem !== undefined && { imagem }),
        ...(disponivel !== undefined && { disponivel }),
        ...(ingredientes && { ingredientes }),
        ...(alergenos && { alergenos }),
        ...(calorias !== undefined && { calorias }),
        ...(tempoPreparacao !== undefined && { tempoPreparacao }),
        updatedBy: req.admin._id,
        updatedAt: new Date()
      },
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: 'Item do menu não encontrado.'
      });
    }
    
    res.json({
      success: true,
      message: 'Item do menu atualizado com sucesso.',
      data: {
        item: updatedItem
      }
    });
    
  } catch (error) {
    console.error('Update menu item error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID do item inválido.'
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
      message: 'Erro interno do servidor ao atualizar item do menu.'
    });
  }
});

// @route   DELETE /api/admin/menu/:id
// @desc    Delete menu item
// @access  Private (menu:delete)
router.delete('/:id', requirePermission('menu', 'delete'), async (req, res) => {
  try {
    const deletedItem = await Menu.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: 'Item do menu não encontrado.'
      });
    }
    
    res.json({
      success: true,
      message: 'Item do menu excluído com sucesso.',
      data: {
        deletedItem: {
          id: deletedItem._id,
          nome: deletedItem.nome
        }
      }
    });
    
  } catch (error) {
    console.error('Delete menu item error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID do item inválido.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao excluir item do menu.'
    });
  }
});

// @route   PATCH /api/admin/menu/:id/toggle-availability
// @desc    Toggle menu item availability
// @access  Private (menu:write)
router.patch('/:id/toggle-availability', requirePermission('menu', 'write'), async (req, res) => {
  try {
    const item = await Menu.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item do menu não encontrado.'
      });
    }
    
    item.disponivel = !item.disponivel;
    item.updatedBy = req.admin._id;
    item.updatedAt = new Date();
    
    await item.save();
    
    res.json({
      success: true,
      message: `Item ${item.disponivel ? 'disponibilizado' : 'indisponibilizado'} com sucesso.`,
      data: {
        item: {
          id: item._id,
          nome: item.nome,
          disponivel: item.disponivel
        }
      }
    });
    
  } catch (error) {
    console.error('Toggle availability error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID do item inválido.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao alterar disponibilidade.'
    });
  }
});

module.exports = router;