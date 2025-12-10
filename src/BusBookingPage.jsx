import React, { useState } from 'react';
import { FaSearch, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { integratedBooking } from './services/bookingService';
import { formatSeatNumber, formatSeatNumbers } from './utils/seatUtils';
import './BusBookingPage.css';

const BusBookingPage = () => {
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [inputField, setInputField] = useState('');
    const [isIntegratedBooking, setIsIntegratedBooking] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchTime, setSearchTime] = useState(0);
    const [bookingStatus, setBookingStatus] = useState('');
    const [availableBuses, setAvailableBuses] = useState([]);
    const [selectedBus, setSelectedBus] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);

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
        
        // Prevent multiple clicks
        if (isSearching) {
            console.log('Search already in progress, ignoring click');
            return;
        }
        
        let timerInterval;
        
        try {
            if (!source || !destination || !date || !email || !username) {
                alert('Please fill all fields before searching.');
                return;
            }
    
            setIsSearching(true);
            setSearchTime(0);
            setBookingStatus('🔄 Searching for buses...');
            console.log('Sending request to backend:', { source, destination, date });
            
            // Start timer to show elapsed time
            timerInterval = setInterval(() => {
                setSearchTime(prev => {
                    const newTime = prev + 1;
                    if (newTime <= 10) {
                        setBookingStatus(`🔄 Searching for buses... (${newTime}s)`);
                    }
                    return newTime;
                });
            }, 1000);
    
            // Create axios request with timeout
            const response = await axios.post('http://localhost:5000/busbookingpage', {
                source,
                destination,
                date,
            }, {
                timeout: 10000, // 10 seconds timeout
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            clearInterval(timerInterval);
            setSearchTime(0);
    
            console.log('Response from backend:', response.data);
            console.log('Response status:', response.status);
            console.log('Full response:', response);
    
            // Check if response has data
            if (!response.data) {
                console.error('No data in response');
                setBookingStatus('❌ Invalid response from server. Please try again.');
                alert('Invalid response from server. Please try again.');
                return;
            }
    
            // Handle different possible response structures
            const buses = response.data.buses || response.data || [];
            console.log('Buses found:', buses);
            console.log('Buses length:', buses.length);
            console.log('Is array?', Array.isArray(buses));
    
            if (Array.isArray(buses) && buses.length > 0) {
                if (isIntegratedBooking) {
                    // Store buses for integrated booking
                    setAvailableBuses(buses);
                    setBookingStatus('✅ Buses found! Please select a bus and seats below.');
                } else {
                    console.log('Navigating to bus-details with buses:', buses);
                    setBookingStatus('✅ Buses found! Redirecting...');
                    // Small delay to show success message
                    setTimeout(() => {
                        navigate('/bus-details', {
                            state: { buses, email, username },
                        });
                    }, 500);
                }
            } else {
                console.warn('No buses found or invalid buses array:', buses);
                setBookingStatus('❌ No buses found for the selected route and date.');
                alert('No buses found for the selected route and date.');
            }
        } catch (error) {
            if (timerInterval) {
                clearInterval(timerInterval);
            }
            setSearchTime(0);
                
                console.error('Error fetching buses:', error);
                console.error('Error details:', error.response?.data || error.message);
                console.error('Error code:', error.code);
                
                // Check for timeout
                if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                setBookingStatus('⏱️ Request timed out. Using demo data for testing...');
                
                // Use mock data for development when backend is not available
                const mockBuses = [
                    {
                        id: 1,
                        from: source,
                        to: destination,
                        date: date,
                        time: '08:00',
                        bus_name: 'Express Bus 1',
                        price: 500
                    },
                    {
                        id: 2,
                        from: source,
                        to: destination,
                        date: date,
                        time: '14:30',
                        bus_name: 'Express Bus 2',
                        price: 600
                    },
                    {
                        id: 3,
                        from: source,
                        to: destination,
                        date: date,
                        time: '20:00',
                        bus_name: 'Luxury Bus',
                        price: 800
                    }
                ];
                
                console.warn('⚠️ Backend timeout detected. Using mock data for development.');
                console.log('Mock buses:', mockBuses);
                console.log('To use real backend data, ensure the server is running on http://localhost:5000');
                
                if (isIntegratedBooking) {
                    setAvailableBuses(mockBuses);
                    setBookingStatus('✅ Demo buses loaded! (⚠️ Backend unavailable - using mock data)');
                } else {
                    setBookingStatus('✅ Demo buses found! Redirecting... (⚠️ Backend unavailable)');
                    setTimeout(() => {
                        navigate('/bus-details', {
                            state: { buses: mockBuses, email, username },
                        });
                    }, 500);
                }
                return; // Exit early to prevent showing error alert
            } else if (error.response) {
                // Server responded with error status
                setBookingStatus(`❌ Server error: ${error.response.status}`);
                alert(`Failed to fetch buses: ${error.response.status} - ${error.response.statusText}`);
            } else if (error.request) {
                // Request was made but no response received
                setBookingStatus('❌ No response from server');
                alert('No response from server. Please check:\n\n1. Is the backend server running on http://localhost:5000?\n2. Check the backend server logs\n3. Verify the server is accessible');
            } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
                setBookingStatus('❌ Network error. Cannot reach server.');
                alert('Network error. Cannot reach the backend server.\n\nPlease check:\n1. Backend server is running\n2. No firewall blocking the connection\n3. Correct URL: http://localhost:5000');
            } else {
                // Something else happened
                setBookingStatus(`❌ Error: ${error.message}`);
                alert(`Failed to fetch buses: ${error.message}`);
            }
        } finally {
            if (timerInterval) {
                clearInterval(timerInterval);
            }
            setIsSearching(false);
        }
    };

    const handleIntegratedBooking = async () => {
        if (!source || !destination || !date || !email || !username) {
            alert('Please fill all basic fields before booking.');
            return;
        }

        if (!selectedBus) {
            alert('Please search for buses first and select a bus.');
            return;
        }

        if (selectedSeats.length === 0) {
            alert('Please select at least one seat.');
            return;
        }

        setIsProcessing(true);
        setBookingStatus('🔄 Processing your booking...');

        try {
            const result = await integratedBooking({
                source,
                destination,
                date,
                email,
                username,
                selectedBus,
                selectedSeats,
            });

            if (result.success && result.booking) {
                setBookingStatus('✅ Booking confirmed! Email sent successfully.');
                // Reset form after 3 seconds
                setTimeout(() => {
                    setSource('');
                    setDestination('');
                    setDate('');
                    setEmail('');
                    setUsername('');
                    setSelectedBus(null);
                    setSelectedSeats([]);
                    setAvailableBuses([]);
                    setBookingStatus('');
                    setIsIntegratedBooking(false);
                }, 3000);
            } else if (result.success && result.available) {
                setBookingStatus('✅ Buses available! Please select a bus and seats.');
            } else {
                setBookingStatus(`❌ ${result.message || 'Booking failed. Email notification sent.'}`);
            }
        } catch (error) {
            console.error('Error in integrated booking:', error);
            setBookingStatus('❌ An error occurred. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSeatSelection = (row, col) => {
        const seat = { row, col };
        const isSelected = selectedSeats.some(
            s => s.row === row && s.col === col
        );

        if (isSelected) {
            setSelectedSeats(selectedSeats.filter(
                s => !(s.row === row && s.col === col)
            ));
        } else {
            setSelectedSeats([...selectedSeats, seat]);
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

                    <div className="booking-options">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={isIntegratedBooking}
                                onChange={(e) => setIsIntegratedBooking(e.target.checked)}
                            />
                            <span>Enable Integrated Booking (Auto-book & Email)</span>
                        </label>
                    </div>

                    <button 
                        className="search-button" 
                        onClick={handleSearchClick}
                        disabled={isSearching}
                    >
                        {isSearching ? (
                            <>
                                <FaSpinner className="spinner" /> Searching...
                            </>
                        ) : (
                            <>
                                <FaSearch /> Search Bus
                            </>
                        )}
                    </button>

                    {bookingStatus && (
                        <div className={`booking-status ${bookingStatus.includes('✅') ? 'success' : bookingStatus.includes('❌') ? 'error' : 'info'}`}>
                            {bookingStatus}
                        </div>
                    )}

                    {isIntegratedBooking && availableBuses.length > 0 && (
                        <div className="integrated-booking-section">
                            <h3>Select Bus & Seats</h3>
                            
                            <div className="buses-list">
                                {availableBuses.map((bus) => (
                                    <div
                                        key={bus.id}
                                        className={`bus-option ${selectedBus?.id === bus.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedBus(bus)}
                                    >
                                        <div>
                                            <strong>{bus.from} → {bus.to}</strong>
                                            <p>Time: {bus.time} | Price: ₹{bus.price}</p>
                                        </div>
                                        {selectedBus?.id === bus.id && <FaCheckCircle />}
                                    </div>
                                ))}
                            </div>

                            {selectedBus && (
                                <div className="seat-selection">
                                    <h4>Select Seats</h4>
                                    <div className="seating-grid">
                                        {Array.from({ length: 4 }, (_, row) =>
                                            Array.from({ length: 4 }, (_, col) => {
                                                const isSelected = selectedSeats.some(
                                                    s => s.row === row && s.col === col
                                                );
                                                return (
                                                    <div
                                                        key={`${row}-${col}`}
                                                        className={`seat-mini ${isSelected ? 'selected' : 'available'}`}
                                                        onClick={() => handleSeatSelection(row, col)}
                                                    >
                                                        {formatSeatNumber(row, col)}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                    <p className="selected-seats-info">
                                        Selected: {selectedSeats.length} seat(s) - {formatSeatNumbers(selectedSeats)}
                                    </p>
                                </div>
                            )}

                            <button
                                className="integrated-book-button"
                                onClick={handleIntegratedBooking}
                                disabled={isProcessing || !selectedBus || selectedSeats.length === 0}
                            >
                                {isProcessing ? (
                                    <>
                                        <FaSpinner className="spinner" /> Processing...
                                    </>
                                ) : (
                                    <>
                                        <FaCheckCircle /> Book Now & Send Email
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BusBookingPage;

