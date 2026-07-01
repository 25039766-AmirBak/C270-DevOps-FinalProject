import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api/auth',
});

const authService = {
  login: (email, password) => API.post('/login', { email, password }),
  register: (name, email, password) => API.post('/register', { name, email, password }),
  getProfile: (token) =>
    API.get('/profile', {
      headers: { Authorization: `Bearer ${token}` },
    }),
  logout: () => localStorage.removeItem('token'),
};

export default authService;
