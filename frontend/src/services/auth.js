import api from './api';

export const authApi = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password
    });
    return response.data;
  },

  register: async (name, email, password, languagePref = 'english') => {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      languagePref: languagePref
    });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export default authApi;