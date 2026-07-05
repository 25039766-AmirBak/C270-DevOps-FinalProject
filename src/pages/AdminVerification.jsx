import { useEffect, useState } from 'react';
import authService from '../services/authService';

function AdminVerification() {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setMessage('Please log in again to view verification requests.');
      setLoading(false);
      return;
    }

    const fetchPendingVerifications = async () => {
      try {
        const res = await authService.getPendingVerifications(token);
        setRequests(res.data || []);
      } catch (error) {
        setMessage(error.response?.data?.message || 'Unable to load verification requests');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingVerifications();
  }, []);

  return (
    <div className="page-card admin-verification">
      <h2>Pending Verification Requests</h2>
      {loading && <p>Loading requests...</p>}
      {message && !loading && <p className="message">{message}</p>}
      {!loading && !message && requests.length === 0 && <p>No pending verifications.</p>}

      <div className="verification-list">
        {requests.map((item, index) => (
          <div key={item.email || index} className="verification-item">
            <div className="verification-main">
              <span className="verification-name">{item.name}</span>
              <span className="verification-status">{item.verificationStatus || 'Pending'}</span>
            </div>

            <div className="verification-actions">
              <a
                className="download-link"
                href={`http://localhost:5000/uploads/${encodeURIComponent(item.fasDocument || '')}`}
                target="_blank"
                rel="noreferrer"
              >
                Download document
              </a>
              <button type="button" className="approve-btn">
                Approve
              </button>
              <button type="button" className="reject-btn">
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
