import React, { useState } from 'react';
import logo from '../assets/MARCA BONDEGUSTO SEM FUNDON HORIZ 2.png';
const Header = ({ currentPage, onNavigate, onToggleTheme, onOpenLogin, currentUser, onLogout, adminUser }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navigationItems = [
    { id: 'entrada', icon: 'ph-door-open', label: 'Início' },
    { id: 'cardapio', icon: 'ph-bowl-food', label: 'Cardápio' },
    { id: 'servicos', icon: 'ph-handshake', label: 'Serviços' },
    { id: 'galeria', icon: 'ph-images', label: 'Galeria' },
    { id: 'contato', icon: 'ph-phone', label: 'Contato' },
    { id: 'avaliacoes', icon: 'ph-star', label: 'Avaliações' },
    { id: 'sobre', icon: 'ph-info', label: 'Sobre' }
  ];

  const getLocationName = (locationKey) => {
    const locations = {
      'sao-paulo': 'São Paulo - SP',
      'rio-de-janeiro': 'Rio de Janeiro - RJ',
      'belo-horizonte': 'Belo Horizonte - MG',
      'brasilia': 'Brasília - DF',
      'salvador': 'Salvador - BA',
      'fortaleza': 'Fortaleza - CE',
      'recife': 'Recife - PE',
      'porto-alegre': 'Porto Alegre - RS'
    };
    return locations[locationKey] || locationKey;
  };

  const handleUserMenuToggle = () => {
    if (currentUser) {
      setShowUserMenu(!showUserMenu);
    } else {
      onOpenLogin();
    }
  };

  const handleLogout = () => {
    onLogout();
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white/90 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 shadow-sm dark:shadow-slate-800/20">
      <div className="container mx-auto px-1 sm:px-2 lg:px-3">
        <div className="relative flex items-center justify-between h-24 sm:h-20 md:h-24 lg:h-28">
          {/* Logo */}
          <div className="flex items-center justify-start flex-shrink-0 -ml-3 sm:-ml-10 md:-ml-20 mt-0 sm:-mt-2 md:-mt-5">
            <img 
              src={logo}
              alt="Logo Bondegusto"
              className="h-56 sm:h-40 md:h-80 lg:h-92 w-auto object-contain max-w-full"
            />
          </div>
          
          {/* Desktop Navigation - Always visible */}
          <nav className="hidden md:flex items-center justify-center gap-4 absolute left-1/2 transform -translate-x-1/2">
            {navigationItems
              .filter(item => item.id !== 'cardapio' || currentUser)
              .map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`nav-btn ${
                  currentPage === item.id ? 'page-active' : ''
                }`}
              >
                <i className={`ph ${item.icon} text-lg`}></i>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          
          {/* Actions */}
          <div className="flex items-center justify-end gap-3 flex-shrink-0">
            {/* Admin Access Button - Only show for authenticated admin users */}
            {adminUser && (
              <button
                onClick={() => onNavigate('admin')}
                className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-blue-600 dark:text-blue-400"
                title="Acesso Administrativo"
              >
                <i className="ph ph-shield text-xl"></i>
              </button>
            )}
            
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <i className="ph ph-sun text-xl block dark:hidden"></i>
              <i className="ph ph-moon text-xl hidden dark:block"></i>
            </button>
            
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={handleUserMenuToggle}
                className="relative p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <i className="ph ph-user text-xl"></i>
              </button>
              
              {/* User Dropdown Menu */}
              {showUserMenu && currentUser && (
                <div className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 min-w-48 z-50">
                  <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{currentUser.email}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Localização: {getLocationName(currentUser.location)}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <i className="ph ph-sign-out mr-2"></i>Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </header>
  );
};

export default Header;