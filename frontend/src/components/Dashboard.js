import React, { useState, useEffect } from 'react';

const Dashboard = () => {
    const [donations, setDonations] = useState([]);

    // This simulates fetching data from the backend
    useEffect(() => {
        // Our temporary dummy data mimicking Member 3's MongoDB schema
        const mockDatabase = [
            { id: 1, foodName: "Canned Beans", quantity: 50, location: "North District", status: "Available" },
            { id: 2, foodName: "Rice Sacks (5kg)", quantity: 20, location: "East District", status: "Available" },
            { id: 3, foodName: "Instant Noodles", quantity: 100, location: "West District", status: "Claimed" },
            { id: 4, foodName: "Bottled Water", quantity: 200, location: "North District", status: "Available" }
        ];
        
        // Load the dummy data into our component's state
        setDonations(mockDatabase);
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>System Overview</h2>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <div style={{ border: '2px solid #4CAF50', borderRadius: '8px', padding: '15px', width: '200px' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Total Database Records</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                        {donations.length}
                    </p>
                </div>
            </div>

            <h3>Recent Postings</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2', borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: '10px' }}>Food Name</th>
                        <th style={{ padding: '10px' }}>Quantity</th>
                        <th style={{ padding: '10px' }}>Location</th>
                        <th style={{ padding: '10px' }}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {donations.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '10px' }}>{item.foodName}</td>
                            <td style={{ padding: '10px' }}>{item.quantity}</td>
                            <td style={{ padding: '10px' }}>{item.location}</td>
                            <td style={{ padding: '10px', color: item.status === 'Available' ? 'green' : 'red' }}>
                                {item.status}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Dashboard;