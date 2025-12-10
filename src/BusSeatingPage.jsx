import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './BusSeatingPage.css';

const BusSeatingPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const selectedBus = location.state?.selectedBus;
    const email = location.state?.email;
    const username = location.state?.username;

    const [seats, setSeats] = useState([
        ['available', 'boy', 'available', 'girl'],
        ['available', 'available', 'boy', 'girl'],
        ['girl', 'available', 'available', 'boy'],
        ['available', 'boy', 'girl', 'available'],
    ]);

    const handleSeatClick = (rowIndex, seatIndex) => {
        if (seats[rowIndex][seatIndex] === 'available') {
            const updatedSeats = seats.map((row, rIdx) =>
                row.map((seat, sIdx) =>
                    rIdx === rowIndex && sIdx === seatIndex ? 'selected' : seat
                )
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
            const selectedSeats = seats.flat().map((seat, index) => {
                if (seat === 'selected') {
                    const row = Math.floor(index / seats[0].length);
                    const col = index % seats[0].length;
                    return { row, col };
                }
                return null;
            }).filter(seat => seat !== null);
            
            // Pass the selectedSeats to backend
            navigate("/bus-checkout", {
                state: {
                    from: selectedBus.from,
                    to: selectedBus.to,
                    date: selectedBus.date,
                    time: selectedBus.time,
                    price: selectedBus.price,
                    seats: selectedSeats,  // Pass the selected seats
                    email,
                    username,
                    selectedBus: selectedBus  // Pass the full bus object for integrated booking
                }
            });
            
            
        }
    };

    return (
        <div className="bus-seating-container">
            <h2 className="page-title">Select Your Seats</h2>
            <div className="bus-details">
                <h3>{selectedBus.from} → {selectedBus.to}</h3>
                <p><strong>Date:</strong> {selectedBus.date}</p>
                <p><strong>Time:</strong> {selectedBus.time}</p>
                <p><strong>Price:</strong> ₹{selectedBus.price}</p>
            </div>

            {/* Seating Layout */}
            <div className="seating-layout">
                {seats.map((row, rowIndex) => (
                    <div key={rowIndex} className="seat-row">
                        {row.map((seat, seatIndex) => (
                            <div
                                key={seatIndex}
                                className={`seat ${seat === 'available' ? '' : 'disabled'} ${seat}`}
                                onClick={() => seat === 'available' && handleSeatClick(rowIndex, seatIndex)}
                            ></div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Seat Legend */}
            <div className="seat-legend">
                <div className="legend-item">
                    <div className="seat available"></div>
                    <span>Available</span>
                </div>
                <div className="legend-item">
                    <div className="seat boy"></div>
                    <span>Booked by Boy</span>
                </div>
                <div className="legend-item">
                    <div className="seat girl"></div>
                    <span>Booked by Girl</span>
                </div>
                <div className="legend-item">
                    <div className="seat selected"></div>
                    <span>Selected</span>
                </div>
            </div>

            {/* Buttons */}
            <button className="confirm-button" onClick={handleConfirmBooking}>
                Confirm Booking
            </button>
            <button className="back-button" onClick={() => navigate(-1)}>
                Back to Bus Details
            </button>
        </div>
    );
};

export default BusSeatingPage;

