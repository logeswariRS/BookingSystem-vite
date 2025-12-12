import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import QRCode from "qrcode";
import { FaBus, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaTag, FaCheckCircle, FaUser, FaTicketAlt } from 'react-icons/fa';
import { integratedBooking, clearAllBookings } from './services/bookingService';
import { formatSeatNumbers } from './utils/seatUtils';
import "./BusCheckoutPage.css";

function BusCheckoutPage() {
    const location = useLocation();
    const { from, to, date, time, price, seats, email, username, selectedBus } = location.state || {};
    const qrCanvasRef = useRef(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [bookingStatus, setBookingStatus] = useState('');

    useEffect(() => {
        const generateQRCode = async () => {
            try {
                const numberOfSeats = seats ? seats.length : 0;
                const totalPrice = (price || 0) * numberOfSeats;
                await QRCode.toCanvas(
                    qrCanvasRef.current,
                    `Bus Ticket\nFrom: ${from}\nTo: ${to}\nDate: ${date}\nTime: ${time}\nSeats: ${numberOfSeats}\nPrice per Seat: ₹${price}\nTotal Price: ₹${totalPrice}\nSeat Numbers: ${formatSeatNumbers(seats)}`,
                    { width: 200 }
                );
            } catch (err) {
                console.error("Failed to generate QR code:", err);
            }
        };

        generateQRCode();
    }, [from, to, date, time, price, seats]);

    const handleConfirmBooking = async () => {
        if (!from || !to || !date || !time || !price || !seats || !email || !username) {
            alert('Missing booking information. Please go back and try again.');
            return;
        }

        // Validate that we have a selectedBus
        if (!selectedBus) {
            alert('Bus information is missing. Please go back and select a bus again.');
            return;
        }

        setIsProcessing(true);
        setBookingStatus('🔄 Processing your booking...');

        try {
            // Ensure selectedBus has all required fields
            const busData = {
                ...selectedBus,
                from: selectedBus.from || from,
                to: selectedBus.to || to,
                date: selectedBus.date || date,
                time: selectedBus.time || time,
                price: selectedBus.price || price,
            };

            const result = await integratedBooking({
                source: from,
                destination: to,
                date,
                email,
                username,
                selectedBus: busData,
                selectedSeats: seats,
            });

            if (result.success && result.booking) {
                setBookingStatus('✅ Booking confirmed! Email sent successfully.');
            } else if (result.success) {
                setBookingStatus('✅ Booking processed. Email sent.');
            } else {
                setBookingStatus(`❌ ${result.message || 'Booking failed. Email notification sent.'}`);
            }
        } catch (error) {
            console.error('Error in booking:', error);
            setBookingStatus('❌ An error occurred. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };
    
    const seatNumbers = formatSeatNumbers(seats);
    const numberOfSeats = seats ? seats.length : 0;
    const seatPrice = price || 0;
    const totalPrice = seatPrice * numberOfSeats;

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                {/* Header Section */}
                <div className="checkout-header">
                    <div className="header-icon">
                        <FaTicketAlt />
                    </div>
                    <h1 className="checkout-title">Booking Confirmation</h1>
                    <p className="checkout-subtitle">Review your booking details before confirming</p>
                </div>

                {/* Main Content */}
                <div className="checkout-content">
                    {/* Journey Details Card */}
                    <div className="journey-card">
                        <div className="card-header">
                            <FaBus className="card-icon" />
                            <h2>Journey Details</h2>
                        </div>
                        <div className="route-display">
                            <div className="route-point">
                                <FaMapMarkerAlt className="route-icon from-icon" />
                                <div className="route-info">
                                    <span className="route-label">From</span>
                                    <span className="route-city">{from}</span>
                                </div>
                            </div>
                            <div className="route-line">
                                <FaBus />
                            </div>
                            <div className="route-point">
                                <FaMapMarkerAlt className="route-icon to-icon" />
                                <div className="route-info">
                                    <span className="route-label">To</span>
                                    <span className="route-city">{to}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Information Card */}
                    <div className="info-card">
                        <div className="card-header">
                            <FaUser className="card-icon" />
                            <h2>Booking Information</h2>
                        </div>
                        <div className="info-grid">
                            <div className="info-item">
                                <FaCalendarAlt className="info-icon" />
                                <div className="info-content">
                                    <span className="info-label">Date</span>
                                    <span className="info-value">{date}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <FaClock className="info-icon" />
                                <div className="info-content">
                                    <span className="info-label">Time</span>
                                    <span className="info-value">{time}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <FaUser className="info-icon" />
                                <div className="info-content">
                                    <span className="info-label">Passenger</span>
                                    <span className="info-value">{username}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <FaTicketAlt className="info-icon" />
                                <div className="info-content">
                                    <span className="info-label">Seats</span>
                                    <span className="info-value">{seatNumbers || 'Not Selected'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Price Summary Card */}
                    <div className="price-card">
                        <div className="card-header">
                            <FaTag className="card-icon" />
                            <h2>Price Summary</h2>
                        </div>
                        <div className="price-details">
                            <div className="price-row">
                                <span className="price-label">Price per Seat</span>
                                <span className="price-value">₹{seatPrice}</span>
                            </div>
                            <div className="price-row">
                                <span className="price-label">Number of Seats</span>
                                <span className="price-value">{numberOfSeats}</span>
                            </div>
                            <div className="price-divider"></div>
                            <div className="price-row total">
                                <span className="price-label">Total Amount</span>
                                <span className="price-value">₹{totalPrice}</span>
                            </div>
                        </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="qr-card">
                        <div className="card-header">
                            <FaTicketAlt className="card-icon" />
                            <h2>Digital Ticket</h2>
                        </div>
                        <div className="qr-container">
                            <canvas id="qr-code" ref={qrCanvasRef}></canvas>
                            <p className="qr-caption">Scan QR code to access your ticket</p>
                        </div>
                    </div>
                </div>

                {/* Action Section */}
                <div className="action-section">
                    {bookingStatus && (
                        <div className={`booking-status ${bookingStatus.includes('✅') ? 'success' : bookingStatus.includes('❌') ? 'error' : 'info'}`}>
                            {bookingStatus}
                        </div>
                    )}
                    <button 
                        className="confirm-button" 
                        onClick={handleConfirmBooking}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <span className="spinner"></span>
                                Processing...
                            </>
                        ) : (
                            <>
                                <FaCheckCircle />
                                Confirm Booking & Send Email
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default BusCheckoutPage;
