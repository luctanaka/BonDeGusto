const express = require('express');
const Restaurant = require('../models/Restaurant');
const { authenticateAdmin, requireSuperAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all active restaurants (public route for login)
router.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ isActive: true })
      .select('name key city state displayName')
      .sort({ city: 1, name: 1 });
    
    res.json({
      success: true,
      data: restaurants
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Get restaurant by key (public route)
router.get('/:key', async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ 
      key: req.params.key, 
      isActive: true 
    });
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Admin routes - require authentication
router.use(authenticateAdmin, requireSuperAdmin);

// Get all restaurants (admin only)
router.get('/admin/all', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status !== 'all') {
      query.isActive = status === 'active';
    }
    
    const restaurants = await Restaurant.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Restaurant.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        restaurants,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Create new restaurant (admin only)
router.post('/admin', async (req, res) => {
  try {
    const restaurantData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const restaurant = new Restaurant(restaurantData);
    await restaurant.save();
    
    res.status(201).json({
      success: true,
      message: 'Restaurante criado com sucesso',
      data: restaurant
    });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Já existe um restaurante com esta chave'
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Update restaurant (admin only)
router.put('/admin/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Restaurante atualizado com sucesso',
      data: restaurant
    });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Já existe um restaurante com esta chave'
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Delete restaurant (admin only)
router.delete('/admin/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Restaurante removido com sucesso'
    });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Toggle restaurant status (admin only)
router.patch('/admin/:id/toggle-status', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante não encontrado'
      });
    }
    
    restaurant.isActive = !restaurant.isActive;
    await restaurant.save();
    
    res.json({
      success: true,
      message: `Restaurante ${restaurant.isActive ? 'ativado' : 'desativado'} com sucesso`,
      data: restaurant
    });
  } catch (error) {
    console.error('Error toggling restaurant status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;