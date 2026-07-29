import axios from 'axios';

const API = axios.create({ baseURL: `${process.env.REACT_APP_API_URL}/api/auth` });
const VERIFICATION_API = axios.create({ baseURL: `${process.env.REACT_APP_API_URL}/api/verification` });

const authService = {
  login: (email, password) => API.post('/login', { email, password }),

  register: (name, email, password, role) =>
    API.post('/register', { name, email, password, role }),

  getProfile: (token) =>
    API.get('/profile', { headers: { Authorization: `Bearer ${token}` } }),

  getAllUsers: (token) =>
    API.get('/users', { headers: { Authorization: `Bearer ${token}` } }),

  deleteUser: (userId, token) =>
    API.delete(`/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),

  updateUserRoles: (userId, roles, token) =>
    API.patch(`/users/${userId}/roles`, { roles }, { headers: { Authorization: `Bearer ${token}` } }),

  uploadDocument: (file, token) => {
    const fd = new FormData();
    fd.append('document', file);
    return VERIFICATION_API.post('/upload', fd, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getPendingVerifications: (token) =>
    VERIFICATION_API.get('/pending', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  updateVerification: (id, status, token) =>
    VERIFICATION_API.patch(`/${id}`, { status }, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  logout: () => localStorage.removeItem('token'),
};

export default authService;
