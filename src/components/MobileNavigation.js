import React from 'react';

const MobileNavigation = ({ currentPage, onNavigate, currentUser }) => {
  const navigationItems = [
    { id: 'entrada', icon: 'ph-door-open' },
    { id: 'cardapio', icon: 'ph-bowl-food' },
    { id: 'servicos', icon: 'ph-handshake' },
    { id: 'galeria', icon: 'ph-images' },
    { id: 'contato', icon: 'ph-phone' },
    { id: 'avaliacoes', icon: 'ph-star' },
    { id: 'sobre', icon: 'ph-info' }
  ];

  const filteredItems = navigationItems.filter(item => {
    // Show cardapio only if user is logged in
    if (item.id === 'cardapio') return currentUser && currentUser.id;
    // Show avaliacoes only if user is logged in
    if (item.id === 'avaliacoes') return currentUser && currentUser.id;
    // Show all other items
    return true;
  });

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/95 backdrop-blur-md shadow-[0_-2px_5px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_5px_rgba(0,0,0,0.3)] z-40">
      <div className="container mx-auto px-2 grid gap-1" style={{gridTemplateColumns: `repeat(${filteredItems.length}, 1fr)`}}>
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`nav-btn-mobile ${
              currentPage === item.id ? 'page-active' : ''
            }`}
          >
            <i className={`ph ${item.icon} text-3xl`}></i>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default MobileNavigation;