/**
 * Session timeout utility for handling expired authentication sessions
 * Provides centralized session expiry detection and user notification
 */

class SessionTimeoutHandler {
  constructor() {
    this.isHandlingTimeout = false;
  }

  /**
   * Check if a response indicates session timeout
   * @param {Response} response - Fetch API response object
   * @returns {boolean} - True if session has expired
   */
  isSessionExpired(response) {
    return response.status === 401;
  }

  /**
   * Handle session timeout by showing notification and redirecting
   * @param {string} customMessage - Optional custom timeout message
   */
  handleSessionTimeout(customMessage = null) {
    // Prevent multiple simultaneous timeout handlers
    if (this.isHandlingTimeout) {
      return;
    }
    
    this.isHandlingTimeout = true;

    // Clear admin authentication data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');

    // Show professional timeout notification
    const message = customMessage || 
      'Sua sessão expirou devido à inatividade. Por favor, faça login novamente para continuar.';
    
    this.showTimeoutNotification(message);

    // Redirect to homepage after notification
    setTimeout(() => {
      this.redirectToHomepage();
      this.isHandlingTimeout = false;
    }, 3000);
  }

  /**
   * Display a professional timeout notification
   * @param {string} message - Notification message
   */
  showTimeoutNotification(message) {
    // Remove any existing timeout notifications
    const existingNotification = document.querySelector('.session-timeout-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'session-timeout-notification fixed top-4 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md text-center';
    notification.innerHTML = `
      <div class="flex items-center justify-center">
        <i class="ph ph-clock text-xl mr-3"></i>
        <div>
          <div class="font-semibold mb-1">Sessão Expirada</div>
          <div class="text-sm">${message}</div>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(-50%) translateY(0)';
    }, 100);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.transform = 'translateX(-50%) translateY(-100%)';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 2700);
  }

  /**
   * Redirect user to homepage
   */
  redirectToHomepage() {
    // Clear any hash-based routes
    window.location.hash = '';
    // Redirect to homepage
    window.location.href = '/';
  }

  /**
   * Create a fetch wrapper that automatically handles session timeouts
   * @param {string} url - Request URL
   * @param {object} options - Fetch options
   * @returns {Promise<Response>} - Fetch response
   */
  async fetchWithTimeoutHandling(url, options = {}) {
    try {
      const response = await fetch(url, options);
      
      if (this.isSessionExpired(response)) {
        this.handleSessionTimeout();
        throw new Error('Session expired');
      }
      
      return response;
    } catch (error) {
      // Re-throw non-timeout errors
      if (error.message !== 'Session expired') {
        throw error;
      }
      throw error;
    }
  }
}

// Create singleton instance
const sessionTimeoutHandler = new SessionTimeoutHandler();

export default sessionTimeoutHandler;

// Export individual methods for convenience
export const {
  isSessionExpired,
  handleSessionTimeout,
  showTimeoutNotification,
  redirectToHomepage,
  fetchWithTimeoutHandling
} = sessionTimeoutHandler;