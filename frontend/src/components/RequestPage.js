import React, { useState, useEffect } from 'react';
import DonationTable from './DonationTable';

const RequestPage = () => {
    const [donations, setDonations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchLiveInventory = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/donations"
                );

                if (!response.ok) {
                    throw new Error("Failed to connect to the backend server");
                }

                const liveData = await response.json();

                setDonations(liveData);
                setIsLoading(false);

            } catch (error) {
                console.error("Error:", error);
                setIsLoading(false);
            }
        };

        fetchLiveInventory();
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
            : donations.filter(
                  item => item.location === selectedLocation
              );

    if (isLoading) {
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "60vh",
                    fontFamily: "Arial, sans-serif"
                }}
            >
                <style>
                    {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    `}
                </style>

                <div
                    style={{
                        border: "4px solid #f3f3f3",
                        borderTop: "4px solid #2196F3",
                        borderRadius: "50%",
                        width: "40px",
                        height: "40px",
                        animation: "spin 1s linear infinite",
                        marginBottom: "20px"
                    }}
                />

                <h2>Loading Available Donations...</h2>

                <p>Please wait while we retrieve food donations.</p>
            </div>
        );
    }

    return (
            <div
                style={{
                    backgroundColor: "#f5f7f6",
                    minHeight: "100vh",
                }}
            >
            
            {/* Header */}
            <nav
                style={{
                    backgroundColor: "#2E7D32",
                    color: "white",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "15px 30px",
                    marginBottom: "40px"
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        fontSize: "30px",
                        fontWeight: "bold"
                    }}
                >
                    <a
                        href="/"
                        style={{
                            textDecoration: "none",
                            color: "white"
                        }}
                    >
                        SharePlate
                    </a>
                </div>

                {/* Navigation */}
                <div
                    style={{
                        display: "flex",
                        gap: "30px",
                        fontSize: "16px"
                    }}
                >
                    <a href="/" style={{ color: "white", textDecoration: "none" }}>
                        Home
                    </a>

                    <a href="/donate" style={{ color: "white", textDecoration: "none" }}>
                        Donate
                    </a>

                    <a
                        href="/request"
                        style={{
                            color: "white",
                            textDecoration: "none",
                            fontWeight: "bold",
                            borderBottom: "2px solid white"
                        }}
                    >
                        Request
                    </a>

                    <a href="/map" style={{ color: "white", textDecoration: "none" }}>
                        Map
                    </a>

                    <a href="/volunteer" style={{ color: "white", textDecoration: "none" }}>
                        Volunteer
                    </a>
                </div>

                {/* Login */}
                <div>
                    <a
                        href="/login"
                        style={{
                            color: "white",
                            textDecoration: "none",
                            fontWeight: "500"
                        }}
                    >
                        Login / Register
                    </a>
                </div>
            </nav>
            <div style={{ textAlign: "center" }}>
                <h1
                    style={{
                        color: "#2E7D32",
                        marginBottom: "10px"
                    }}
                >
                    SharePlate Food Request Portal
                </h1>

                <p
                    style={{
                        color: "#666",
                        fontSize: "17px"
                    }}
                >
                    Browse available food donations and submit a food request for your organisation.
                </p>
            </div>

            {/* Success Message */}
            {message && (
                <div
                    style={{
                        backgroundColor: "#e8f5e9",
                        color: "#155724",
                        padding: "12px",
                        borderRadius: "6px",
                        margin: "20px auto",
                        maxWidth: "700px",
                        textAlign: "center",
                        fontWeight: "bold",
                        border:"1px solid #81c784",
                        fontSize:"16px"
                    }}
                >
                    {message}
                </div>
            )}

            {/* Instructions */}
            <div
                style={{
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "15px",
                    margin: "20px auto",
                    maxWidth: "700px"
                }}
            >
                <h3>How to Request Food</h3>

                <ol>
                    <li>Select a location.</li>
                    <li>Browse the available food donations.</li>
                    <li>Click <strong>Request Food</strong>.</li>
                    <li>Your request will be submitted successfully.</li>
                </ol>
            </div>

            <hr
                style={{
                    margin: "30px 0",
                    border: "1px solid #ddd"
                }}
            />

            {/* Filter */}
            <div
                style={{
                    marginBottom: "25px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "12px"
                }}
            >
                <label
                    htmlFor="locationFilter"
                    style={{
                        marginRight: "10px",
                        fontWeight: "bold"
                    }}
                >
                    Filter by Location:
                </label>

                <select
                    id="locationFilter"
                    value={selectedLocation}
                    onChange={(e) =>
                        setSelectedLocation(e.target.value)
                    }
                    style={{
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        width: "220px",
                        fontSize: "15px"
                    }}
                >
                    {uniqueLocations.map((location) => (
                        <option
                            key={location}
                            value={location}
                        >
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
        </div>
    );
};

export default RequestPage;