import React from 'react';

// 1. PRESENTATIONAL COMPONENT
// This component only handles rendering the UI. It receives the 'filteredDonations' array as a prop from the parent Dashboard.
const DonationTable = ({ filteredDonations }) => {
    return (
        <div>
            <h3>Recent Postings</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                
                {/* 2. TABLE HEADER */}
                {/* Defines the column titles and applies basic gray background styling */}
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2', borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: '10px' }}>Food Name</th>
                        <th style={{ padding: '10px' }}>Quantity</th>
                        <th style={{ padding: '10px' }}>Location</th>
                        <th style={{ padding: '10px' }}>Status</th>
                    </tr>
                </thead>
                
                {/* 3. TABLE BODY & CONDITIONAL RENDERING */}
                <tbody>
                    {/* Check if there is any data to display for the selected location filter */}
                    {filteredDonations.length > 0 ? (
                        
                        // 4. DATA MAPPING
                        // Loop through the filtered array and generate a new table row for each item
                        filteredDonations.map((item) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={{ padding: '10px' }}>{item.foodName}</td>
                                <td style={{ padding: '10px' }}>{item.quantity}</td>
                                <td style={{ padding: '10px' }}>{item.location}</td>
                                
                                {/* 5. DYNAMIC STYLING */}
                                {/* Automatically change text color to green if 'Available', otherwise render as red (e.g., 'Claimed') */}
                                <td style={{ padding: '10px', color: item.status === 'Available' ? 'green' : 'red' }}>
                                    {item.status}
                                </td>
                            </tr>
                        ))
                    ) : (
                        
                        // 6. EMPTY STATE FALLBACK
                        // If the filter returns no results (length is 0), show this helpful message spanning all 4 columns
                        <tr>
                            <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#777' }}>
                                No records found for this location.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default DonationTable;