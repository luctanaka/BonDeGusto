const express = require('express');
const Menu = require('../models/Menu');
const dailyRotationService = require('../services/dailyRotationService');
const router = express.Router();

// Get all menu items
router.get('/', async (req, res) => {
  try {
    // console.log('🔍 Menu API called - fetching items...');
    const menuItems = await Menu.find({ disponivel: true }).sort({ dataPreparacao: -1, categoria: 1, nome: 1 });
    // console.log(`📊 Found ${menuItems.length} menu items`);
    
    res.json({
      success: true,
      data: menuItems
    });
  } catch (error) {
    console.error('❌ Error fetching menu items:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// Get weekly menu with enhanced daily rotation
router.get('/weekly', async (req, res) => {
  try {
    const { weekOffset } = req.query;
    const offset = weekOffset ? parseInt(weekOffset) : 0;
    // console.log(`🔄 Getting enhanced weekly menu with offset: ${offset}`);
    const weeklyMenu = await dailyRotationService.getEnhancedWeeklyMenu(offset);
    // console.log('✅ Enhanced weekly menu retrieved successfully');

    res.json(weeklyMenu);
  } catch (error) {
    console.error('❌ Error getting enhanced weekly menu:', error);
    res.status(500).json({ error: 'Failed to get weekly menu' });
  }
});

// Get menu by day
router.get('/day/:day', async (req, res) => {
  try {
    const { day } = req.params;
    const validDays = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
    
    if (!validDays.includes(day)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid day. Use: segunda, terca, quarta, quinta, sexta, sabado, domingo' 
      });
    }
    
    const dayMenu = await Menu.getMenuByDay(day);
    res.json({
      success: true,
      data: dayMenu
    });
  } catch (error) {
    console.error('Error fetching day menu:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// Get menu items by category
router.get('/categoria/:categoria', async (req, res) => {
  try {
    const { categoria } = req.params;
    const validCategories = ['entrada', 'prato-principal', 'sobremesa', 'bebida', 'especial'];
    
    if (!validCategories.includes(categoria)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid category. Use: entrada, prato-principal, sobremesa, bebida, especial' 
      });
    }
    
    const menuItems = await Menu.find({ categoria, disponivel: true }).sort({ dataPreparacao: -1, nome: 1 });
    res.json({
      success: true,
      data: menuItems
    });
  } catch (error) {
    console.error('Error fetching menu items by category:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// Get today's special dish
router.get('/daily/special', async (req, res) => {
  try {
    const todaysSpecial = await dailyRotationService.getTodaysSpecial();
    res.json({
      success: true,
      data: todaysSpecial
    });
  } catch (error) {
    console.error('Error fetching today\'s special:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// Get monthly rotation schedule
router.get('/daily/monthly-rotation', async (req, res) => {
  try {
    const monthlyRotation = await dailyRotationService.getMonthlyRotation();
    res.json({
      success: true,
      data: monthlyRotation
    });
  } catch (error) {
    console.error('Error fetching monthly rotation:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// Get full monthly calendar with all dishes
router.get('/daily/monthly-calendar', async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month ? parseInt(month) : new Date().getMonth();
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    
    const monthlyCalendar = await dailyRotationService.getEnhancedMonthlyMenu(currentMonth, currentYear);
    // console.log(`📅 Monthly calendar requested for ${currentMonth + 1}/${currentYear}`);
    res.json({ monthlyRotation: monthlyCalendar });
  } catch (error) {
    console.error('❌ Error getting monthly calendar:', error);
    res.status(500).json({ error: 'Failed to get monthly calendar' });
  }
});

// Get rotation statistics
router.get('/daily/stats', async (req, res) => {
  try {
    const stats = await dailyRotationService.getRotationStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching rotation stats:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// Get single menu item
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;