import { useEffect, useState } from 'react';
import authService from '../services/authService';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [editRoles, setEditRoles] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    authService
      .getAllUsers(token)
      .then((res) => setUsers(res.data))
      .catch((err) => setMessage(err.response?.data?.message || 'Failed to load users'));
  }, [token]);

  // --- NEW: Start editing a user's roles ---
  const startEditing = (user) => {
    setEditingUserId(user._id);
    // Safely handle old string formats just in case
    const rawRole = user.role || [];
    setEditRoles(Array.isArray(rawRole) ? rawRole : [rawRole]);
  };

  // --- NEW: Toggle a checkbox in the edit menu ---
  const toggleEditRole = (roleStr) => {
    if (editRoles.includes(roleStr)) {
      setEditRoles(editRoles.filter(r => r !== roleStr)); // Remove
    } else {
      setEditRoles([...editRoles, roleStr]); // Add
    }
  };

  // --- NEW: Save the updated array to the database ---
  const saveRoles = async (userId) => {
    if (editRoles.length === 0) {
      setMessage('User must have at least one role.');
      return;
    }
    try {
      const res = await authService.updateUserRoles(userId, editRoles, token);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: res.data.role } : u))
      );
      setMessage(res.data.message);
      setEditingUserId(null); // Close edit mode
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update roles');
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
          {users.map((u) => {
            // Safely format roles for display
            const rawRole = u.role || [];
            const displayRoles = Array.isArray(rawRole) ? rawRole : [rawRole];

            return (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{displayRoles.join(', ')}</td> 
                <td>{u.verificationStatus}</td>
                <td className="actions-cell">
                  
                  {/* CONDITIONAL UI: Show checkboxes if editing, else show buttons */}
                  {editingUserId === u._id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {['Donor', 'Recipient', 'Volunteer', 'Admin'].map(r => (
                          <label key={r} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={editRoles.includes(r)} 
                              onChange={() => toggleEditRole(r)} 
                            /> {r}
                          </label>
                        ))}
                      </div>
                      <div>
                        <button className="approve-btn" onClick={() => saveRoles(u._id)}>Save</button>
                        <button className="reject-btn" style={{ marginLeft: '10px' }} onClick={() => setEditingUserId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button className="approve-btn" onClick={() => startEditing(u)}>
                        Edit Roles
                      </button>
                      <button className="reject-btn" onClick={() => handleDelete(u._id, u.name)}>
                        Delete
                      </button>
                    </>
                  )}
                  
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsers;