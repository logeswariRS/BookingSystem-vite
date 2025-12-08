import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BusBookingPage.css';

const BusBookingPage = () => {
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [inputField, setInputField] = useState('');

    const navigate = useNavigate();

    const allLocations = [
        'Mumbai', 'Pune', 'Delhi', 'Agra', 'Chennai', 'Bangalore',
        'Nashik', 'Kolkata', 'Darjeeling', 'Hyderabad', 'Ahmedabad', 'Jaipur',
    ];

    const handleInputChange = (value, field) => {
        if (field === 'from') {
            setSource(value);
            setInputField('from');
        } else {
            setDestination(value);
            setInputField('to');
        }

        const matches = allLocations.filter((location) =>
            location.toLowerCase().startsWith(value.toLowerCase())
        );
        setSuggestions(matches);
    };

    const handleSuggestionClick = (location) => {
        if (inputField === 'from') {
            setSource(location);
        } else {
            setDestination(location);
        }
        setSuggestions([]);
    };

    const handleSearchClick = async () => {
        console.log('Search Clicked'); // Log to confirm the button is clicked
        try {
            if (!source || !destination || !date || !email || !username) {
                alert('Please fill all fields before searching.');
                return;
            }
    
            console.log('Sending request to backend:', { source, destination, date });
    
            const response = await axios.post('http://localhost:5000/busbookingpage', {
                source,
                destination,
                date,
            });
    
            console.log('Response from backend:', response.data);
    
            const buses = response.data.buses;
            if (buses.length > 0) {
                navigate('/bus-details', {
                    state: { buses, email, username },
                });
            } else {
                alert('No buses found for the selected route and date.');
            }
        } catch (error) {
            console.error('Error fetching buses:', error);
            alert('Failed to fetch buses. Please try again later.');
        }
    };
    

    return (
        <div className="bus-booking-container">
            <div className="page-background"></div>
            <div className="card">
                <h2>Plan Your Journey</h2>
                <div className="input-group">
                    <div className="input-fieldb">
                        <label>From Location</label>
                        <input
                            type="text"
                            value={source}
                            onChange={(e) => handleInputChange(e.target.value, 'from')}
                            placeholder="Enter starting point"
                        />
                        {inputField === 'from' && suggestions.length > 0 && (
                            <ul className="suggestions-list">
                                {suggestions.map((location, index) => (
                                    <li
                                        key={index}
                                        className="suggestion-item"
                                        onClick={() => handleSuggestionClick(location)}
                                    >
                                        {location}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="input-fieldb">
                        <label>To Location</label>
                        <input
                            type="text"
                            value={destination}
                            onChange={(e) => handleInputChange(e.target.value, 'to')}
                            placeholder="Enter destination"
                        />
                        {inputField === 'to' && suggestions.length > 0 && (
                            <ul className="suggestions-list">
                                {suggestions.map((location, index) => (
                                    <li
                                        key={index}
                                        className="suggestion-item"
                                        onClick={() => handleSuggestionClick(location)}
                                    >
                                        {location}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="input-fieldb">
                        <label>Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <div className="input-fieldb">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="input-fieldb">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <button className="search-button" onClick={handleSearchClick}>
                        <FaSearch /> Search Bus
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BusBookingPage;

