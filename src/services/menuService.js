import apiClient from '../config/api';

// Menu Service for handling menu-related API calls
class MenuService {
  
  // Get daily menu based on current calendar day (1-31)
  async getDailyMenu(selectedDate = null) {
    try {
      // console.log('🔄 MenuService: Fetching daily menu...');
      const response = await apiClient.get('/menu');
      // console.log('📊 MenuService: API Response:', response);
      
      // Use provided date or default to current date
      const targetDate = selectedDate || new Date();
      
      // Filter items for specified day of month
      if (response.data && response.data.length > 0) {
        // console.log(`✅ MenuService: Found ${response.data.length} menu items`);
        const dailyMenu = this.filterMenuBySpecificDay(response.data, targetDate);
        // console.log('📋 MenuService: Daily menu:', dailyMenu);
        return dailyMenu;
      }
      
      // console.log('⚠️ MenuService: No menu data found, using fallback');
      return this.getFallbackDailyMenu();
    } catch (error) {
      console.error('❌ MenuService: Error fetching daily menu:', error);
      // Return fallback menu structure if API fails
      return this.getFallbackDailyMenu();
    }
  }

  // Get weekly menu with daily rotation (legacy method)
  async getWeeklyMenu(weekOffset = 0) {
    try {
      // console.log('MenuService: getWeeklyMenu called with weekOffset:', weekOffset);
      const params = { weekOffset: weekOffset.toString() };
      // console.log('MenuService: API params:', params);
      // console.log('MenuService: Making request to /menu/weekly with params:', params);
      const response = await apiClient.get('/menu/weekly', params);
      
      // The /weekly endpoint returns the enhanced menu directly
      if (response && Object.keys(response).length > 0) {
        return response;
      }
      
      // Don't return fallback for future weeks (weekOffset > 0)
      if (weekOffset > 0) {
        // console.log('⚠️ No data for future week, returning empty object');
        return {};
      }
      
      return this.getFallbackWeeklyMenu();
    } catch (error) {
      console.error('❌ MenuService: Error fetching weekly menu:', error);
      
      // Don't return fallback for future weeks (weekOffset > 0)
      if (weekOffset > 0) {
        // console.log('⚠️ API error for future week, returning empty object');
        return {};
      }
      
      // Return fallback menu structure only for current/past weeks
      return this.getFallbackWeeklyMenu();
    }
  }

  // Get today's special dish
  async getTodaysSpecial() {
    try {
      const response = await apiClient.get('/menu/daily/special');
      return response.data;
    } catch (error) {
      console.error('Error fetching today\'s special:', error);
      return null;
    }
  }

  // Get monthly rotation schedule
   async getMonthlyRotation(month, year) {
     try {
       const params = {};
       if (month !== undefined) params.month = month;
       if (year !== undefined) params.year = year;
       
       const response = await apiClient.get('/menu/daily/monthly-calendar', { params });
       return response.data;
     } catch (error) {
       console.error('Error fetching monthly rotation:', error);
       return {};
     }
   }

  // Get rotation statistics
  async getRotationStats() {
    try {
      const response = await apiClient.get('/menu/daily/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching rotation stats:', error);
      return null;
    }
  }

  // Get menu for specific day
  async getDayMenu(dayOfWeek) {
    try {
      const validDays = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
      if (!validDays.includes(dayOfWeek)) {
        throw new Error('Dia da semana inválido.');
      }

      return await apiClient.get(`/menu/day/${dayOfWeek}`);
    } catch (error) {
      console.error('Error fetching day menu:', error);
      return this.getFallbackDayMenu(dayOfWeek);
    }
  }

  // Search menu items
  async searchMenuItems(query, filters = {}) {
    try {
      const params = {
        q: query,
        ...filters
      };
      
      return await apiClient.get('/menu/search', params);
    } catch (error) {
      console.error('Error searching menu items:', error);
      throw new Error('Falha na busca do cardápio. Tente novamente.');
    }
  }

  // Get menu by category
  async getMenuByCategory(category) {
    try {
      const validCategories = ['entrada', 'prato-principal', 'sobremesa', 'bebida', 'especial'];
      if (!validCategories.includes(category)) {
        throw new Error('Categoria inválida.');
      }

      return await apiClient.get('/menu/category', { category });
    } catch (error) {
      console.error('Error fetching menu by category:', error);
      throw new Error('Falha ao carregar cardápio por categoria.');
    }
  }

