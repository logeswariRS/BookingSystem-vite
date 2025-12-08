import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import QRCode from "qrcode";
import { FaBus } from 'react-icons/fa';
import emailjs from 'emailjs-com';
import "./BusCheckoutPage.css";

function BusCheckoutPage() {
    const location = useLocation();
    const { from, to, date, time, price, seats, email, username } = location.state;
    const qrCanvasRef = useRef(null);

    const sendEmail = (recipientEmail) => {
        const templateParams = {
            to_email: recipientEmail,
            from_name: 'Logeswari Ravi',
            reply_to: recipientEmail,
            message: `Bus Ticket Details:\n
                      Name: ${username}\n
                      From: ${from}\n
                      To: ${to}\n
                      Date: ${date}\n
                      Time: ${time}\n
                      Price: ₹${price}\n
                      Seat Numbers: ${seats.map(seat => `Row: ${seat.row + 1}, Col: ${seat.col + 1}`).join(", ")}`,
        };
    
        emailjs.send('service_7ihtz9y', 'template_avgn90f', templateParams, 'gcqIsQDMHP1koEUWh')
            .then((response) => {
                console.log('Email sent successfully:', response);
            })
            .catch((error) => {
                console.error('Error sending email:', error);
                alert('Failed to send email. Please try again later.');
            });
    };

    useEffect(() => {
        const generateQRCode = async () => {
            try {
                await QRCode.toCanvas(
                    qrCanvasRef.current,
                    `Bus Ticket\nFrom: ${from}\nTo: ${to}\nDate: ${date}\nTime: ${time}\nPrice: ₹${price}\nSeat Numbers: ${seats.map(seat => `Row: ${seat.row + 1}, Col: ${seat.col + 1}`).join(", ")}`,
                    { width: 150 }
                );
            } catch (err) {
                console.error("Failed to generate QR code:", err);
            }
        };

        generateQRCode();
    }, [from, to, date, time, price, seats]);

    const handleConfirmBooking = async () => {
        const formattedDate = new Date(date).toISOString().slice(0, 19).replace('T', ' ');
    
      
        try {
            const response = await fetch('http://localhost:5000/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: username,   
                    email,           
                    from,             
                    to,               
                    date: formattedDate,  
                    time,             
                    price,            
                    seats,        
                }),
            });
    
            if (response.ok) {
                console.log('Booking saved successfully to the database');
            } else {
                console.error('Failed to save booking to the database');
            }
        } catch (error) {
            console.error('Error while saving booking to the database:', error);
        }
    
       
        sendEmail(email); 
    };
    
 
    const seatNumbers = seats.map((seat, index) => {
        return `Row: ${seat.row + 1}, Col: ${seat.col + 1}`;
    }).join(", ");


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
            <button className="confirm-button" onClick={handleConfirmBooking}>
                Confirm Booking and Send Email
            </button>
        </div>
    </div>
</div>


    );
}

export default BusCheckoutPage;

