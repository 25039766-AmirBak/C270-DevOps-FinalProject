import React from 'react';

const InventoryStats = ({ filteredDonations, totalAvailableItems, fillPercentage, inventoryCapacity }) => {
    return (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
            <div style={{ border: '2px solid #4CAF50', borderRadius: '8px', padding: '15px', width: '200px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Total Records</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                    {filteredDonations.length}
                </p>
            </div>

            <div style={{ border: '2px solid #2196F3', borderRadius: '8px', padding: '15px', flex: 1, minWidth: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                    <h3 style={{ margin: 0, color: '#333' }}>Inventory Availability</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#2196F3' }}>
                        {totalAvailableItems}
                    </p>
                </div>

                <div style={{ position: 'relative', width: '100%', height: '20px', backgroundColor: '#e0e0e0', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ 
                        width: `${Math.min(fillPercentage, 100)}%`, 
                        height: '100%', 
                        backgroundColor: fillPercentage > 0 ? '#2196F3' : 'transparent', 
                        borderRadius: '10px', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        transition: 'width 0.3s ease, background-color 0.3s ease',
                        overflow: 'hidden' 
                    }}>
                        {fillPercentage > 0 ? `${fillPercentage}%` : ''}
                    </div>
                </div>
                <p style={{ fontSize: '12px', color: '#777', marginTop: '5px' }}>
                    {totalAvailableItems} Units Available (vs {inventoryCapacity} Total Capacity)
                </p>
            </div>
        </div>
    );
};

export default InventoryStats;