  // Get dietary restriction menu
  async getDietaryMenu(restrictions = []) {
    try {
      const params = {};
      
      if (restrictions.includes('vegetarian')) {
        params.isVegetarian = true;
      }
      if (restrictions.includes('vegan')) {
        params.isVegan = true;
      }
      if (restrictions.includes('glutenFree')) {
        params.isGlutenFree = true;
      }

      return await apiClient.get('/menu/dietary', params);
    } catch (error) {
      console.error('Error fetching dietary menu:', error);
      throw new Error('Falha ao carregar cardápio com restrições alimentares.');
    }
  }

  // Get special offers
  async getSpecialOffers() {
    try {
      return await apiClient.get('/menu/specials');
    } catch (error) {
      console.error('Error fetching special offers:', error);
      return [];
    }
  }

  // Get menu item details
  async getMenuItem(itemId) {
    try {
      return await apiClient.get(`/menu/item/${itemId}`);
    } catch (error) {
      console.error('Error fetching menu item:', error);
      throw new Error('Falha ao carregar detalhes do item.');
    }
  }

  // Fallback weekly menu (used when API is unavailable)
  getFallbackWeeklyMenu() {
    return {
      domingo: [
        {
          id: 'fallback-7',
          name: 'Especial do Final de Semana',
          description: 'Cardápio em atualização',
          category: 'especial',
          isAvailable: true
        }
      ],
      segunda: [
        {
          id: 'fallback-1',
          name: 'Prato do Dia',
          description: 'Cardápio em atualização',
          category: 'prato-principal',
          isAvailable: true
        }
      ],
      terca: [
        {
          id: 'fallback-2',
          name: 'Prato do Dia',
          description: 'Cardápio em atualização',
          category: 'prato-principal',
          isAvailable: true
        }
      ],
      quarta: [
        {
          id: 'fallback-3',
          name: 'Prato do Dia',
          description: 'Cardápio em atualização',
          category: 'prato-principal',
          isAvailable: true
        }
      ],
      quinta: [
        {
          id: 'fallback-4',
          name: 'Prato do Dia',
          description: 'Cardápio em atualização',
          category: 'prato-principal',
          isAvailable: true
        }
      ],
      sexta: [
        {
          id: 'fallback-5',
          name: 'Prato do Dia',
          description: 'Cardápio em atualização',
          category: 'prato-principal',
          isAvailable: true
        }
      ],
      sabado: [
        {
          id: 'fallback-6',
          name: 'Especial do Final de Semana',
          description: 'Cardápio em atualização',
          category: 'especial',
          isAvailable: true
        }
      ]
    };
  }

  // Fallback day menu
  getFallbackDayMenu(dayOfWeek) {
    const fallbackMenu = this.getFallbackWeeklyMenu();
    return fallbackMenu[dayOfWeek] || [];
  }

  // Utility method to format menu items for display
  formatMenuItems(items) {
    return items.map(item => ({
      ...item,
      formattedPreparationTime: item.preparationTime 
        ? `${item.preparationTime} min`
        : 'Tempo variável',
      dietaryInfo: this.getDietaryInfo(item)
    }));
  }

  // Get dietary information for an item
  getDietaryInfo(item) {
    const info = [];
    if (item.isVegan) info.push('Vegano');
    else if (item.isVegetarian) info.push('Vegetariano');
    if (item.isGlutenFree) info.push('Sem Glúten');
    return info;
  }

  // Group menu items by day of the week
  // Filter menu items for specific calendar day (1-31)
  filterMenuBySpecificDay(items, targetDate) {
    const targetDay = targetDate.getDate(); // Get target day of month (1-31)
    // console.log(`🗓️ Target day of month: ${targetDay}`);
    
    const dayItems = [];
    
    items.forEach((item, index) => {
      const formattedItem = this.formatMenuItem(item);
      
      // Check if item has a preparation date that matches target day
      let itemDay = null;
      if (item.dataPreparacao || item.preparationDate) {
        const prepDate = new Date(item.dataPreparacao || item.preparationDate);
        itemDay = prepDate.getDate();
      }
      
      // If item matches target day, add it to the menu
      if (itemDay === targetDay) {
        dayItems.push(formattedItem);
        // console.log(`✅ Added item "${formattedItem.name}" for day ${targetDay}`);
      }
    });
    
    // If no items found for target day, use round-robin based on target day
    if (dayItems.length === 0) {
      // console.log(`⚠️ No items found for day ${targetDay}, using round-robin selection`);
      const itemsPerDay = Math.ceil(items.length / 31); // Distribute items across 31 days
      const startIndex = ((targetDay - 1) * itemsPerDay) % items.length;
      
      for (let i = 0; i < itemsPerDay && i < items.length; i++) {
        const itemIndex = (startIndex + i) % items.length;
        const formattedItem = this.formatMenuItem(items[itemIndex]);
        dayItems.push(formattedItem);
      }
    }
    
    // console.log(`📋 Daily menu (day ${targetDay}): ${dayItems.length} items`);
    return dayItems;
  }

