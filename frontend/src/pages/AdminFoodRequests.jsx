// Ahmad
import { useEffect, useState } from "react";
import requestService from "../services/requestService";
import '../styles/request.css';

function AdminFoodRequests() {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const pendingCount = requests.filter(
    request => request.status === "Pending"
    ).length;

  const approvedCount = requests.filter(
        request => request.status === "Approved"
    ).length;

  const rejectedCount = requests.filter(
        request => request.status === "Rejected"
    ).length;

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    requestService
      .getAllRequests(token)
      .then((res) => setRequests(res.data || []))
      .catch((err) =>
        setMessage(err.response?.data?.message || "Unable to load requests")
      )
      .finally(() => setLoading(false));
  }, [token]);

  const handleStatus = async (id, status) => {
    if (!token) return;

    try {
      await requestService.updateRequestStatus(id, status);

      setRequests((prev) =>
        prev.map((request) =>
          request._id === id
            ? { ...request, status }
            : request
        )
      );

      setMessage(`Request ${status.toLowerCase()} successfully`);
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
    }
  };

  if (!token) {
    return (
      <div className="page-card admin-foodrequests">
        <h2>Food Request Management</h2>
        <p>Please log in again to manage food requests.</p>
      </div>
    );
  }

  return (
    <div className="page-card admin-foodrequests">
      <h2>Food Request Management</h2>
      <div className="request-summary">
        <span><strong>Pending:</strong> {pendingCount}</span>
        <span><strong>Approved:</strong> {approvedCount}</span>
        <span><strong>Rejected:</strong> {rejectedCount}</span>
    </div>

      {loading && <p>Loading requests...</p>}

      {message && !loading && (
        <p className="message">{message}</p>
      )}

      {!loading && requests.length === 0 && (
        <p>No food requests found.</p>
      )}

      {!loading && requests.length > 0 && (
        <table className="request-table">
          <thead>
            <tr>
              <th>Food</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((item) => (
              <tr key={item._id}>
                <td>{item.foodName}</td>

                <td>{item.quantityRemaining}</td>

                <td
                  className={
                    item.status === "Pending"
                      ? "status-pending"
                      : item.status === "Approved"
                      ? "status-approved"
                      : "status-rejected"
                  }
                >
                  {item.status}
                </td>
                <td className="request-date">
                    {new Date(item.createdAt).toLocaleDateString()}
                </td>
                <td>
                  {item.status === "Pending" ? (
                    <>
                      <button
                        className="approve-btn"
                        onClick={() =>
                          handleStatus(item._id, "Approved")
                        }
                      >
                        Approve
                      </button>

                      <button
                        className="reject-btn"
                        onClick={() =>
                          handleStatus(item._id, "Rejected")
                        }
                        style={{ marginLeft: "10px" }}
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span>-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminFoodRequests;