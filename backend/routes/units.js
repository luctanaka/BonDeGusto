const express = require('express');
const Unit = require('../models/Unit');
const { authenticateAdmin, requireSuperAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all active units (public route for login)
router.get('/', async (req, res) => {
  try {
    const units = await Unit.find({ isActive: true })
      .select('name key displayName')
      .sort({ name: 1 });
    
    res.json({
      success: true,
      data: units
    });
  } catch (error) {
    console.error('Error fetching units:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Get unit by key (public route)
router.get('/:key', async (req, res) => {
  try {
    const unit = await Unit.findOne({ 
      key: req.params.key, 
      isActive: true 
    });
    
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unidade não encontrada'
      });
    }
    
    res.json({
      success: true,
      data: unit
    });
  } catch (error) {
    console.error('Error fetching unit:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Create new unit (admin only)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { name, key } = req.body;
    
    if (!name || !key) {
      return res.status(400).json({
        success: false,
        message: 'Nome e chave são obrigatórios'
      });
    }
    
    // Check if unit with this key already exists
    const existingUnit = await Unit.findOne({ key });
    if (existingUnit) {
      return res.status(400).json({
        success: false,
        message: 'Já existe uma unidade com esta chave'
      });
    }
    
    const unit = new Unit({
      name,
      key: key.toLowerCase(),
      createdBy: req.user._id
    });
    
    await unit.save();
    
    res.status(201).json({
      success: true,
      message: 'Unidade criada com sucesso',
      data: unit
    });
  } catch (error) {
    console.error('Error creating unit:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Update unit (admin only)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { name, key, isActive } = req.body;
    
    const unit = await Unit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unidade não encontrada'
      });
    }
    
    // Check if new key conflicts with existing unit
    if (key && key !== unit.key) {
      const existingUnit = await Unit.findOne({ key, _id: { $ne: req.params.id } });
      if (existingUnit) {
        return res.status(400).json({
          success: false,
          message: 'Já existe uma unidade com esta chave'
        });
      }
    }
    
    // Update fields
    if (name) unit.name = name;
    if (key) unit.key = key.toLowerCase();
    if (typeof isActive === 'boolean') unit.isActive = isActive;
    
    await unit.save();
    
    res.json({
      success: true,
      message: 'Unidade atualizada com sucesso',
      data: unit
    });
  } catch (error) {
    console.error('Error updating unit:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Delete unit (super admin only)
router.delete('/:id', requireSuperAdmin, async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unidade não encontrada'
      });
    }
    
    await Unit.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Unidade excluída com sucesso'
    });
  } catch (error) {
    console.error('Error deleting unit:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;