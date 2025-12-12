import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaBus, FaCalendarAlt, FaClock, FaTag, FaArrowLeft, FaCheckCircle, FaMapMarkerAlt } from 'react-icons/fa';
import { formatSeatNumber } from './utils/seatUtils';
import './BusSeatingPage.css';

const BusSeatingPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const selectedBus = location.state?.selectedBus;
    const email = location.state?.email;
    const username = location.state?.username;

    // Initialize seats with default layout
    const initialSeats = [
        ['available', 'boy', 'available', 'girl'],
        ['available', 'available', 'boy', 'girl'],
        ['girl', 'available', 'available', 'boy'],
        ['available', 'boy', 'girl', 'available'],
    ];

    const [seats, setSeats] = useState(initialSeats);
    const [hoveredSeat, setHoveredSeat] = useState(null);

    // Function to generate busKey (same as in bookingService)
    const getBusKey = (bus) => {
        if (!bus) return null;
        if (bus.id) return bus.id;
        
        // Normalize date format - convert to YYYY-MM-DD if needed
        let normalizedDate = bus.date || 'unknown';
        if (normalizedDate !== 'unknown') {
            try {
                const dateObj = new Date(normalizedDate);
                if (!isNaN(dateObj.getTime())) {
                    normalizedDate = dateObj.toISOString().split('T')[0];
                }
            } catch (e) {
                // Keep original format if conversion fails
            }
        }
        
        // Normalize time format - ensure consistent format
        let normalizedTime = bus.time || 'unknown';
        if (normalizedTime !== 'unknown' && normalizedTime.includes(':')) {
            const [hours, minutes] = normalizedTime.split(':');
            normalizedTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        }
        
        return `${bus.from || 'unknown'}-${bus.to || 'unknown'}-${normalizedDate}-${normalizedTime}`;
    };

    // Get current user email
    const getCurrentUserEmail = () => {
        try {
            const userToken = localStorage.getItem('userToken');
            if (userToken) {
                const user = JSON.parse(userToken);
                return user.email || null;
            }
        } catch (e) {
            // Ignore
        }
        return email || null; // Fallback to email from location state
    };

    // Load booked seats from localStorage and update seat availability
    // Excludes seats booked by current user (so they can see their own bookings)
    useEffect(() => {
        if (!selectedBus) return;

        const busKey = getBusKey(selectedBus);
        if (!busKey) return;

        const currentUserEmail = getCurrentUserEmail();

        // Get all bookings from localStorage
        let allBookings = [];
        try {
            const storedBookings = localStorage.getItem('userBookings');
            if (storedBookings) {
                allBookings = JSON.parse(storedBookings);
            }
        } catch (parseError) {
            console.warn('Error parsing bookings from localStorage:', parseError);
            allBookings = [];
        }

        // Filter bookings for this specific bus route (excluding cancelled and current user's bookings)
        const busBookings = allBookings.filter(booking => {
            const bookingBusKey = getBusKey({
                from: booking.from,
                to: booking.to,
                date: booking.date,
                time: booking.time,
            });
            return bookingBusKey === busKey && 
                   booking.status !== 'Cancelled' &&
                   booking.email !== currentUserEmail; // Exclude current user's bookings
        });

        // Create a set of booked seats from other users
        const bookedSeatsSet = new Set();
        busBookings.forEach(booking => {
            if (booking.seats && Array.isArray(booking.seats)) {
                booking.seats.forEach(seat => {
                    if (seat.row !== undefined && seat.col !== undefined) {
                        bookedSeatsSet.add(`${seat.row}-${seat.col}`);
                    }
                });
            }
        });

        // Update seats array: mark booked seats as unavailable
        // Preserve current seat selections and only update from initial state
        setSeats(currentSeats => {
            return initialSeats.map((row, rowIndex) =>
                row.map((seat, seatIndex) => {
                    // Preserve user's current selection
                    const currentSeat = currentSeats[rowIndex]?.[seatIndex];
                    if (currentSeat === 'selected') {
                        // Only keep selection if seat is not booked by others
                        if (bookedSeatsSet.has(`${rowIndex}-${seatIndex}`)) {
                            return 'booked'; // Mark as booked if it was booked by another user
                        }
                        return 'selected'; // Keep selection
                    }
                    
                    // If seat is already occupied (boy/girl), keep it as is
                    if (seat === 'boy' || seat === 'girl') {
                        return seat;
                    }
                    
                    // Check if this seat is booked by another user
                    if (bookedSeatsSet.has(`${rowIndex}-${seatIndex}`)) {
                        return 'booked'; // Mark as booked
                    }
                    
                    // Otherwise keep the original status (available)
                    return seat;
                })
            );
        });
    }, [selectedBus, email]);

    const handleSeatClick = (rowIndex, seatIndex) => {
        const currentSeat = seats[rowIndex][seatIndex];
        // Allow clicking on available or selected seats (toggle)
        // Don't allow clicking on booked, boy, or girl seats
        if (currentSeat === 'available' || currentSeat === 'selected') {
            const updatedSeats = seats.map((row, rIdx) =>
                row.map((seat, sIdx) => {
                    if (rIdx === rowIndex && sIdx === seatIndex) {
                        // Toggle between available and selected
                        return seat === 'selected' ? 'available' : 'selected';
                    }
                    return seat;
                })
            );
            setSeats(updatedSeats);
        }
    };

    if (!selectedBus) {
        return (
            <div className="error-page">
                <p>No bus selected. Please go back to the search page.</p>
                <button onClick={() => navigate('/')}>Back to Search</button>
            </div>
        );
    }

    const handleConfirmBooking = () => {
        const selectedSeats = seats.flat().map((seat, index) => {
            if (seat === 'selected') {
                const row = Math.floor(index / seats[0].length);
                const col = index % seats[0].length;
                return { row, col };
            }
            return null;
        }).filter(seat => seat !== null);

        if (selectedSeats.length === 0) {
            alert('Please select at least one seat to confirm booking.');
        } else {
            navigate("/bus-checkout", {
                state: {
                    from: selectedBus.from,
                    to: selectedBus.to,
                    date: selectedBus.date,
                    time: selectedBus.time,
                    price: selectedBus.price,
                    seats: selectedSeats,
                    email,
                    username,
                    selectedBus: selectedBus
                }
            });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dayName = days[date.getDay()];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${dayName} ${day} ${month} ${year}`;
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        return timeString;
    };

    // Map seats to column letters (A, B, C, D)
    const columnLetters = ['A', 'B', 'C', 'D'];

    return (
        <div className="bus-seating-container">
            {/* Header Section */}
            <div className="seat-plan-header">
                <div className="header-left">
                    <p className="header-subtitle">Seat plan for your journey</p>
                    <h1 className="header-title">{selectedBus.from} - {selectedBus.to}</h1>
                    <p className="header-details">
                        {selectedBus.bus_name || 'Express Bus'}, {formatTime(selectedBus.time)} {formatDate(selectedBus.date)}
                    </p>
                </div>
                <div className="header-right">
                    <p className="header-class">STANDARD CLASS</p>
                    <p className="header-aircraft">Bus Type: AC Sleeper</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="seat-map-wrapper">
                {/* Seat Map Section */}
                <div className="seat-map-section">
                    <div className="seat-map-grid">
                        {/* Row Numbers and Seats */}
                        {seats.map((row, rowIndex) => (
                            <div key={rowIndex} className="seat-row-container">
                                <span className="row-number-label">{rowIndex + 1}</span>
                                
                                <div className="seat-blocks">
                                    {/* Left Block: A, B */}
                                    <div className="seat-block">
                                        <div className="seat-row">
                                            {row.slice(0, 2).map((seat, seatIndex) => {
                                                const seatNumber = formatSeatNumber(rowIndex, seatIndex);
                                                const columnLetter = columnLetters[seatIndex];
                                                return (
                                                    <div
                                                        key={seatIndex}
                                                        className={`seat-icon ${seat} ${seat === 'available' || seat === 'selected' ? 'clickable' : ''}`}
                                                        onClick={() => (seat === 'available' || seat === 'selected') && handleSeatClick(rowIndex, seatIndex)}
                                                        onMouseEnter={() => setHoveredSeat({ row: rowIndex + 1, col: seatIndex, letter: columnLetter, status: seat })}
                                                        onMouseLeave={() => setHoveredSeat(null)}
                                                        title={seatNumber}
                                                    >
                                                        {seat === 'selected' ? seatNumber : (seat === 'available' ? seatNumber : seat === 'booked' ? 'X' : '')}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Aisle */}
                                    <div className="aisle-spacer"></div>

                                    {/* Right Block: C, D */}
                                    <div className="seat-block">
                                        <div className="seat-row">
                                            {row.slice(2, 4).map((seat, seatIndex) => {
                                                const actualIndex = seatIndex + 2;
                                                const seatNumber = formatSeatNumber(rowIndex, actualIndex);
                                                const columnLetter = columnLetters[actualIndex];
                                                return (
                                                    <div
                                                        key={actualIndex}
                                                        className={`seat-icon ${seat} ${seat === 'available' || seat === 'selected' ? 'clickable' : ''}`}
                                                        onClick={() => (seat === 'available' || seat === 'selected') && handleSeatClick(rowIndex, actualIndex)}
                                                        onMouseEnter={() => setHoveredSeat({ row: rowIndex + 1, col: actualIndex, letter: columnLetter, status: seat })}
                                                        onMouseLeave={() => setHoveredSeat(null)}
                                                        title={seatNumber}
                                                    >
                                                        {seat === 'selected' ? seatNumber : (seat === 'available' ? seatNumber : seat === 'booked' ? 'X' : '')}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <span className="row-number-label">{rowIndex + 1}</span>
                            </div>
                        ))}
                    </div>

                    {/* Column Labels */}
                    <div className="column-labels-row">
                        <div className="column-label-group">
                            <span>A</span>
                            <span>B</span>
                        </div>
                        <div className="aisle-label"></div>
                        <div className="column-label-group">
                            <span>C</span>
                            <span>D</span>
                        </div>
                    </div>

                    {/* Tooltip */}
                    {hoveredSeat && (
                        <div className="seat-tooltip">
                            {hoveredSeat.status === 'available' && `Available seat ${hoveredSeat.row}${hoveredSeat.letter}`}
                            {hoveredSeat.status === 'selected' && `Selected seat ${hoveredSeat.row}${hoveredSeat.letter}`}
                            {hoveredSeat.status === 'booked' && `Booked seat ${hoveredSeat.row}${hoveredSeat.letter}`}
                            {hoveredSeat.status === 'boy' && `Occupied seat ${hoveredSeat.row}${hoveredSeat.letter}`}
                            {hoveredSeat.status === 'girl' && `Occupied seat ${hoveredSeat.row}${hoveredSeat.letter}`}
                        </div>
                    )}
                </div>

                {/* Bus Diagram Section */}
                <div className="bus-diagram-section">
                    <div className="bus-diagram">
                        <div className="bus-body">
                            <div className="bus-seating-area">
                                {/* Visual representation of seats */}
                                {seats.map((row, rowIndex) => (
                                    <div key={rowIndex} className="diagram-row">
                                        {row.map((seat, seatIndex) => (
                                            <div
                                                key={seatIndex}
                                                className={`diagram-seat ${seat}`}
                                            ></div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <FaArrowLeft style={{ marginRight: '8px' }} />
                    Back to Bus Details
                </button>
                <button className="confirm-button" onClick={handleConfirmBooking}>
                    <FaCheckCircle style={{ marginRight: '8px' }} />
                    Confirm Booking
                </button>
            </div>
        </div>
    );
};

export default BusSeatingPage;
