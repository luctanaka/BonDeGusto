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

  const login = async (email, password, location) => {
    try {
      const data = await apiClient.post('/auth/login', { email, password, location });

      const userData = {
        id: data.user._id,
        email: data.user.email,
        name: data.user.name,
        location: data.user.location,
        loginTime: new Date().toISOString(),
        token: data.token
      };
      
      setCurrentUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      showSuccessMessage(`Bem-vindo, ${userData.name}! Login realizado com sucesso em ${getLocationName(location)}.`);
      
      // Redirect to root path after successful login
      window.location.href = '/';
      
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

  return {
    currentUser,
    login,
    logout,
    getLocationName
  };
};