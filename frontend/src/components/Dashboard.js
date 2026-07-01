import React, { useState, useEffect } from 'react';
import InventoryStats from './InventoryStats';
import DonationTable from './DonationTable';

const Dashboard = () => {
    // 1. STATE MANAGEMENT
    // Holds the raw data from the database, the user's dropdown choice, and the loading spinner status
    const [donations, setDonations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('All');
    const [isLoading, setIsLoading] = useState(true);

    // 2. LIFECYCLE & DATA FETCHING
    // Runs automatically when the dashboard first loads on the screen
    useEffect(() => {
        const fetchLiveInventory = async () => {
            try {
                // Reach out to the Node.js backend to get the latest MongoDB records
                const response = await fetch('http://localhost:5000/api/donations');
                
                if (!response.ok) {
                    throw new Error('Failed to connect to the backend server');
                }
                
                const liveData = await response.json();
                
                // Save the data to our state and turn off the loading spinner
                setDonations(liveData);
                setIsLoading(false);
                
            } catch (error) {
                console.error("Database connection error:", error);
                // Ensure the spinner stops even if the connection fails
                setIsLoading(false);
            }
        };
        
        fetchLiveInventory();
    }, []);

    // 3. DATA PROCESSING & MATH
    // Extract a unique list of districts from the data to populate the dropdown menu
    const uniqueLocations = ['All', ...new Set(donations.map(item => item.location))];

    // Create a new array containing only the items that match the selected dropdown filter
    const filteredDonations = selectedLocation === 'All'
        ? donations
        : donations.filter(item => item.location === selectedLocation);

    // Isolate only 'Available' items and calculate the sum of their quantities
    const totalAvailableItems = filteredDonations
        .filter(item => item.status === 'Available')
        .reduce((sum, item) => sum + item.quantity, 0);

    // Calculate how full the inventory is based on an arbitrary 500-unit capacity target
    const inventoryCapacity = 500; 
    const fillPercentage = totalAvailableItems > 0 
        ? Math.round((totalAvailableItems / inventoryCapacity) * 100) 
        : 0;

    // 4. CONDITIONAL RENDERING (LOADING STATE)
    // If data is still being fetched, display this CSS spinner instead of the main dashboard
    if (isLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: 'Arial, sans-serif' }}>
                <style>
                    {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
                </style>
                <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #2196F3', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', marginBottom: '20px' }}></div>
                <h2 style={{ color: '#333', margin: '0 0 10px 0' }}>Connecting to Database...</h2>
                <p style={{ color: '#777', margin: 0 }}>Retrieving live inventory metrics</p>
            </div>
        );
    }

    // 5. MAIN UI RENDERING
    // The actual dashboard interface that renders once the data is ready
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>System Overview</h2>
            
            {/* The Dropdown Filter Menu */}
            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="locationFilter" style={{ marginRight: '10px', fontWeight: 'bold' }}>Filter by Location: </label>
                <select 
                    id="locationFilter"
                    value={selectedLocation} 
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
                >
                    {uniqueLocations.map((loc, index) => (
                        <option key={index} value={loc}>{loc}</option>
                    ))}
                </select>
            </div>
            
            {/* The visually modular components we imported at the top */}
            <InventoryStats 
                filteredDonations={filteredDonations}
                totalAvailableItems={totalAvailableItems}
                fillPercentage={fillPercentage}
                inventoryCapacity={inventoryCapacity}
            />

            <DonationTable 
                filteredDonations={filteredDonations} 
            />
        </div>
    );
};

export default Dashboard;