  // Format a single menu item
  formatMenuItem(item) {
    return {
      ...item,
      // Map database fields to display fields
      id: item._id || item.id,
      name: item.nome || item.name,
      description: item.descricao || item.description,
      category: item.categoria || item.category,
      price: item.preco || item.price,
      preparationTime: item.tempoPreparacao || item.preparationTime,
      calories: item.calorias || item.calories,
      allergens: item.alergenos || item.allergens,
      ingredients: item.ingredientes || item.ingredients,
      isVegetarian: item.vegetariano || item.isVegetarian,
      isVegan: item.vegano || item.isVegan,
      isGlutenFree: item.semGluten || item.isGlutenFree,
      isAvailable: item.disponivel !== undefined ? item.disponivel : (item.isAvailable !== undefined ? item.isAvailable : true),
      image: item.imagem || item.image,
      specialOffer: item.ofertaEspecial || item.specialOffer,
      tags: item.tags || [],
      preparationDate: item.dataPreparacao || item.preparationDate,
      dayOfWeek: item.diaDaSemana || item.dayOfWeek,
      formattedPreparationTime: (item.tempoPreparacao || item.preparationTime)
        ? `${item.tempoPreparacao || item.preparationTime} min`
        : 'Tempo variável',
      formattedPrice: (item.preco || item.price)
        ? `R$ ${(item.preco || item.price).toFixed(2).replace('.', ',')}`
        : 'Consulte o preço',
      dietaryInfo: this.getDietaryInfo({
        isVegan: item.vegano || item.isVegan,
        isVegetarian: item.vegetariano || item.isVegetarian,
        isGlutenFree: item.semGluten || item.isGlutenFree
      })
    };
  }

  // Get fallback daily menu
  getFallbackDailyMenu() {
    const currentDay = new Date().getDate();
    // console.log(`🔄 Using fallback menu for day ${currentDay}`);
    
    // Simple fallback based on day of month
    const fallbackItems = [
      {
        id: `fallback-${currentDay}-1`,
        name: `Prato do Dia ${currentDay}`,
        description: 'Deliciosa refeição preparada especialmente para hoje',
        category: 'prato-principal',
        price: 25.90,
        preparationTime: 30,
        calories: 450,
        ingredients: ['Ingredientes frescos', 'Temperos especiais'],
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isAvailable: true,
        specialOffer: false,
        tags: ['especial-do-dia'],
        formattedPreparationTime: '30 min',
        formattedPrice: 'R$ 25,90',
        dietaryInfo: []
      }
    ];
    
    return fallbackItems;
  }

  groupMenuItemsByDay(items) {
    const daysOfWeek = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const groupedMenu = {};
    
    // Initialize each day with empty array
    daysOfWeek.forEach(day => {
      groupedMenu[day] = [];
    });
    
    // Group items by their diaDaSemana field
    items.forEach((item, index) => {
      const formattedItem = this.formatMenuItem(item);
      
      // Use diaDaSemana field to group items properly
      const dayOfWeek = item.diaDaSemana || item.dayOfWeek;
      if (dayOfWeek && daysOfWeek.includes(dayOfWeek)) {
        groupedMenu[dayOfWeek].push(formattedItem);
      } else {
        console.warn(`Item "${item.nome || item.name}" has invalid or missing diaDaSemana: ${dayOfWeek}`);
        // Only fallback to round-robin if no valid day is specified
        const dayIndex = index % daysOfWeek.length;
        groupedMenu[daysOfWeek[dayIndex]].push(formattedItem);
      }
    });
    
    // console.log('📋 Grouped menu by day:', Object.keys(groupedMenu).map(day => `${day}: ${groupedMenu[day].length} items`).join(', '));
    return groupedMenu;
  }
}

// Create singleton instance
const menuService = new MenuService();

export default menuService;
export { MenuService };