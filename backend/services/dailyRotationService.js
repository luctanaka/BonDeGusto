const Menu = require('../models/Menu');
const mongoose = require('mongoose');

/**
 * Daily Rotation Service
 * Ensures every day has a new dish by rotating menu items
 */
class DailyRotationService {
  constructor() {
    this.daysOfWeek = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  }

  /**
   * Get the current day of week in Portuguese
   */
  getCurrentDayOfWeek() {
    const today = new Date();
    const dayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayMap = {
      0: 'domingo',
      1: 'segunda',
      2: 'terca',
      3: 'quarta',
      4: 'quinta',
      5: 'sexta',
      6: 'sabado'
    };
    return dayMap[dayIndex];
  }

  /**
   * Get today's special dish
   * Each day of the month (1-31) has a unique dish
   */
  async getTodaysSpecial() {
    try {
      const today = new Date();
      const dayOfMonth = today.getDate(); // 1-31
      
      // Get all available dishes
      const allDishes = await Menu.find({ 
        disponivel: true,
        categoria: { $in: ['prato-principal', 'especial'] }
      }).sort({ nome: 1 });
      
      if (allDishes.length === 0) {
        return null;
      }
      
      // Ensure we have enough dishes for the month
      // If we have fewer dishes than days, cycle through them
      const dishIndex = (dayOfMonth - 1) % allDishes.length;
      const todaysSpecial = allDishes[dishIndex];
      
      const dayOfWeek = today.getDay();
      const daysOfWeek = [
        'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 
        'Quinta-feira', 'Sexta-feira', 'Sábado'
      ];
      const dayName = daysOfWeek[dayOfWeek];
      
      return {
        ...todaysSpecial.toObject(),
        isDailySpecial: true,
        specialDate: today.toISOString().split('T')[0],
        dayOfMonth: dayOfMonth,
        dayOfWeek: dayOfWeek,
        dayName: dayName,
        displayMessage: `Dia ${dayOfMonth} - ${dayName}: ${todaysSpecial.nome}`
      };
    } catch (error) {
      console.error('Error getting today\'s special:', error);
      throw error;
    }
  }

