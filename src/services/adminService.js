import { API_CONFIG } from '../config/api';
import sessionTimeoutHandler from '../utils/sessionTimeout';

class AdminService {
  constructor() {
    this.baseURL = `${API_CONFIG.baseURL}/admin`;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('adminToken');
  }

  // Set auth headers
  getAuthHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Centralized method for authenticated API requests with session timeout handling
  async makeAuthenticatedRequest(url, options = {}) {
    const requestOptions = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, requestOptions);
      
      // Check for session timeout
      if (sessionTimeoutHandler.isSessionExpired(response)) {
        sessionTimeoutHandler.handleSessionTimeout();
        throw new Error('Session expired');
      }
      
      return response;
    } catch (error) {
      // Re-throw the error for the calling method to handle
      throw error;
    }
  }

  // Admin login
  async login(username, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const response_data = await response.json();
      
      // Store token and admin info
      localStorage.setItem('adminToken', response_data.data.accessToken);
      localStorage.setItem('adminUser', JSON.stringify(response_data.data.admin));
      
      const data = response_data.data;
      
      return data;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  }

  // Admin logout
  logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }

  // Get current admin user
  getCurrentAdmin() {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser || adminUser === 'undefined' || adminUser === 'null') {
      return null;
    }
    try {
      return JSON.parse(adminUser);
    } catch (error) {
      console.error('Error parsing admin user from localStorage:', error);
      localStorage.removeItem('adminUser');
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getAuthToken();
  }

  // Check if user has specific permission
  hasPermission(permission) {
    const admin = this.getCurrentAdmin();
    return admin && admin.permissions && admin.permissions.includes(permission);
  }

  // Get dashboard stats
  async getDashboardStats() {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.baseURL}/dashboard/stats`);

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Menu management
  async getMenuItems() {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.baseURL}/menu`);

      if (!response.ok) {
        throw new Error('Failed to fetch menu items');
      }

      const result = await response.json();
      return result.data?.items || [];
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }
  }

  async createMenuItem(menuItem) {
    try {
      const response = await fetch(`${this.baseURL}/menu`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(menuItem)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create menu item');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  }

  async updateMenuItem(id, menuItem) {
    try {
      const response = await fetch(`${this.baseURL}/menu/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(menuItem)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update menu item');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  }

  async deleteMenuItem(id) {
    try {
      const response = await fetch(`${this.baseURL}/menu/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete menu item');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  }

  // Review management
  async getReviews(status = 'all') {
    try {
      // Check if user is authenticated
      if (!this.isAuthenticated()) {
        throw new Error('Você precisa fazer login como administrador para acessar as avaliações. Use as credenciais: admin / Admin123!');
      }

      const url = status === 'all' 
        ? `${this.baseURL}/reviews` 
        : `${this.baseURL}/reviews?status=${status}`;
        
      const response = await this.makeAuthenticatedRequest(url);

      if (!response.ok) {
        throw new Error(`Erro ao buscar avaliações: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.data?.reviews || [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  }

  async moderateReview(id, action) {
    try {
      const response = await fetch(`${this.baseURL}/reviews/${id}/moderate`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to moderate review');
      }

      return await response.json();
    } catch (error) {
      console.error('Error moderating review:', error);
      throw error;
    }
  }

  // Gallery management
  async getGalleryImages() {
    try {
      const response = await fetch(`${this.baseURL}/gallery`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch gallery images');
      }

      const result = await response.json();
      return result.data?.images || [];
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      throw error;
    }
  }

  // User Management
  async getUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${this.baseURL}/users?${queryParams}`, {
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUserById(id) {
    try {
      const response = await fetch(`${this.baseURL}/users/${id}`, {
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      
      const result = await response.json();
      return result.data.user;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async createUser(userData) {
    try {
      const response = await fetch(`${this.baseURL}/users`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create user');
      }
      
      const result = await response.json();
      return result.data.user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id, userData) {
    try {
      const response = await fetch(`${this.baseURL}/users/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update user');
      }
      
      const result = await response.json();
      return result.data.user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async resetUserPassword(id, newPassword) {
    try {
      const response = await fetch(`${this.baseURL}/users/${id}/reset-password`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ newPassword })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reset password');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      const response = await fetch(`${this.baseURL}/users/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete user');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async getUserStats() {
    try {
      const response = await fetch(`${this.baseURL}/users/stats/overview`, {
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user statistics');
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  async uploadImage(formData) {
    try {
      const token = this.getAuthToken();
      const response = await fetch(`${this.baseURL}/gallery/upload`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload image');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  async deleteImage(id) {
    try {
      const response = await fetch(`${this.baseURL}/gallery/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete image');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }
}

const adminService = new AdminService();
export default adminService;