/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Log request details in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

   
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log response details in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.status} ${response.config.url}`, {
        data: response.data,
      });
    }

    return response;
  },
  (error) => {
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const { status, data, config } = error.response;
      
      console.error(`API Error ${status}: ${config?.url}`, {
        status,
        data,
        url: config?.url,
      });

      // Handle specific error cases
      switch (status) {
        case 401:
          console.error('Unauthorized - User needs to re-authenticate');
          // You could redirect to login here if needed
          break;
        case 403:
          console.error(' Forbidden - User lacks permission');
          break;
        case 404:
          console.error(' Not Found - Resource not available');
          break;
        case 500:
          console.error(' Server Error - Internal server error');
          break;
        default:
          console.error(` HTTP Error ${status}`);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error(' Network Error - No response received', {
        url: error.config?.url,
        timeout: error.code === 'ECONNABORTED',
      });
    } else {
      // Something else happened
      console.error(' Unknown Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Helper functions for common API calls
export const api = {
  // Calendar events
  getCalendarEvents: () => apiClient.get('/api/calendar/events'),
  
  // Auth session
  getSession: () => apiClient.get('/api/auth/session'),
  
  // Generic methods
  get: (url: string, config?: any) => apiClient.get(url, config),
  post: (url: string, data?: any, config?: any) => apiClient.post(url, data, config),
  put: (url: string, data?: any, config?: any) => apiClient.put(url, data, config),
  delete: (url: string, config?: any) => apiClient.delete(url, config),
};

// Export the configured axios instance
export default apiClient; 