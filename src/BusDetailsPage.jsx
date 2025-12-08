import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './BusDetailsPage.css';

const BusDetailsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const buses = location.state?.buses || [];
    const email = location.state?.email || '';
    const username = location.state?.username || '';


    const handleBookNow = (bus) => {
        navigate('/bus-seating', {
            state: {
                selectedBus: bus,
                email,
                username
            }
 });
    };

    return (
        <div className="bus-details-container">
            <h2 className="page-title">Available Buses</h2>
           
            {buses.length > 0 ? (
                <div className="bus-list">
                    {buses.map((bus) => (
                        <div key={bus.id} className="bus-card">
                            <div className="bus-info">
                <h3>{bus.from} → {bus.to}</h3>
                <p><strong>Date:</strong> {bus.date}</p>
                <p><strong>Time:</strong> {bus.time}</p>
                <p><strong>Bus Name:</strong> {bus.bus_name}</p>
                <p><strong>Price:</strong> ₹{bus.price}</p>
            </div>
                            <button className="book-button" onClick={() => handleBookNow(bus)}>
                                Book Now
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="no-results">No buses found for the selected route and date.</p>
            )}
            <button className="back-button" onClick={() => navigate('/')}>
                Back to Search
            </button>
        </div>
    );
};

export default BusDetailsPage;


// if more more buses availbale means i want like if three means 2 in the top and one in bottom if 4 means 2  ,2