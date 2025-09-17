import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// AI Services
export const aiApi = {
  summarize: async (text, languagePreference = 'english') => {
    const response = await api.post('/summarize', {
      text,
      language_preference: languagePreference
    });
    return response.data;
  },

  explain: async (text, languagePreference = 'english') => {
    const response = await api.post('/explain', {
      text,
      language_preference: languagePreference
    });
    return response.data;
  },

  generateExercises: async (text, languagePreference = 'english') => {
    const response = await api.post('/generate_exercises', {
      text,
      language_preference: languagePreference
    });
    return response.data;
  }
};

// Session Management
export const sessionApi = {
  getUserSessions: async (limit = 20, collectionId = null) => {
    const params = { limit };
    if (collectionId) params.collection_id = collectionId;
    
    const response = await api.get('/sessions', { params });
    return response.data;
  },

  deleteSession: async (sessionId) => {
    const response = await api.delete(`/sessions/${sessionId}`);
    return response.data;
  }
};

// Collections Management
export const collectionsApi = {
  getCollections: async () => {
    const response = await api.get('/collections');
    return response.data;
  },

  createCollection: async (name, description = '') => {
    const response = await api.post('/collections', {
      name,
      description
    });
    return response.data;
  },

  updateCollection: async (id, name, description = '') => {
    const response = await api.put(`/collections/${id}`, {
      name,
      description
    });
    return response.data;
  },

  deleteCollection: async (id) => {
    const response = await api.delete(`/collections/${id}`);
    return response.data;
  },

  addSessionToCollection: async (collectionId, sessionId) => {
    const response = await api.post(`/collections/${collectionId}/sessions/${sessionId}`);
    return response.data;
  },

  removeSessionFromCollection: async (collectionId, sessionId) => {
    const response = await api.delete(`/collections/${collectionId}/sessions/${sessionId}`);
    return response.data;
  }
};

// Health Check
export const healthApi = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url);
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
    console.log('API Response:', response.status, response.config.url);
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

// Export service aliases for ChatInterfaceV2 compatibility
export const aiService = {
  ...aiApi,
  sendMessage: async (data) => {
    // Legacy function for backward compatibility
    const response = await api.post('/ai/message', data);
    return response;
  }
};

export const sessionService = {
  ...sessionApi,
  getSession: async (sessionId) => {
    const response = await api.get(`/sessions/${sessionId}`);
    return response;
  },
  createSession: async (sessionData) => {
    const response = await api.post('/sessions', sessionData);
    return response;
  }
};

export const collectionService = {
  ...collectionsApi,
  getUserCollections: async () => {
    const response = await api.get('/collections');
    return response;
  },
  getCollection: async (collectionId) => {
    const response = await api.get(`/collections/${collectionId}`);
    return response;
  },
  getCollectionSessions: async (collectionId) => {
    const response = await api.get(`/collections/${collectionId}/sessions`);
    return response;
  },
  createCollection: async (collectionData) => {
    const response = await api.post('/collections', collectionData);
    return response;
  },
  deleteCollection: async (collectionId) => {
    const response = await api.delete(`/collections/${collectionId}`);
    return response;
  }
};

export default api;