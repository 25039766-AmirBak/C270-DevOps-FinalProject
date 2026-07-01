import React from 'react';

const handleRequest = (item) => {
    alert(`Food request submitted for ${item.foodName}`);
};
    
// This component receives 'filteredDonations' as a prop from the parent Dashboard
const DonationTable = ({ filteredDonations }) => {
    return (
        <div>
            <h3>Recent Postings</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2', borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: '10px' }}>Food Name</th>
                        <th style={{ padding: '10px' }}>Quantity</th>
                        <th style={{ padding: '10px' }}>Location</th>
                        <th style={{ padding: '10px' }}>Status</th>
                        <th style={{ padding: '10px' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredDonations.length > 0 ? (
                        filteredDonations.map((item) => (
                            <tr key={item._id} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={{ padding: '10px' }}>{item.foodName}</td>
                                <td style={{ padding: '10px' }}>{item.quantity}</td>
                                <td style={{ padding: '10px' }}>{item.location}</td>
                                <td style={{ padding: '10px', color: item.status === 'Available' ? 'green' : 'red' }}>
                                    {item.status}
                                </td>
                                <td style={{ padding: '10px' }}>
                                    <button onClick={() => handleRequest(item)}>
                                        Request Food
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#777' }}>
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