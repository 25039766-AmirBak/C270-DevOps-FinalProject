import React, { useState, useEffect } from 'react';
import DonationTable from './DonationTable';
import '../requestsystem.css';

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
            <div className="loading-container">
            <div className="loading-spinner"></div>

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
            {/*Navbar*/}
            <nav className="global-navbar">
                <div className="logo">
                    <a href="/">SharePlate</a>
                </div>

                <div className="nav-links">
                    <a href="/">Home</a>
                    <a href="/about">About Us</a>
                    <a href="/map">Map</a>
                </div>

                <div className="auth-links">
                    <a href="/login">Login / Register</a>
                </div>
            </nav>

            {/* Header */} 
            <div className="request-page-container">

                <div className="request-header">
                    <h1>SharePlate Food Request Portal</h1>
                    <p>
                        Browse available food donations and submit a food request for your organisation.
                    </p>
                </div>

                {message && (
                    <div className="request-success">
                        {message}
                    </div>
                )}

                <div className="request-card">
                    <h3>How to Request Food</h3>
                    <ol>
                        <li>Select a location.</li>
                        <li>Browse the available food donations.</li>
                        <li>Click Request Food.</li>
                        <li>Your request will be submitted successfully.</li>
                    </ol>
                </div>

            </div>

            {/* Filter */}
            <div className="filter-container">

            <label htmlFor="locationFilter">
                Filter by Location
            </label>

                <select className="filter-select"
                    id="locationFilter"
                    value={selectedLocation}
                    onChange={(e) =>
                        setSelectedLocation(e.target.value)
                    }
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
            {/* My Requests Table */}
            <div className="request-history">
                <h2>My Food Requests</h2>
                <table className="request-table">
                    <thead>
                        <tr>
                            <th>Food</th>
                            <th>Quantity</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>

                    </thead>

                    <tbody>

                        {requests.length === 0 ? (

                            <tr>

                                <td colSpan="4" className="empty-request">
                                    No requests submitted yet.
                                </td>

                            </tr>

                        ) : (

                            requests.map(request => (

                                <tr key={request._id}>

                                    <td>
                                        {request.foodName}
                                    </td>

                                    <td>
                                        {request.quantityRemaining}
                                    </td>

                                    <td
                                        className={
                                            request.status === "Pending"
                                                ? "status-pending"
                                                : "status-approved"
                                        }
                                    >
                                        {request.status}
                                    </td>

                                    <td className="request-date">
                                        {new Date(request.createdAt).toLocaleDateString()}
                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>
            {/* Floating Chat Button */}
            <div className="chatbot-wrapper">
            <button
                className="chatbot-toggle-btn"
                onClick={() => setChatOpen(!chatOpen)}
            >
                💬 Ask AI
            </button>
            
            {chatOpen && (

            <div className="chatbot-window">

                <div className="chatbot-header">
                    <h4>SharePlate AI</h4>

                    <button
                        className="close-btn"
                        onClick={() => setChatOpen(false)}
                    >
                        ✖
                    </button>
                </div>
                <div className="chatbot-messages">

                    {chatMessages.map((msg, index) => (

                        <div
                            key={index}
                            className={
                                msg.sender === "AI"
                                    ? "message-bubble ai"
                                    : "message-bubble user"
                            }
                        >
                            {msg.text}
                        </div>

                    ))}

                </div>

                <div className="chatbot-input-area">

                    <input
                        value={chatInput}
                        onChange={(e)=>setChatInput(e.target.value)}
                        onKeyDown={(e)=>{
                            if(e.key==="Enter"){
                                sendMessage();
                            }
                        }}
                        placeholder="Ask SharePlate AI..."
                    />

                    <button
                        className="send-btn"
                        onClick={sendMessage}
                    >
                        Send
                    </button>

                </div>

                <div className="chatbot-disclaimer">
                    AI responses may be inaccurate. Verify important information.
                </div>

            </div>

            )}
        </div>

    </div>
    );
};

export default RequestPage;