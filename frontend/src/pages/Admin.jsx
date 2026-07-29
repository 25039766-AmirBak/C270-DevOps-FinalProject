import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

function Admin() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    authService
      .getProfile(token)
      .then((res) => setUser(res.data.user))
      .catch((err) => setMessage(err.response?.data?.message || 'Unable to load profile'));
  }, [token]);

  if (!token) {
    return (
      <div className="page-card">
        <h2>Admin Panel</h2>
        <p>No token found. Please log in again.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-card">
        <h2>Admin Panel</h2>
        <p>{message || 'Loading profile...'}</p>
      </div>
    );
  }

  if (!user.role.includes('Admin')) {
    return (
      <div className="page-card">
        <h2>Admin Panel</h2>
        <p>Access Denied</p>
      </div>
    );
  }

  return (
    <div className="page-card">
      <h2>Admin Panel</h2>
      <p>Welcome, {user.name}</p>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        <Link to="/admin/users" className="download-link">
          Manage Users
        </Link>
        <Link to="/admin/verification" className="download-link">
          View pending verification requests
        </Link>
        <Link to="/admin/food-requests" className='download-link'>
          View pending food requests
        </Link>
      </nav>
    </div>
  );
}

export default Admin;