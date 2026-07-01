import { useEffect, useState } from 'react';
import authService from '../services/authService';

function Admin() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setMessage('No token found. Please log in again.');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await authService.getProfile(token);
        setUser(res.data);
      } catch (error) {
        setMessage(error.response?.data?.message || 'Unable to load profile');
      }
    };

    fetchProfile();
  }, []);

  if (!user) {
    return (
      <div className="page-card">
        <h2>Admin Page</h2>
        <p>{message || 'Loading profile...'}</p>
      </div>
    );
  }

  return (
    <div className="page-card">
      <h2>Admin Page</h2>
      {user.role === 'admin' ? (
        <>
          <p>Welcome, admin {user.name}</p>
          <ul>
            <li>Promote User</li>
            <li>Delete User</li>
            <li>View Users</li>
          </ul>
        </>
      ) : (
        <p>Access Denied</p>
      )}
    </div>
  );
}

export default Admin;
