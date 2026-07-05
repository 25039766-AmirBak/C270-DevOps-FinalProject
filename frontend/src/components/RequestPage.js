import React, { useState, useEffect } from 'react';
import DonationTable from './DonationTable';

const RequestPage = () => {
    const [donations, setDonations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [requests, setRequests] = useState([]);

    useEffect(() => {

        const fetchLiveInventory = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/donations"
                );

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

                const response = await fetch(
                    "http://localhost:5000/api/requests"
                );

                const data = await response.json();

                setRequests(data);

            } catch (error) {
                console.error(error);
            }
        };

        fetchLiveInventory();
        fetchRequests();

        }, []);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const [chatMessages, setChatMessages] = useState([
        {
            sender: "AI",
            text: "Hi! I'm the SharePlate Assistant. Ask me anything about requesting food, donations or volunteering."
        }
    ]);

    const sendMessage = async () => {

    if (!chatInput.trim()) return;

        const userMessage = chatInput;

    // Display user's message
    setChatMessages(prev => [
        ...prev,
        {
            sender: "You",
            text: userMessage
        }
    ]);

    setChatInput("");

    try {

        const response = await fetch(
            "http://localhost:5000/api/chat",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: userMessage
                })
            }
        );

        const data = await response.json();

        setChatMessages(prev => [
            ...prev,
            {
                sender: "AI",
                text: data.reply
            }
        ]);

    } catch (error) {

        setChatMessages(prev => [
            ...prev,
            {
                sender: "AI",
                text: "Sorry, I'm currently offline."
            }
        ]);

    }

    };
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

                    <a href="/about" style={{ color: "white", textDecoration: "none" }}>
                        About Us
                    </a>

                    <a href="/map" style={{ color: "white", textDecoration: "none" }}>
                        Map
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
            <div
                style={{
                    marginTop: "50px",
                    background: "white",
                    padding: "20px",
                    borderRadius: "10px",
                    boxShadow: "0 2px 10px rgba(0,0,0,.1)"
                }}
            >

                <h2
                    style={{
                        color: "#2E7D32",
                        marginBottom: "20px"
                    }}
                >
                    My Food Requests
                </h2>

                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse"
                    }}
                >

                    <thead>

                        <tr
                            style={{
                                background: "#2E7D32",
                                color: "white"
                            }}
                        >
                            <th style={{padding:"12px"}}>Food</th>
                            <th style={{padding:"12px"}}>Quantity</th>
                            <th style={{padding:"12px"}}>Status</th>
                            <th style={{padding:"12px"}}>Date</th>
                        </tr>

                    </thead>

                    <tbody>

                        {requests.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="4"
                                    style={{
                                        textAlign:"center",
                                        padding:"20px"
                                    }}
                                >
                                    No requests submitted yet.
                                </td>

                            </tr>

                        ) : (

                            requests.map(request => (

                                <tr
                                    key={request._id}
                                    style={{
                                        borderBottom:"1px solid #ddd"
                                    }}
                                >

                                    <td style={{padding:"12px"}}>
                                        {request.foodName}
                                    </td>

                                    <td style={{padding:"12px"}}>
                                        {request.quantityRemaining}
                                    </td>

                                    <td
                                        style={{
                                            padding:"12px",
                                            color:
                                                request.status==="Pending"
                                                    ? "orange"
                                                    : "green"
                                        }}
                                    >
                                        {request.status}
                                    </td>

                                    <td style={{padding:"12px"}}>
                                        {new Date(request.createdAt).toLocaleDateString()}
                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>
            {/* Floating Chat Button */}

            <button
                onClick={() => setChatOpen(!chatOpen)}
                style={{
                    position: "fixed",
                    bottom: "20px",
                    right: "20px",
                    width: "80px",
                    height: "70px",
                    borderRadius: "50%",
                    border: "none",
                    backgroundColor: "#2E7D32",
                    color: "white",
                    fontSize: "16px",
                    cursor: "pointer",
                    boxShadow: "0 5px 12px rgba(0,0,0,.3)"
                }}
            >
                💬Ask AI
            </button>
            {chatOpen && (

            <div
                style={{
                    position: "fixed",
                    bottom: "100px",
                    right: "20px",
                    width: "350px",
                    height: "500px",
                    background: "white",
                    borderRadius: "12px",
                    boxShadow: "0 10px 30px rgba(0,0,0,.25)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden"
                }}
            >

                <div
                    style={{
                        background: "#2E7D32",
                        color: "white",
                        padding: "15px",
                        fontWeight: "bold"
                    }}
                >
                    SharePlate AI
                </div>

                <div
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: "15px",
                        background: "#fafafa"
                    }}
                >

                    {chatMessages.map((msg, index) => (

                        <div
                            key={index}
                            style={{
                                marginBottom: "12px"
                            }}
                        >

                            <strong>{msg.sender}</strong>

                            <div>
                                {msg.text}
                            </div>

                        </div>

                    ))}

                </div>

                <div
                    style={{
                        display: "flex",
                        borderTop: "1px solid #ddd"
                    }}
                >

                    <input

                        value={chatInput}

                        onChange={(e) =>
                            setChatInput(e.target.value)
                        }

                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                sendMessage();
                            }
                        }}

                        placeholder="Ask SharePlate AI..."

                        style={{
                            flex: 1,
                            border: "none",
                            padding: "12px",
                            outline: "none"
                        }}
                    />

                    <button

                        onClick={sendMessage}

                        style={{
                            background: "#2E7D32",
                            color: "white",
                            border: "none",
                            padding: "0 20px",
                            cursor: "pointer"
                        }}
                    >
                        Send
                    </button>

                </div>

            </div>

            )}
        </div>
    );
};

export default RequestPage;