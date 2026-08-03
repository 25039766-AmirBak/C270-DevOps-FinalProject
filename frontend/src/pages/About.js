// Chevrez
import React from 'react';
import '../styles/about.css';

const About = () => {
    return (
        <div className="page-container about-page">
            <section className="about-header">
                <h1>About SharePlate</h1>
                <p>Redistributing surplus. Nourishing communities. Reducing waste.</p>
            </section>

            <section className="about-content">
                <div className="about-text-block">
                    <h2>Our Mission</h2>
                    <p>
                        Every day in Singapore, perfectly good food goes to waste while vulnerable communities face food insecurity. 
                        SharePlate was engineered by LaunchLab Team 1 to bridge this gap. We provide a seamless, real-time platform 
                        connecting restaurants with surplus food directly to the beneficiaries who need it most, powered by a dedicated 
                        network of community volunteers.
                    </p>
                </div>

                <div className="about-values">
                    <h2>Our Core Values</h2>
                    <div className="values-grid">
                        <div className="value-card">
                            <h3>Efficiency</h3>
                            <p>From our database architecture to our interactive map, we prioritize speed and minimal friction. Food logistics require rapid response times, and our platform is built to optimize every delivery route and UI interaction.</p>
                        </div>
                        <div className="value-card">
                            <h3>Forward-Thinking</h3>
                            <p>We don't just solve today's problems; we engineer scalable solutions for tomorrow. By integrating AI securely and adopting a robust tech stack, we are building digital infrastructure designed to last.</p>
                        </div>
                        <div className="value-card">
                            <h3>Work Ethic</h3>
                            <p>We believe in doing things the right way, not the easy way. From strict data security protocols to a meticulously structured Master Layout, our commitment to quality and resilience drives every line of code.</p>
                        </div>
                    </div>
                </div>

                <div className="about-methodology">
                    <h2>Our Methodology</h2>
                    <p>
                        Building SharePlate required more than just writing code; it demanded a rigorous <strong>6-Step Problem Solving Process</strong>. 
                        We identified the root causes of food waste, brainstormed architectural solutions, and implemented a secure ecosystem. 
                        While we leverage cutting-edge AI for our SharePlate Assistant, we built this platform knowing that human critical thinking 
                        must always remain the final filter for ethical and accurate technology.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default About;