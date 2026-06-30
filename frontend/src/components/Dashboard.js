import React, { useState, useEffect } from 'react';
import InventoryStats from './InventoryStats';
import DonationTable from './DonationTable';

const Dashboard = () => {
    const [donations, setDonations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('All');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // =========================================================
        // --- PHASE 2: LIVE API FETCH (CURRENTLY DORMANT) ---
        // =========================================================
        // When Member 3 fixes the firewall, UNCOMMENT this entire block 
        // and DELETE the mock data block below it.
        
        /*
        const fetchLiveInventory = async () => {
            try {
                // Fetch the live JSON data from Member 3's Express backend
                const response = await fetch('http://localhost:5000/api/donations');
                
                if (!response.ok) {
                    throw new Error('Failed to connect to the backend server');
                }
                
                const liveData = await response.json();
                
                // Load the real data into the dashboard
                setDonations(liveData);
                setIsLoading(false);
                
            } catch (error) {
                console.error("Database connection error:", error);
                // If it fails, stop the loading spinner so the UI doesn't hang forever
                setIsLoading(false);
            }
        };
        
        fetchLiveInventory();
        */

        // =========================================================
        // --- PHASE 1: CURRENT MOCK DATA (DELETE LATER) ---
        // =========================================================
        setTimeout(() => {
            const mockDatabase = [
                { id: 1, foodName: "Canned Beans", quantity: 50, location: "North District", status: "Available" },
                { id: 2, foodName: "Rice Sacks (5kg)", quantity: 20, location: "East District", status: "Available" },
                { id: 3, foodName: "Instant Noodles", quantity: 100, location: "West District", status: "Claimed" },
                { id: 4, foodName: "Bottled Water", quantity: 200, location: "North District", status: "Available" }
            ];
            setDonations(mockDatabase);
            setIsLoading(false);
        }, 1500); 
    }, []);

    const uniqueLocations = ['All', ...new Set(donations.map(item => item.location))];

    const filteredDonations = selectedLocation === 'All'
        ? donations
        : donations.filter(item => item.location === selectedLocation);

    const totalAvailableItems = filteredDonations
        .filter(item => item.status === 'Available')
        .reduce((sum, item) => sum + item.quantity, 0);

    const inventoryCapacity = 500; 
    const fillPercentage = totalAvailableItems > 0 
        ? Math.round((totalAvailableItems / inventoryCapacity) * 100) 
        : 0;

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

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>System Overview</h2>
            
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
            
            {/* Our clean, imported components do all the visual work! */}
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