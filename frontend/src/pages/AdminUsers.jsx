import { useEffect, useState } from 'react';
import authService from '../services/authService';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    authService
      .getAllUsers(token)
      .then((res) => setUsers(res.data))
      .catch((err) => setMessage(err.response?.data?.message || 'Failed to load users'));
  }, [token]);

  const handlePromote = async (userId, name) => {
    if (!window.confirm(`Promote ${name} to Admin?`)) return;
    try {
      const res = await authService.promoteUser(userId, token);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: 'Admin' } : u))
      );
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Promotion failed');
    }
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Delete user ${name}? This cannot be undone.`)) return;
    try {
      await authService.deleteUser(userId, token);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setMessage(`User ${name} deleted successfully`);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Delete failed');
    }
  };

  if (!token) {
    return (
      <div className="page-card">
        <h2>Manage Users</h2>
        <p>Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="page-card admin-verification">
      <h2>Manage Users</h2>
      {message && <p className="message">{message}</p>}
      {users.length === 0 && !message && <p>No users found.</p>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.verificationStatus}</td>
              <td className="actions-cell">
                <button
                  className="approve-btn"
                  disabled={u.role === 'Admin'}
                  onClick={() => handlePromote(u._id, u.name)}
                >
                  Promote
                </button>
                <button
                  className="reject-btn"
                  onClick={() => handleDelete(u._id, u.name)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsers;
