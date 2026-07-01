import { useEffect, useState } from 'react';
import authService from '../services/authService';

function Dashboard() {
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

  return (
    <div className="page-card">
      <h2>Dashboard</h2>
      {user ? (
        <>
          <p>Welcome {user.name}</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
        </>
      ) : (
        <p>{message || 'Loading profile...'}</p>
      )}
    </div>
  );
}

export default Dashboard;
