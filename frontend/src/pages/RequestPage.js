import React, { useState, useEffect } from 'react';
import DonationTable from '../components/DonationTable';
import '../styles/request.css';

const RequestPage = () => {
    const [donations, setDonations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [requests, setRequests] = useState([]);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);

    useEffect(() => {
        const fetchLiveInventory = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/donations`);
                if (!response.ok) {
                    throw new Error("Failed to connect");
                }
                const liveData = await response.json();
                setDonations(liveData);
                setIsLoading(false);
            } catch (error) {
                console.error(error);
                setIsLoading(false);
            }
        };

        const fetchRequests = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/requests`);
                const data = await response.json();
                setRequests(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchLiveInventory();
        fetchRequests();
    }, []);

    // Get unique locations
    const uniqueLocations = [
        "All",
        ...new Set(donations.map(item => item.location))
    ];

    // Filter donations
    const filteredDonations =
        selectedLocation === "All"
            ? donations
            : donations.filter(item => item.location === selectedLocation);

    if (isLoading) {
        return (
            <div className="page-container loading-container">
                <div className="loading-spinner"></div>
                <h2>Loading Available Donations...</h2>
                <p>Please wait while we retrieve food donations.</p>
            </div>
        );
    }

    // Delete Requests
    const handleDeleteRequest = async (id) => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/requests/${id}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                throw new Error("Delete failed");
            }

            setRequests((prev) =>
                prev.filter((request) => request._id !== id)
            );

            setMessage("Request cancelled successfully.");

        } catch (error) {
            console.error(error);
            alert("Unable to cancel request.");
        }

        setShowCancelModal(false);
        setSelectedRequestId(null);
    };

    return (
        <div className="page-container request-page">
            {/* Header */} 
            <div className="request-header">
                <h1>SharePlate Food Request Portal</h1>
                <p>Browse available food donations and submit a food request for your organisation.</p>
            </div>

            {message && (
                <div className="request-success">
                    {message}
                </div>
            )}

            <div className="request-card" style={{ marginBottom: '30px' }}>
                <h3>How to Request Food</h3>
                <ol>
                    <li>Select a location.</li>
                    <li>Browse the available food donations.</li>
                    <li>Click Request Food.</li>
                    <li>Your request will be submitted successfully.</li>
                </ol>
            </div>

            {/* Filter */}
            <div className="filter-container" style={{ marginBottom: '20px' }}>
                <label htmlFor="locationFilter" style={{ marginRight: '10px', fontWeight: 'bold' }}>
                    Filter by Location:
                </label>
                <select className="filter-select"
                    id="locationFilter"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    style={{ padding: '8px', borderRadius: '4px' }}
                >
                    {uniqueLocations.map((location) => (
                        <option key={location} value={location}>
                            {location}
                        </option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <DonationTable
                filteredDonations={filteredDonations}
                setMessage={setMessage}
            />

            {/* My Requests Table */}
            <div className="request-history" style={{ marginTop: '50px' }}>
                <h2>My Food Requests</h2>
                <table className="request-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--primary-color)' }}>
                            <th style={{ padding: '10px 0' }}>Food</th>
                            <th>Quantity</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="empty-request" style={{ padding: '20px', textAlign: 'center' }}>
                                    No requests submitted yet.
                                </td>
                            </tr>
                        ) : (
                            requests.map(request => (
                                <tr key={request._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '10px 0' }}>{request.foodName}</td>
                                    <td>{request.quantityRemaining}</td>
                                    <td className={request.status === "Pending" ? "status-pending" : request.status === "Approved" ? "status-approved" : "status-rejected"}>
                                        {request.status}
                                    </td>
                                    <td className="request-date">
                                        {new Date(request.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        {request.status === 'Pending' && (
                                            <button className='delete-request-btn'
                                            onClick={()=> {setSelectedRequestId(request._id);
                                                setShowCancelModal(true);}
                                            }>
                                                Cancel
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {showCancelModal && (
                <div className="modal-overlay">
                    <div className="confirm-modal">

                        <h3>Cancel Food Request?</h3>

                        <p>
                            Are you sure you want to cancel this food request?
                        </p>

                        <div className="modal-buttons">

                            <button
                                className="modal-cancel"
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setSelectedRequestId(null);
                                }}
                            >
                                No
                            </button>

                            <button
                                className="modal-confirm"
                                onClick={() => handleDeleteRequest(selectedRequestId)}
                            >
                                Yes, Cancel Request
                            </button>

                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default RequestPage;