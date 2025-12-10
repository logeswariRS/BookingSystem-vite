import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import QRCode from "qrcode";
import { FaBus } from 'react-icons/fa';
import { integratedBooking } from './services/bookingService';
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
                await QRCode.toCanvas(
                    qrCanvasRef.current,
                    `Bus Ticket\nFrom: ${from}\nTo: ${to}\nDate: ${date}\nTime: ${time}\nPrice: ₹${price}\nSeat Numbers: ${formatSeatNumbers(seats)}`,
                    { width: 150 }
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

        setIsProcessing(true);
        setBookingStatus('🔄 Processing your booking...');

        try {
            // Use integrated booking service
            const result = await integratedBooking({
                source: from,
                destination: to,
                date,
                email,
                username,
                selectedBus: selectedBus || {
                    from,
                    to,
                    date,
                    time,
                    price,
                    id: `bus-${Date.now()}`,
                },
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


    return (
<div className="checkout-page">

    <div className="checkout-container">
    <div className="thank-you-message">
            <h1>Thank you, {username}!</h1>
        </div>
        <div className="details-card">
            <div className="top-section">
                <h2>Booking Details</h2>
            </div>
           
            <div className="bus-info">
                <span className="from">{from}</span>
                <FaBus className="bus-icon" />
                <span className="to">{to}</span>
            </div>
            <div className="details">
            <div className="details-column left">
                    <p><strong>From:</strong> {from}</p>
                    <p><strong>Date:</strong> {date}</p>
                    <p><strong>Price:</strong> ₹{price}</p>
                    
                </div>
                <div className="details-column right">
                    <p><strong>To:</strong> {to}</p>
                    <p><strong>Time:</strong> {time}</p>
                    
                    <p><strong>Seat Numbers:</strong> {seatNumbers || 'Not Selected'}</p>
                </div>
            </div>
            <div className="qr-section">
                <canvas id="qr-code" ref={qrCanvasRef}></canvas>
                <p className="qr-caption">Scan this QR code to access ticket details</p>
            </div>
        </div>
        <div className="email-section">
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
                {isProcessing ? 'Processing...' : 'Confirm Booking and Send Email'}
            </button>
        </div>
    </div>
</div>


    );
}

export default BusCheckoutPage;

