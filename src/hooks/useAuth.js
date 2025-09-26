import { useState, useEffect } from 'react';
import apiClient from '../config/api';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const login = async (email, password, unit) => {
    try {
      const data = await apiClient.post('/auth/login', { email, password, unit });

      const userData = {
        id: data.user._id,
        email: data.user.email,
        username: data.user.username,
        name: data.user.name,
        unit: data.user.unit,
        loginTime: new Date().toISOString(),
        token: data.token,
        isAdmin: data.user.isAdmin || false,
        adminRole: data.user.adminRole || null
      };
      
      setCurrentUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      // Show appropriate success message based on user type
      if (userData.isAdmin) {
        showSuccessMessage(`Bem-vindo, ${userData.name}! Login de administrador realizado com sucesso.`);
        // Redirect to admin dashboard for admin users
        window.location.href = '/#admin';
      } else {
        const unitName = userData.unit ? userData.unit.name : 'sua unidade';
        showSuccessMessage(`Bem-vindo, ${userData.name}! Login realizado com sucesso em ${unitName}.`);
        // Redirect to root path for regular users
        window.location.href = '/';
      }
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      // Throw the error so LoginModal can catch it properly
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    
    // Show success message
    showSuccessMessage('Logout realizado com sucesso!');
    
    // Redirect to home page
    setTimeout(() => {
      window.location.hash = 'entrada';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 500);
  };

  const showSuccessMessage = (message) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform';
    toast.innerHTML = `
      <div class="flex items-center">
        <i class="ph ph-check-circle text-lg mr-2"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  // Utility functions for admin privileges
  const isAdmin = () => {
    return currentUser?.isAdmin === true;
  };

  const isSuperAdmin = () => {
    return currentUser?.isAdmin === true && currentUser?.adminRole === 'super_admin';
  };

  const hasAdminAccess = () => {
    return isAdmin();
  };

  return {
    currentUser,
    login,
    logout,
    isAdmin,
    isSuperAdmin,
    hasAdminAccess
  };
};