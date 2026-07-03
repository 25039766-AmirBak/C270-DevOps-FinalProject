import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    // 1. Repurposing your InventoryStats logic for a "Live Impact" banner
    const [impactStats, setImpactStats] = useState({
        mealsRescued: 0,
        activeVolunteers: 0,
        pendingRequests: 0
    });

    useEffect(() => {
        // This is where you transplant the fetch() logic from your old Dashboard
        // For now, we are simulating the live data load to ensure UI stability
        const fetchLiveStats = async () => {
            try {
                // Uncomment and update when the backend endpoints are finalized
                // const response = await fetch('http://localhost:5000/api/stats');
                // const data = await response.json();
                
                // Simulated live metrics delay
                setTimeout(() => {
                    setImpactStats({
                        mealsRescued: 12450,
                        activeVolunteers: 42,
                        pendingRequests: 18
                    });
                }, 800);
            } catch (error) {
                console.error("Failed to fetch impact stats:", error);
            }
        };

        fetchLiveStats();
    }, []);

    return (
        <div className="homepage-container">
            
            {/* 2. Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Bridging the Gap Between Surplus and Scarcity</h1>
                    <p className="hero-subtitle">
                        Join SharePlate to safely offload surplus food, request immediate assistance, 
                        or volunteer to deliver meals to those in need across Singapore.
                    </p>
                    <div className="hero-actions">
                        <Link to="/donate" className="btn btn-primary">Donate Surplus</Link>
                        <Link to="/request" className="btn btn-secondary">Request Food</Link>
                    </div>
                </div>
            </section>

            {/* 3. Live Impact Banner (Transplanted from your Analytics Dashboard) */}
            <section className="impact-banner">
                <div className="impact-card">
                    <h3>Meals Rescued</h3>
                    <p className="impact-number">
                        {impactStats.mealsRescued > 0 ? impactStats.mealsRescued.toLocaleString() : '...'}
                    </p>
                </div>
                <div className="impact-card">
                    <h3>Active Volunteers</h3>
                    <p className="impact-number">
                        {impactStats.activeVolunteers > 0 ? impactStats.activeVolunteers : '...'}
                    </p>
                </div>
                <div className="impact-card">
                    <h3>Pending Requests</h3>
                    <p className="impact-number">
                        {impactStats.pendingRequests > 0 ? impactStats.pendingRequests : '...'}
                    </p>
                </div>
            </section>
            
            {/* 4. Educational Grid */}
            <section className="how-it-works">
                <h2>How SharePlate Works</h2>
                <div className="steps-grid">
                    <div className="step-card">
                        <div className="step-number">1</div>
                        <h3>Post</h3>
                        <p>F&B businesses securely log surplus inventory and expiry details.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">2</div>
                        <h3>Match</h3>
                        <p>Verified beneficiaries view and claim the available postings.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">3</div>
                        <h3>Deliver</h3>
                        <p>Community volunteers pick up and route the food safely via our map.</p>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;