  /**
   * Get monthly rotation schedule
   * Shows what dish will be featured each day of the month
   */
  async getMonthlyRotation() {
    try {
      const allDishes = await Menu.find({ 
        disponivel: true,
        categoria: { $in: ['prato-principal', 'especial'] }
      }).sort({ nome: 1 });
      
      if (allDishes.length === 0) {
        return {};
      }
      
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      const daysOfWeek = [
        'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 
        'Quinta-feira', 'Sexta-feira', 'Sábado'
      ];
      
      const monthlyRotation = {};
      
      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const dayOfWeek = currentDate.getDay();
        const dayName = daysOfWeek[dayOfWeek];
        const dishIndex = (day - 1) % allDishes.length;
        
        monthlyRotation[day] = {
          ...allDishes[dishIndex].toObject(),
          isDailySpecial: true,
          specialDate: currentDate.toISOString().split('T')[0],
          dayOfMonth: day,
          dayOfWeek: dayOfWeek,
          dayName: dayName,
          displayMessage: `Dia ${day} - ${dayName}: ${allDishes[dishIndex].nome}`
        };
      }
      
      return monthlyRotation;
    } catch (error) {
      console.error('Error getting monthly rotation:', error);
      throw error;
    }
  }

  /**
   * Ensure daily variety by checking if today's dish is different from yesterday
   */
  async ensureDailyVariety() {
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      
      const todayDay = today.getDate();
      const yesterdayDay = yesterday.getDate();
      
      const allDishes = await Menu.find({ 
        disponivel: true,
        categoria: { $in: ['prato-principal', 'especial'] }
      }).sort({ nome: 1 });
      
      if (allDishes.length <= 1) {
        return true; // Can't ensure variety with only one dish
      }
      
      const todayIndex = (todayDay - 1) % allDishes.length;
      const yesterdayIndex = (yesterdayDay - 1) % allDishes.length;
      
      return todayIndex !== yesterdayIndex;
    } catch (error) {
      console.error('Error checking daily variety:', error);
      return false;
    }
  }

  /**
   * Get enhanced weekly menu with daily specials
   */
  async getEnhancedWeeklyMenu(weekOffset = 0) {
    try {
      console.log(`🔄 Getting enhanced weekly menu with weekOffset: ${weekOffset}`);
      
      // Limit weekOffset to prevent generating fake data for future periods
      // Allow only 2 weeks into the future and 4 weeks into the past
      if (weekOffset > 2 || weekOffset < -4) {
        console.log(`⚠️ Week offset ${weekOffset} is outside allowed range (-4 to 2)`);
        return {};
      }
      
      // Calculate the target week based on offset
      const today = new Date();
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + (weekOffset * 7));
      
      const startOfWeek = new Date(targetDate);
      startOfWeek.setDate(targetDate.getDate() - targetDate.getDay()); // Sunday
      
      // Additional validation: don't generate data for weeks too far in the future
      const daysDifference = Math.ceil((startOfWeek - today) / (1000 * 60 * 60 * 24));
      if (daysDifference > 14) {
        console.log(`⚠️ Target week is ${daysDifference} days in the future, which is too far. Returning empty menu.`);
        return {};
      }
      
      console.log(`📅 Target week starts on: ${startOfWeek.toISOString().split('T')[0]}`);
      
      // Get all available dishes for rotation
      const allDishes = await Menu.find({ 
        disponivel: true
      }).sort({ categoria: 1, nome: 1 });

      if (allDishes.length === 0) {
        console.log('⚠️ No dishes found, returning empty menu');
        return {};
      }
      
      console.log(`📊 Found ${allDishes.length} available dishes`);
      
      // Create weekly menu based on the target week
      const enhancedMenu = {};
      
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + i);
        const dayName = this.daysOfWeek[i];
        
        // Calculate unique seed for this specific day and week
        const daysSinceEpoch = Math.floor(currentDate.getTime() / (24 * 60 * 60 * 1000));
        const seed = daysSinceEpoch + weekOffset;
        
        // Group dishes by category
        const dishesByCategory = {
          'prato-principal': allDishes.filter(d => d.categoria === 'prato-principal'),
          'entrada': allDishes.filter(d => d.categoria === 'entrada'),
          'sobremesa': allDishes.filter(d => d.categoria === 'sobremesa')
        };
        // console.log(allDishes.filter(d => d.categoria === 'entrada'),)
        const dayMenu = [];
        
        // Add dishes from each category with rotation based on the seed
        Object.entries(dishesByCategory).forEach(([category, dishes]) => {
          if (dishes.length > 0) {
            const dishIndex = (seed + category.length) % dishes.length;
            const dishObject = dishes[dishIndex].toObject();
            const selectedDish = {
              ...dishObject,
              specialDate: currentDate.toISOString().split('T')[0],
              weekOffset: weekOffset,
              dayName: dayName,
              // Preserve original dataPreparacao from database
              dataPreparacao: dishObject.dataPreparacao
            };
            dayMenu.push(selectedDish);
          }
        });
        
        enhancedMenu[dayName] = dayMenu;
      }
      
      return enhancedMenu;
    } catch (error) {
      console.error('Error getting enhanced weekly menu:', error);
      throw error;
    }
  }

  /**
   * Get statistics about dish rotation
   */
  async getRotationStats() {
    try {
      const allDishes = await Menu.find({ 
        disponivel: true,
        categoria: { $in: ['prato-principal', 'acompanhamento', 'especial'] }
      });
      
      const totalDishes = allDishes.length;
      const rotationCycle = totalDishes; // Days until a dish repeats
      const todaysSpecial = await this.getTodaysSpecial();
      
      const today = new Date();
      const dayOfMonth = today.getDate();
      
      return {
        totalAvailableDishes: totalDishes,
        rotationCycleDays: rotationCycle,
        todaysSpecial: todaysSpecial?.nome || 'Nenhum prato especial',
        todaysDayOfMonth: dayOfMonth,
        varietyEnsured: await this.ensureDailyVariety(),
        monthlyRotationActive: true,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting rotation stats:', error);
      throw error;
    }
  }
}

module.exports = new DailyRotationService();