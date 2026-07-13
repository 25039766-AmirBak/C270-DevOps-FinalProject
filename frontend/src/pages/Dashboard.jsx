import { useEffect, useState } from 'react';
import authService from '../services/authService';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    authService
      .getProfile(token)
      .then((res) => setUser(res.data.user))
      .catch((err) => setMessage(err.response?.data?.message || 'Unable to load profile'));
  }, [token]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !token) return;
    setUploading(true);
    try {
      const res = await authService.uploadDocument(file, token);
      setMessage(res.data.message);
      setFile(null);
      const profile = await authService.getProfile(token);
      setUser(profile.data.user);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!token) {
    return (
      <div className="page-card">
        <h2>Dashboard</h2>
        <p>No token found. Please log in again.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-card">
        <h2>Dashboard</h2>
        <p>{message || 'Loading profile...'}</p>
      </div>
    );
  }

  // Check if any of the user's roles intersect with the required roles
  const needsDocuments =
    user.role.some(r => ['Recipient', 'Volunteer'].includes(r)) && user.verificationStatus === 'Not Submitted';

  return (
    <div className="page-card">
      <h2>Dashboard</h2>
      <p><strong>{user.name}</strong></p>
      <p>Email: {user.email}</p>
      <p>Role: {user.role.join(', ')}</p>
      <p>
        Verification:{' '}
        <span
          style={{
            color:
              user.verificationStatus === 'Verified'
                ? '#2f9e44'
                : user.verificationStatus === 'Rejected'
                  ? '#e03131'
                  : '#8a6f00',
          }}
        >
          {user.verificationStatus}
        </span>
      </p>

      {needsDocuments && (
        <form onSubmit={handleUpload} className="auth-form" style={{ marginTop: '1rem' }}>
          <p>Upload a supporting document to begin verification:</p>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button type="submit" className="btn btn-primary" disabled={!file || uploading}>
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      )}
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default Dashboard;