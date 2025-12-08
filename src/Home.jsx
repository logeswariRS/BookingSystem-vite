import React from 'react';
import { FaMapMarkedAlt, FaClock, FaTicketAlt } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Home.css';

const HomePage = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Get the current route

    // Function to navigate to login or signup page based on current route
    const handleStartClick = () => {
        if (location.pathname === '/login') {
            navigate('/signup'); // If on login page, go to signup
        } else if (location.pathname === '/signup') {
            navigate('/login'); // If on signup page, go to login
        } else {
            // Default to login if the user is on the home page
            navigate('/login');
        }
    };

    return (
        <div className="home-container">
            <div className="left-section">
                <div className="feature-item animate-left">
                    <FaMapMarkedAlt className="feature-icon" />
                    <h3>Easy Navigation</h3>
                    <p>Find the best routes for your journey.</p>
                </div>
                <div className="feature-item animate-left">
                    <FaClock className="feature-icon" />
                    <h3>Timely Service</h3>
                    <p>Reliable and punctual bus schedules.</p>
                </div>
                <div className="feature-item animate-left">
                    <FaTicketAlt className="feature-icon" />
                    <h3>Affordable Tickets</h3>
                    <p>Book tickets at the best prices.</p>
                </div>
            </div>

            <div className="right-section">
                <div className="bus-icon animate-right">🚌</div>
                <h1 className="main-heading animate-fade-in">We're going on a trip.</h1>
                <p className="sub-heading animate-fade-in">Plan your journey with ease.</p>

                {/* "Get Started" button */}
                <button className="start-button animate-bounce" onClick={handleStartClick}>
                    Get Started
                </button>
            </div>
        </div>
    );
};

export default HomePage;



