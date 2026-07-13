import { useEffect, useState } from 'react';
import authService from '../services/authService';

function AdminVerification() {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    authService
      .getPendingVerifications(token)
      .then((res) => setRequests(res.data || []))
      .catch((err) => setMessage(err.response?.data?.message || 'Unable to load requests'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleStatus = async (id, status) => {
    if (!token) return;
    try {
      await authService.updateVerification(id, status, token);
      setRequests((prev) => prev.filter((r) => r._id !== id));
      setMessage(`User ${status.toLowerCase()} successfully`);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed');
    }
  };

  if (!token) {
    return (
      <div className="page-card admin-verification">
        <h2>Pending Verification Requests</h2>
        <p>Please log in again to view verification requests.</p>
      </div>
    );
  }

  return (
    <div className="page-card admin-verification">
      <h2>Pending Verification Requests</h2>
      {loading && <p>Loading requests...</p>}
      {message && !loading && <p className="message">{message}</p>}
      {!loading && !message && requests.length === 0 && <p>No pending verifications.</p>}

      <div className="verification-list">
        {requests.map((item) => (
          <div key={item.email} className="verification-item">
            <div className="verification-main">
              <span className="verification-name">{item.name}</span>
              <span className="verification-status">{item.verificationStatus}</span>
            </div>
            <div className="verification-actions">
              {item.document && (
                <a
                  className="download-link"
                  href={`/uploads/${encodeURIComponent(item.document)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Document
                </a>
              )}
              <button
                type="button"
                className="approve-btn"
                onClick={() => handleStatus(item._id, 'Verified')}
              >
                Approve
              </button>
              <button
                type="button"
                className="reject-btn"
                onClick={() => handleStatus(item._id, 'Rejected')}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminVerification;