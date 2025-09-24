import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MobileNavigation from './components/MobileNavigation';
import LoginModal from './components/LoginModal';
import Entrada from './pages/Entrada';
import Cardapio from './pages/Cardapio';
import Servicos from './pages/Servicos';
import Galeria from './pages/Galeria';
import Contato from './pages/Contato';
import Avaliacoes from './pages/Avaliacoes';
import Sobre from './pages/Sobre';
import AdminDashboard from './pages/AdminDashboard';
import SecretAdminLogin from './pages/SecretAdminLogin';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { useAdminAuth } from './hooks/useAdminAuth';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState('entrada');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { currentUser, login, logout } = useAuth();
  const { adminUser } = useAdminAuth();

  // Apply theme to document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Handle URL-based navigation and route protection
  useEffect(() => {
    const handleRouteChange = () => {
      const hash = window.location.hash.substring(1);
      const path = window.location.pathname;
      
      // Check for admin routes in URL
      if (hash === 'admin-secret-login' || path.includes('/admin-secret-login')) {
        setCurrentPage('admin-secret-login');
      } else if (hash === 'admin' || path.includes('/admin')) {
        setCurrentPage('admin');
      } else if (hash && ['entrada', 'cardapio', 'servicos', 'galeria', 'contato', 'avaliacoes', 'sobre'].includes(hash)) {
        setCurrentPage(hash);
      }
    };

    // Handle initial load
    handleRouteChange();

    // Listen for URL changes
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, [adminUser]);

  const handleNavigation = (page) => {
    // Check if trying to access menu without login
    if (page === 'cardapio' && !currentUser) {
      showLoginRequiredMessage();
      return;
    }
    
    setCurrentPage(page);
    
    // Update URL hash for navigation
    if (page !== 'admin-secret-login') {
      window.location.hash = page;
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showLoginRequiredMessage = () => {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-orange-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <i class="ph ph-warning-circle text-xl"></i>
        <div>
          <p class="font-semibold">Login Necessário</p>
          <p class="text-sm opacity-90">Faça login para acessar o cardápio</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 4000);
    
    // Open login modal after delay
    setTimeout(() => {
      setIsLoginModalOpen(true);
    }, 1000);
  };

  const showUnauthorizedAccessWarning = () => {
    // Create warning toast
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300 max-w-sm';
    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <i class="ph ph-shield-warning text-xl"></i>
        <div>
          <p class="font-semibold">Acesso Negado</p>
          <p class="text-sm opacity-90">Área restrita a administradores</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 4000);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'entrada':
        return <Entrada />;
      case 'sobre':
        return <Sobre />;
      case 'cardapio':
        if (!currentUser) {
          // Redirect to home and show login message if not authenticated
          setTimeout(() => {
            setCurrentPage('entrada');
            showLoginRequiredMessage();
          }, 0);
          return <Entrada />;
        }
        return <Cardapio currentUser={currentUser} />;
      case 'servicos':
        return <Servicos />;
      case 'galeria':
        return <Galeria />;
      case 'contato':
        return <Contato />;
      case 'avaliacoes':
        return <Avaliacoes />;
      case 'admin':
        if (!adminUser) {
          // Redirect to home if not authenticated as admin
          setTimeout(() => {
            setCurrentPage('entrada');
          }, 0);
          return <Entrada />;
        }
        return <AdminDashboard />;
      case 'admin-secret-login':
        return <SecretAdminLogin />;
      default:
        return <Entrada />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Header 
        currentPage={currentPage}
        onNavigate={handleNavigation}
        onToggleTheme={toggleTheme}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        currentUser={currentUser}
        onLogout={logout}
        adminUser={adminUser}
      />
      
      <main className="w-full min-h-screen py-8 pb-24 md:pb-8 bg-gray-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {renderCurrentPage()}
        </div>
      </main>
      
      {/* Mobile Navigation - Always visible */}
      <MobileNavigation 
        currentPage={currentPage}
        onNavigate={handleNavigation}
        currentUser={currentUser}
      />
      
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={login}
      />
    </div>
  );
}

export default App;