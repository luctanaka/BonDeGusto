// API Configuration for Frontend-Backend Communication

const API_CONFIG = {
  // Base URL for the backend API
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  
  // Request timeout in milliseconds
  timeout: 10000,
  
  // Default headers for all requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  // Retry configuration
  retries: 3,
  retryDelay: 1000
};

// HTTP Client class for API communication
class ApiClient {
  constructor(config = API_CONFIG) {
    this.config = config;
    this.baseURL = config.baseURL;
  }

  // Generic request method with error handling and retries
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: 'GET',
      headers: { ...this.config.headers },
      ...options
    };

    // Add timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    config.signal = controller.signal;

    let lastError;
    
    // Retry logic
    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        // console.log(`🔄 API Request (Attempt ${attempt}): ${config.method} ${url}`);
        
        const response = await fetch(url, config);
        clearTimeout(timeoutId);
        
        // Handle HTTP errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new ApiError(
            errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorData
          );
        }
        
        const data = await response.json();
        // console.log(`✅ API Success: ${config.method} ${url}`);
        return data;
        
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error;
        
        // Don't retry on certain errors
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          throw error;
        }
        
        // Don't retry on the last attempt
        if (attempt === this.config.retries) {
          break;
        }
        
        console.warn(`⚠️ API Retry ${attempt}/${this.config.retries}: ${error.message}`);
        await this.delay(this.config.retryDelay * attempt);
      }
    }
    
    console.error(`❌ API Failed: ${config.method} ${url}`, lastError);
    throw lastError;
  }

  // Helper method for delays
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Health check method
  async healthCheck() {
    try {
      const response = await this.get('/health');
      return {
        isHealthy: true,
        data: response
      };
    } catch (error) {
      return {
        isHealthy: false,
        error: error.message
      };
    }
  }
}

// Custom API Error class
class ApiError extends Error {
  constructor(message, status, data = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// Export the client and utilities
export { apiClient, ApiClient, ApiError, API_CONFIG };
export default apiClient;