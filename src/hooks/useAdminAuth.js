import { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import sessionTimeoutHandler from '../utils/sessionTimeout';

export const useAdminAuth = () => {
  const [adminUser, setAdminUser] = useState(() => {
    return adminService.getCurrentAdmin();
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if token is still valid on mount
    const token = adminService.getAuthToken();
    if (token && !adminUser) {
      const savedAdmin = adminService.getCurrentAdmin();
      if (savedAdmin) {
        setAdminUser(savedAdmin);
      }
    }

    // Listen for session timeout events
    const handleSessionTimeout = () => {
      setAdminUser(null);
      setError(null);
    };

    // Override the session timeout handler to include state updates
    const originalHandleTimeout = sessionTimeoutHandler.handleSessionTimeout.bind(sessionTimeoutHandler);
    sessionTimeoutHandler.handleSessionTimeout = (customMessage) => {
      handleSessionTimeout();
      originalHandleTimeout(customMessage);
    };

    // Cleanup function
    return () => {
      // Restore original handler if needed
      sessionTimeoutHandler.handleSessionTimeout = originalHandleTimeout;
    };
  }, [adminUser]);

  const login = async (username, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await adminService.login(username, password);
      setAdminUser(response.admin);
      showSuccessMessage('Login realizado com sucesso!');
      return response;
    } catch (error) {
      setError(error.message);
      showErrorMessage(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    adminService.logout();
    setAdminUser(null);
    setError(null);
    showSuccessMessage('Logout realizado com sucesso!');
  };

  const isAuthenticated = () => {
    return adminService.isAuthenticated() && adminUser;
  };

  const hasPermission = (permission) => {
    return adminService.hasPermission(permission);
  };

  const showSuccessMessage = (message) => {
    showToast(message, 'success');
  };

  const showErrorMessage = (message) => {
    showToast(message, 'error');
  };

  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const icon = type === 'success' ? 'ph-check-circle' : 'ph-x-circle';
    
    toast.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform`;
    toast.innerHTML = `
      <div class="flex items-center">
        <i class="ph ${icon} text-lg mr-2"></i>
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

  return {
    adminUser,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated,
    hasPermission,
    clearError: () => setError(null)
  };
};