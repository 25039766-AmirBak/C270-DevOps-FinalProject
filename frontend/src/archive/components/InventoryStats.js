import React from 'react';

// 1. PRESENTATIONAL COMPONENT (METRICS)
// This component receives calculated data as props from the parent Dashboard
// to render the top-level system statistics and the visual progress bar.
const InventoryStats = ({ filteredDonations, totalAvailableItems, fillPercentage, inventoryCapacity }) => {
    return (
        // 2. MAIN CONTAINER
        // Uses Flexbox to align the metric cards side-by-side with a consistent gap
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
            
            {/* 3. TOTAL RECORDS CARD */}
            {/* Displays the raw count of items currently visible based on the location filter */}
            <div style={{ border: '2px solid #4CAF50', borderRadius: '8px', padding: '15px', width: '200px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Total Records</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                    {filteredDonations.length}
                </p>
            </div>

            {/* 4. INVENTORY AVAILABILITY CARD */}
            {/* A flexible card that expands to fill remaining space, housing the progress bar */}
            <div style={{ border: '2px solid #2196F3', borderRadius: '8px', padding: '15px', flex: 1, minWidth: '300px' }}>
                
                {/* Header section showing the title and the exact sum of available items */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                    <h3 style={{ margin: 0, color: '#333' }}>Inventory Availability</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#2196F3' }}>
                        {totalAvailableItems}
                    </p>
                </div>

                {/* 5. PROGRESS BAR CONTAINER */}
                {/* The static light grey background track for the progress bar */}
                <div style={{ position: 'relative', width: '100%', height: '20px', backgroundColor: '#e0e0e0', borderRadius: '10px', overflow: 'hidden' }}>
                    
                    {/* 6. DYNAMIC FILL BAR */}
                    {/* Uses math to adjust the width and toggles transparency to cleanly hide at 0% */}
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
                        {/* Only renders the percentage text if the bar has actual width */}
                        {fillPercentage > 0 ? `${fillPercentage}%` : ''}
                    </div>
                </div>
                
                {/* Subtitle providing context for the progress bar capacity calculation */}
                <p style={{ fontSize: '12px', color: '#777', marginTop: '5px' }}>
                    {totalAvailableItems} Units Available (vs {inventoryCapacity} Total Capacity)
                </p>
            </div>
        </div>
    );
};

export default InventoryStats;