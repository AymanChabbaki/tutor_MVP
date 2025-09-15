import axios from 'axios';

// Get the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    // Handle different error types
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    }
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      if (status === 400) {
        throw new Error(data?.message || 'Invalid input. Please check your data.');
      } else if (status === 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(data?.message || `Request failed with status ${status}`);
      }
    } else if (error.request) {
      // Network error
      throw new Error('Network error. Please check your connection and try again.');
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
);

/**
 * Generate summary for course content
 * @param {string} text - Course content to summarize
 * @param {string} language - Language preference ('english' or 'arabic')
 * @returns {Promise<Object>} Response with summary
 */
export const postSummary = async (text, language = 'english') => {
  try {
    if (!text || !text.trim()) {
      throw new Error('Please enter some course content to summarize.');
    }

    const response = await api.post('/summarize', {
      text: text.trim(),
      language_preference: language
    });

    return response.data;
  } catch (error) {
    console.error('Summary API Error:', error);
    throw error;
  }
};

/**
 * Generate explanation for course content
 * @param {string} text - Course content to explain
 * @param {string} language - Language preference ('english' or 'arabic')
 * @returns {Promise<Object>} Response with explanation
 */
export const postExplanation = async (text, language = 'english') => {
  try {
    if (!text || !text.trim()) {
      throw new Error('Please enter some course content to explain.');
    }

    const response = await api.post('/explain', {
      text: text.trim(),
      language_preference: language
    });

    return response.data;
  } catch (error) {
    console.error('Explanation API Error:', error);
    throw error;
  }
};

/**
 * Generate exercises for course content
 * @param {string} text - Course content to create exercises from
 * @param {string} language - Language preference ('english' or 'arabic')
 * @returns {Promise<Object>} Response with exercises
 */
export const postExercises = async (text, language = 'english') => {
  try {
    if (!text || !text.trim()) {
      throw new Error('Please enter some course content to generate exercises.');
    }

    const response = await api.post('/generate_exercises', {
      text: text.trim(),
      language_preference: language
    });

    return response.data;
  } catch (error) {
    console.error('Exercises API Error:', error);
    throw error;
  }
};

/**
 * Test API connection
 * @returns {Promise<Object>} Health check response
 */
export const testConnection = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health Check Error:', error);
    throw new Error('Unable to connect to the server. Please ensure the backend is running.');
  }
};

export default api;