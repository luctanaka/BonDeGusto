import React, { useState, useEffect, useCallback } from 'react';
import { WifiX, CheckCircle, Calendar, ArrowSquareOut, X, Info, CaretLeft, CaretRight } from '@phosphor-icons/react';
import menuService from '../services/menuService';
import useDatabase from '../hooks/useDatabase';
import DatePicker from '../components/DatePicker';

const Cardapio = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyMenu, setDailyMenu] = useState([]);
  const [weeklyMenu, setWeeklyMenu] = useState({});
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // 0 = current week, -1 = previous week, 1 = next week
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'weekly'
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [loadingWeeklyMenu, setLoadingWeeklyMenu] = useState(false);
  const [menuError, setMenuError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [searchTerm] = useState('');
  const [selectedCategory] = useState('all');

  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  
  // Database connection hook
  const { isConnected, isLoading: dbLoading, retryConnection } = useDatabase();

  // Load daily menu from database
  const loadDailyMenu = useCallback(async (showLoading = true, targetDate = null) => {
    try {
      if (showLoading) setLoadingMenu(true);
      setMenuError(null);
      
      // Use provided date or current date
      const dateToUse = targetDate || currentDate;
      const menuData = await menuService.getDailyMenu(dateToUse);
      setDailyMenu(menuData);
      setRetryCount(0);
    } catch (error) {
      // console.error('Error loading daily menu:', error);
      setMenuError(error.message || 'Erro ao carregar cardápio');
      
      // Use fallback menu if database fails
      const fallbackMenu = menuService.getFallbackDailyMenu();
      setDailyMenu(fallbackMenu);
    } finally {
      if (showLoading) setLoadingMenu(false);
    }
  }, [currentDate]);

  // Load weekly menu from database
  const loadWeeklyMenu = useCallback(async (showLoading = true, weekOffset = 0) => {
    try {
      if (showLoading) {
        setLoadingWeeklyMenu(true);
      }
      setMenuError(null);
      
      const weeklyData = await menuService.getWeeklyMenu(weekOffset);

      setWeeklyMenu(weeklyData);
      setRetryCount(0);
    } catch (error) {
      console.error('Error loading weekly menu:', error);
      setMenuError(error.message || 'Erro ao carregar cardápio semanal');
      
      // Use fallback menu if database fails
      const fallbackMenu = menuService.getFallbackWeeklyMenu();
      setWeeklyMenu(fallbackMenu);
    } finally {
      if (showLoading) {
        setLoadingWeeklyMenu(false);
      }
    }
  }, []);

  // Toggle between daily and weekly view
  const toggleViewMode = (mode) => {
    setViewMode(mode);
    if (mode === 'weekly') {
      loadWeeklyMenu(true, currentWeekOffset);
    }
  };

  // Navigate between weeks
  const navigateWeek = (direction) => {
    const newWeekOffset = currentWeekOffset + direction;
    setCurrentWeekOffset(newWeekOffset);
    loadWeeklyMenu(true, newWeekOffset);
  };

  // Retry loading menu
  const retryLoadMenu = () => {
    setRetryCount(prev => prev + 1);
    if (viewMode === 'daily') {
      loadDailyMenu();
    } else {
      loadWeeklyMenu(true, currentWeekOffset);
    }
  };

  // Load menu when component mounts or connection is established
  useEffect(() => {
    if (viewMode === 'daily') {
      loadDailyMenu();
    } else if (viewMode === 'weekly') {
      loadWeeklyMenu(true, currentWeekOffset);
    }
  }, [isConnected, loadDailyMenu, loadWeeklyMenu, viewMode, currentWeekOffset]);
  
  // Reload menu every minute to check for new day
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getDate() !== currentDate.getDate()) {
        setCurrentDate(now);
        loadDailyMenu(false, now); // Reload without showing loading spinner
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [currentDate, loadDailyMenu]);
  
  // Also load menu on component mount
  useEffect(() => {
    loadDailyMenu();
  }, [loadDailyMenu]);

  const navigateDay = (direction) => {
    // Prevent navigation while loading or during cooldown
    if (loadingMenu || isNavigating) return;
    
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction);
    
    // Only allow navigation within the current month
    if (newDate.getMonth() === currentDate.getMonth() && newDate.getFullYear() === currentDate.getFullYear()) {
      setIsNavigating(true);
      setCurrentDate(newDate);
      loadDailyMenu(true, newDate);
      
      // Add cooldown period to prevent rapid clicking
      setTimeout(() => {
        setIsNavigating(false);
      }, 500); // 1.5 second cooldown
    }
  };

  const canNavigateDay = (direction) => {
    // Disable navigation while loading or during cooldown
    if (loadingMenu || isNavigating) return false;
    
    const testDate = new Date(currentDate);
    testDate.setDate(currentDate.getDate() + direction);
    return testDate.getMonth() === currentDate.getMonth() && testDate.getFullYear() === currentDate.getFullYear();
  };

  const canNavigateWeek = (direction) => {
    // Disable navigation while loading
    if (loadingWeeklyMenu) return false;
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Calculate the target week offset
    const targetWeekOffset = currentWeekOffset + direction;
    
    // Limit navigation to prevent generating fake data for future months
    // Allow only 2 weeks into the future and 4 weeks into the past
    if (targetWeekOffset > 2 || targetWeekOffset < -4) {
      return false;
    }
    
    // Calculate the start of the current week (Sunday)
    const currentDayOfWeek = today.getDay();
    const startOfCurrentWeek = new Date(today);
    startOfCurrentWeek.setDate(today.getDate() - currentDayOfWeek);
    startOfCurrentWeek.setHours(0, 0, 0, 0);
    
    // Calculate the start of the target week
    const startOfTargetWeek = new Date(startOfCurrentWeek);
    startOfTargetWeek.setDate(startOfCurrentWeek.getDate() + (targetWeekOffset * 7));
    
    // Calculate the end of the target week (Saturday)
    const endOfTargetWeek = new Date(startOfTargetWeek);
    endOfTargetWeek.setDate(startOfTargetWeek.getDate() + 6);
    
    // More restrictive validation for future dates
    const isValidDate = (date) => {
      if (date.getFullYear() !== currentYear) return false;
      
      // For future dates, be more restrictive
      if (date > today) {
        const daysDifference = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
        // Allow only up to 14 days in the future to avoid fake data
        return daysDifference <= 14;
      }
      
      // For past dates, allow current month and previous month
      if (date.getMonth() === currentMonth) {
        return true; // Same month is always allowed
      } else if (date.getMonth() === currentMonth - 1 || (currentMonth === 0 && date.getMonth() === 11)) {
        // Previous month: allow up to 5 days from the end
        const lastDayOfPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
        return date.getDate() > (lastDayOfPrevMonth - 5);
      }
      
      return false;
    };
    
    // Check if both start and end of target week are within allowed range
    return isValidDate(startOfTargetWeek) && isValidDate(endOfTargetWeek);
  };

  const handleDateSelect = useCallback((selectedDate) => {
    setCurrentDate(selectedDate);
    loadDailyMenu(true, selectedDate);
  }, [loadDailyMenu]);

  const toggleCalendar = useCallback(() => {
    setIsCalendarOpen(!isCalendarOpen);
  }, [isCalendarOpen]);

  // Filter menu items based on search and filters
  const filterMenuItems = (items) => {
    return items.filter(item => {
      // Search filter
      const matchesSearch = !searchTerm || 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ingredients?.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Category filter
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      
      return matchesSearch && matchesCategory && item.isAvailable;
    });
  };

  // Get filtered daily menu
  const getFilteredDailyMenu = () => {
    return filterMenuItems(dailyMenu || []);
  };

  // Handle menu item click
  const handleMenuItemClick = (item) => {
    setSelectedMenuItem(item);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMenuItem(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white dark:bg-slate-800 rounded-full px-6 py-3 shadow-lg mb-6">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Cardápio atualizado em tempo real
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
            Nosso Cardápio
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Descubra sabores únicos com pratos especiais renovados diariamente
          </p>
        </div>

        {/* Database Connection Status */}
        <div className="mb-8">
          <div className={`flex items-center justify-center p-4 rounded-2xl shadow-lg transition-all duration-300 ${
            isConnected ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 
            dbLoading ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' : 
            'bg-gradient-to-r from-red-500 to-pink-500 text-white'
          }`}>
            {isConnected ? (
              <CheckCircle className="w-6 h-6 mr-3" weight="fill" />
            ) : dbLoading ? (
              <div className="w-6 h-6 mr-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <WifiX className="w-6 h-6 mr-3" weight="fill" />
            )}
            <span className="font-semibold text-lg">
              {isConnected ? '🟢 Sistema Online - Dados Atualizados' : 
               dbLoading ? '🟡 Conectando ao Sistema...' : 
               '🔴 Modo Offline - Cardápio Padrão Ativo'}
            </span>
            {!isConnected && !dbLoading && (
              <button
                onClick={() => { retryConnection(); retryLoadMenu(); }}
                className="ml-4 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 font-medium"
              >
                🔄 Reconectar
              </button>
            )}
          </div>
        </div>

        {/* Menu Error Display */}
        {menuError && (
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 border-l-4 border-yellow-500 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Info className="text-yellow-600 dark:text-yellow-400 mr-3" size={24} weight="fill" />
                <div>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Aviso do Sistema</h3>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">{menuError}</p>
                </div>
              </div>
              <button
                onClick={retryLoadMenu}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                disabled={loadingMenu}
              >
                {loadingMenu ? '🔄 Tentando...' : `🔄 Tentar ${retryCount > 0 ? `(${retryCount})` : ''}`}
              </button>
            </div>
          </div>
        )}


        {/* Main Menu Section */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-50 to-orange-50 dark:from-slate-800 dark:to-slate-700 p-8 border-b border-slate-200 dark:border-slate-600">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-2xl">
                    <Calendar className="w-8 h-8 text-white" weight="fill" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                      Cardápio Semanal
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                        ✅ Atualizado Hoje
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-sm">
                        {new Date().toLocaleDateString('pt-BR', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Pratos especiais renovados diariamente para uma experiência gastronômica única
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                    🔄 Rotação Automática
                  </span>
                  <span className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
                    📱 Atualização Fácil
                  </span>
                  <span className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full text-sm font-medium">
                    ⭐ Pratos Únicos
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Menu View */}
          <div className="p-8">
              {/* Date Selection - Only visible in daily mode */}
              {viewMode === 'daily' && (
                <div className="flex flex-col items-center mb-8 space-y-4">
                  {/* Calendar Date Picker */}
                  <div className="flex items-center justify-center">
                    <DatePicker
                      selectedDate={currentDate}
                      onDateSelect={handleDateSelect}
                      isOpen={isCalendarOpen}
                      onToggle={toggleCalendar}
                    />
                  </div>
                  
                  {/* Current Date Display */}
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                      {currentDate.toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Cardápio do dia selecionado
                    </p>
                  </div>
                  
                  {/* Quick Day Navigation - Month Boundary Aware */}
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      disabled={!canNavigateDay(-1)}
                      onClick={() => navigateDay(-1)}
                      className={`p-2 rounded-lg transition-all duration-200 group flex items-center space-x-2 ${
                        canNavigateDay(-1) 
                          ? 'hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer' 
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                      title={loadingMenu || isNavigating ? "Carregando..." : (canNavigateDay(-1) ? "Dia anterior" : "Início do mês")}
                    >
                      <i className={`ph ph-caret-left text-lg ${
                        canNavigateDay(-1) ? 'group-hover:scale-110 transition-transform' : ''
                      }`}></i>
                      <span className="text-sm text-slate-600 dark:text-slate-400">Anterior</span>
                    </button>
                    
                    <button
                      disabled={!canNavigateDay(1)}
                      onClick={() => navigateDay(1)}
                      className={`p-2 rounded-lg transition-all duration-200 group flex items-center space-x-2 ${
                        canNavigateDay(1) 
                          ? 'hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer' 
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                      title={loadingMenu || isNavigating ? "Carregando..." : (canNavigateDay(1) ? "Próximo dia" : "Fim do mês")}
                    >
                      <span className="text-sm text-slate-600 dark:text-slate-400">Próximo</span>
                      <i className={`ph ph-caret-right text-lg ${
                        canNavigateDay(1) ? 'group-hover:scale-110 transition-transform' : ''
                      }`}></i>
                    </button>
                  </div>
                </div>
              )}
              
              {/* View Mode Toggle */}
              <div className="flex justify-center mb-8">
                <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-1 flex">
                  <button
                    onClick={() => toggleViewMode('daily')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      viewMode === 'daily'
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    📅 Visualização Diária
                  </button>
                  <button
                    onClick={() => toggleViewMode('weekly')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      viewMode === 'weekly'
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    📋 Visualização Semanal
                  </button>
                </div>
              </div>
              
              {/* Daily Menu */}
              {viewMode === 'daily' && (
                <div>
                  {loadingMenu ? (
                <div className="flex flex-col justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mb-4"></div>
                  <span className="text-lg text-slate-600 dark:text-slate-300 font-medium">Carregando cardápio...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {getFilteredDailyMenu().length > 0 ? (
                    getFilteredDailyMenu().map((item, index) => {
                      const formattedDate = currentDate.toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        day: '2-digit',
                        month: '2-digit'
                      });
                      
                      const dateOnly = currentDate.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit'
                      });
                      
                      return (
                        <div 
                          key={item.id || index} 
                          onClick={() => handleMenuItemClick(item)}
                          className="relative rounded-xl p-6 transition-all duration-300 cursor-pointer group transform hover:scale-105 hover:-translate-y-1 bg-gradient-to-br from-orange-50 via-orange-100 to-amber-100 dark:from-orange-900/40 dark:via-orange-800/30 dark:to-amber-900/40 border-2 border-orange-300 dark:border-orange-500 shadow-xl shadow-orange-200/50 dark:shadow-orange-900/30"
                        >
                          <div className="text-center mb-4">
                            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">
                              HOJE
                            </span>
                            <div className="text-lg font-bold capitalize text-orange-800 dark:text-orange-200">
                              {formattedDate.split(',')[0]} - {dateOnly}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 mr-2">
                              <h4 className="font-bold text-lg leading-tight mb-1 text-orange-900 dark:text-orange-100">
                                {item.name || item.nome}
                              </h4>
                              <div className="text-sm capitalize text-orange-700 dark:text-orange-300">
                                {item.category || item.categoria}
                              </div>
                            </div>
                            {item.preco && (
                              <div className="text-lg font-bold text-orange-800 dark:text-orange-200">
                                R$ {parseFloat(item.preco).toFixed(2)}
                              </div>
                            )}
                          </div>
                          
                          {(item.description || item.descricao) && (
                            <div className="text-sm mb-3 line-clamp-3 leading-relaxed text-orange-800 dark:text-orange-200">
                              {item.description || item.descricao}
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {item.specialOffer && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 font-medium">
                                🔥 Oferta
                              </span>
                            )}
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 font-medium">
                              ⭐ Especial do Dia
                            </span>
                          </div>
                          
                          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-orange-400">
                            <ArrowSquareOut size={16} />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full text-center py-20">
                      <div className="text-6xl mb-4">🍽️</div>
                      <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Nenhum prato disponível hoje
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400">
                        {searchTerm || selectedCategory !== 'all' 
                          ? 'Tente ajustar os filtros de busca' 
                          : 'Volte amanhã para ver o cardápio do dia'
                        }
                      </p>
                    </div>
                  )}
                </div>
                  )}
                </div>
              )}
              
              {/* Weekly Menu */}
              {viewMode === 'weekly' && (
                <div className="space-y-8">
                  {loadingWeeklyMenu ? (
                    <div className="flex flex-col justify-center items-center py-20">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mb-4"></div>
                      <span className="text-lg text-slate-600 dark:text-slate-300 font-medium">Carregando cardápio semanal...</span>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                      
                      {Object.keys(weeklyMenu).length > 0 ? (
                        <div>

                          
                          {/* Header */}
                          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 md:p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              {/* Center Content - Mobile First */}
                              <div className="text-center order-1 md:order-2">
                                <h2 className="text-2xl md:text-3xl font-bold mb-2">Cardápio da Semana</h2>
                                <p className="text-orange-100 text-sm md:text-base">Cardápio Regional - São Paulo - SP</p>
                                <p className="text-orange-100 text-xs md:text-sm">
                                  {currentWeekOffset === 0 ? 'Semana atual' : 
                                   currentWeekOffset > 0 ? `${currentWeekOffset} semana${currentWeekOffset > 1 ? 's' : ''} à frente` :
                                   `${Math.abs(currentWeekOffset)} semana${Math.abs(currentWeekOffset) > 1 ? 's' : ''} atrás`}
                                </p>
                              </div>
                              
                              {/* Navigation Buttons */}
                              <div className="flex items-center justify-center gap-4 order-2 md:order-none">
                                {/* Previous Week Button */}
                                <button
                                   onClick={() => navigateWeek(-1)}
                                   disabled={!canNavigateWeek(-1)}
                                   className={`flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 rounded-lg relative transition-all duration-200 ${
                                     canNavigateWeek(-1) 
                                       ? 'bg-white/20 hover:bg-white/30 cursor-pointer' 
                                       : 'bg-white/10 opacity-50 cursor-not-allowed'
                                   }`}
                                   style={{zIndex: 1000, position: 'relative'}}
                                   title={canNavigateWeek(-1) ? "Semana anterior" : "Navegação limitada a 5 dias do mês anterior/próximo"}
                                 >
                                   <CaretLeft className="text-base md:text-lg" />
                                   <span className="text-xs md:text-sm font-medium">Anterior</span>
                                 </button>
                                
                                {/* Next Week Button */}
                                <button
                                   onClick={() => navigateWeek(1)}
                                   disabled={!canNavigateWeek(1)}
                                   className={`flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 rounded-lg relative transition-all duration-200 ${
                                     canNavigateWeek(1) 
                                       ? 'bg-white/20 hover:bg-white/30 cursor-pointer' 
                                       : 'bg-white/10 opacity-50 cursor-not-allowed'
                                   }`}
                                   style={{zIndex: 1000, position: 'relative'}}
                                   title={canNavigateWeek(1) ? "Próxima semana" : "Navegação limitada a 5 dias do mês anterior/próximo"}
                                 >
                                   <span className="text-xs md:text-sm font-medium">Próximo</span>
                                     <CaretRight className="text-base md:text-lg" />
                                   </button>
                              </div>
                            </div>
                          </div>

                          {/* Weekly Menu Cards */}
                          <div className="p-6 space-y-6">
                            {/* Check if there's any data for this week */}
                            {Object.keys(weeklyMenu).length === 0 ? (
                              <div className="text-center py-12">
                                <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-8">
                                  <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Cardápio não disponível
                                  </h3>
                                  <p className="text-slate-600 dark:text-slate-400">
                                    Não há cardápio disponível para esta semana.
                                  </p>
                                </div>
                              </div>
                            ) : (
                              /* Order days correctly */
                              ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']
                                .filter(day => weeklyMenu[day]) // Only include days that exist in the data
                                .map((day) => {
                              const dishes = weeklyMenu[day].sort((a, b) => {
                                if (!a.dataPreparacao && !b.dataPreparacao) return 0;
                                if (!a.dataPreparacao) return 1;
                                if (!b.dataPreparacao) return -1;
                                return new Date(b.dataPreparacao) - new Date(a.dataPreparacao);
                              });
                              const dayNames = {
                                'domingo': 'Domingo',
                                'segunda': 'Segunda-feira',
                                'terca': 'Terça-feira', 
                                'quarta': 'Quarta-feira',
                                'quinta': 'Quinta-feira',
                                'sexta': 'Sexta-feira',
                                'sabado': 'Sábado'
                              };
                              
                              const dayEmojis = {
                                'domingo': '☀️',
                                'segunda': '💼',
                                'terca': '🔥',
                                'quarta': '⚡',
                                'quinta': '🌟',
                                'sexta': '🎉',
                                'sabado': '🌙'
                              };
                              
                              // Calculate the correct date for each day of the week
                              const today = new Date();
                              const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
                              
                              // Map day names to correct indices (0=domingo, 1=segunda, etc.)
                              const dayMap = {
                                'domingo': 0,
                                'segunda': 1, 
                                'terca': 2,
                                'quarta': 3,
                                'quinta': 4,
                                'sexta': 5,
                                'sabado': 6
                              };
                              
                              const dayIndex = dayMap[day];
                              
                              // Calculate the start of the current week (Sunday)
                              const startOfCurrentWeek = new Date(today);
                              startOfCurrentWeek.setDate(today.getDate() - currentDayOfWeek);
                              startOfCurrentWeek.setHours(0, 0, 0, 0);
                              
                              // Calculate the start of the target week based on weekOffset
                              const startOfTargetWeek = new Date(startOfCurrentWeek);
                              startOfTargetWeek.setDate(startOfCurrentWeek.getDate() + (currentWeekOffset * 7));
                              
                              // Calculate the specific day date in the target week
                              const dayDate = new Date(startOfTargetWeek);
                              dayDate.setDate(startOfTargetWeek.getDate() + dayIndex);
                              dayDate.setHours(0, 0, 0, 0); // Reset time to start of day
                              
                              // Get current month and year
                              const currentMonth = today.getMonth();
                              const currentYear = today.getFullYear();
                              
                              // If this day is in a future month (next month or later), don't show it
                              if (dayDate.getMonth() > currentMonth && dayDate.getFullYear() === currentYear) {
                                return null;
                              }
                              
                              // If this day is in next year, don't show it
                              if (dayDate.getFullYear() > currentYear) {
                                return null;
                              }
                              
                              // Group dishes by category for this specific day
                              // Os dados já vêm organizados por dia do backend, não precisa filtrar por data
                              const pratoPrincipal = dishes.filter(dish => dish.categoria === 'prato-principal');
                              const acompanhamentos = dishes.filter(dish => dish.categoria === 'entrada');
                              const sobremesas = dishes.filter(dish => dish.categoria === 'sobremesa');
                               const isToday = new Date().toDateString() === dayDate.toDateString();
                              return (
                                <div key={day} className={`bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-xl p-6 border-2 transition-all duration-300 hover:shadow-lg ${
                                  isToday ? 'border-orange-400 shadow-orange-100 dark:shadow-orange-900/20' : 'border-slate-200 dark:border-slate-600'
                                }`}>
                                  {/* Day Header */}
                                  <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                      <span className="text-2xl">{dayEmojis[day]}</span>
                                      <div>
                                        <h3 className={`text-xl font-bold ${
                                          isToday ? 'text-orange-600 dark:text-orange-400' : 'text-slate-800 dark:text-white'
                                        }`}>
                                          {dayNames[day] || day}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                          {dayDate.getDate()} de {dayDate.toLocaleDateString('pt-BR', { month: 'long' })}
                                        </p>
                                      </div>
                                    </div>
                                    {isToday && (
                                      <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                        HOJE
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Menu Categories Grid */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Acompanhamentos */}
                                    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                                      <div className="flex items-center space-x-2 mb-3">
                                        <span className="text-lg">🥗</span>
                                        <h4 className="font-semibold text-slate-800 dark:text-white">Entrada</h4>
                                      </div>
                                      <div className="space-y-2">
                                        {acompanhamentos.length > 0 ? (
                                          acompanhamentos.map((dish, idx) => (
                                            
                                            <div 
                                              key={idx} 
                                              className="text-slate-700 dark:text-slate-300 cursor-pointer hover:text-orange-600 dark:hover:text-orange-400 transition-colors p-2 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20 text-sm"
                                              onClick={() => handleMenuItemClick(dish)}
                                            >
                                              • {dish.nome}
                                            </div>
                                          ))
                                        ) : (
                                          <span className="text-slate-400 dark:text-slate-500 italic text-sm">Não disponível</span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Prato Principal */}
                                    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                                      <div className="flex items-center space-x-2 mb-3">
                                        <span className="text-lg">🍽️</span>
                                        <h4 className="font-semibold text-slate-800 dark:text-white">Prato Principal</h4>
                                      </div>
                                      <div className="space-y-2">
                                        {pratoPrincipal.length > 0 ? (
                                          pratoPrincipal.map((dish, idx) => (
                                            <div 
                                              key={idx} 
                                              className="text-slate-700 dark:text-slate-300 cursor-pointer hover:text-orange-600 dark:hover:text-orange-400 transition-colors p-2 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20 text-sm"
                                              onClick={() => handleMenuItemClick(dish)}
                                            >
                                              • {dish.nome}
                                            </div>
                                          ))
                                        ) : (
                                          <span className="text-slate-400 dark:text-slate-500 italic text-sm">Não disponível</span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Sobremesas */}
                                    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                                      <div className="flex items-center space-x-2 mb-3">
                                        <span className="text-lg">🍰</span>
                                        <h4 className="font-semibold text-slate-800 dark:text-white">Sobremesas</h4>
                                      </div>
                                      <div className="space-y-2">
                                        {sobremesas.length > 0 ? (
                                          sobremesas.map((dish, idx) => (
                                            <div 
                                              key={idx} 
                                              className="text-slate-700 dark:text-slate-300 cursor-pointer hover:text-orange-600 dark:hover:text-orange-400 transition-colors p-2 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20 text-sm"
                                              onClick={() => handleMenuItemClick(dish)}
                                            >
                                              • {dish.nome}
                                            </div>
                                          ))
                                        ) : (
                                          <span className="text-slate-400 dark:text-slate-500 italic text-sm">Não disponível</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-20">
                          <div className="text-6xl mb-4">📅</div>
                          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
                            Cardápio semanal não disponível
                          </h3>
                          <p className="text-slate-500 dark:text-slate-400">
                            Tente novamente em alguns instantes
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
        </div>

        {/* Menu Item Details Modal */}
        {isModalOpen && selectedMenuItem && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50" onClick={closeModal}>
            <div 
              className="bg-gradient-to-br from-white via-slate-50/90 to-white dark:from-slate-800 dark:via-slate-700/90 dark:to-slate-800 rounded-3xl shadow-2xl shadow-slate-900/20 dark:shadow-black/40 border border-slate-200/50 dark:border-slate-600/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 hover:scale-[1.01]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-8 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                  {selectedMenuItem.name || selectedMenuItem.nome}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X size={24} className="text-slate-600 dark:text-slate-400" />
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="p-8 space-y-6">
                {/* Special Offer */}
                {selectedMenuItem.isSpecialOffer && (
                  <div className="flex justify-center">
                    <span className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full font-medium">
                      🔥 Oferta Especial
                    </span>
                  </div>
                )}
                
                {/* Description */}
                {(selectedMenuItem.description || selectedMenuItem.descricao) && (
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white mb-3">Descrição</h4>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {selectedMenuItem.description || selectedMenuItem.descricao}
                    </p>
                  </div>
                )}
                
                {/* Ingredients */}
                {selectedMenuItem.ingredients && selectedMenuItem.ingredients.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white mb-3">Ingredientes</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMenuItem.ingredients.map((ingredient, idx) => (
                        <span key={idx} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full">
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Category */}
                {selectedMenuItem.category && (
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white mb-3">Categoria</h4>
                    <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                      {selectedMenuItem.category}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cardapio;