import axios from 'axios';
import emailjs from 'emailjs-com';
import { formatSeatNumbers, formatSeatNumber } from '../utils/seatUtils';

const API_BASE_URL = 'http://localhost:5000';

/**
 * Check bus availability for a given route and date
 */
export const checkAvailability = async (source, destination, date) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/busbookingpage`, {
      source,
      destination,
      date,
    }, {
      timeout: 10000, // 10 seconds timeout
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return {
      available: response.data.buses && response.data.buses.length > 0,
      buses: response.data.buses || [],
    };
  } catch (error) {
    console.error('Error checking availability:', error);
    
    // Handle timeout specifically
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return {
        available: false,
        buses: [],
        error: 'Request timed out. Backend server is not responding.',
        timeout: true,
      };
    }
    
    return {
      available: false,
      buses: [],
      error: error.message,
    };
  }
};

/**
 * Check seat availability for a specific bus
 */
export const checkSeatAvailability = async (bus, selectedSeats) => {
  try {
    if (!bus) {
      console.warn('No bus object provided for seat availability check');
      return {
        available: true, // Allow booking if bus info is missing
        warning: 'Bus information not available, proceeding with booking',
      };
    }

    if (!selectedSeats || selectedSeats.length === 0) {
      return {
        available: false,
        error: 'No seats selected',
      };
    }

    // Create a unique key for this bus route/date/time combination
    // Use bus.id if available, otherwise create a composite key
    const busKey = bus.id || `${bus.from || 'unknown'}-${bus.to || 'unknown'}-${bus.date || 'unknown'}-${bus.time || 'unknown'}`;
    
    // Get booked seats from localStorage (if any)
    const bookedSeatsKey = `bookedSeats_${busKey}`;
    let bookedSeats = [];
    
    try {
      const storedBookedSeats = localStorage.getItem(bookedSeatsKey);
      if (storedBookedSeats) {
        bookedSeats = JSON.parse(storedBookedSeats);
      }
    } catch (parseError) {
      console.warn('Error parsing booked seats from localStorage:', parseError);
      bookedSeats = [];
    }
    
    // Convert booked seats to a format we can compare
    const bookedSeatsSet = new Set(
      bookedSeats.map(seat => `${seat.row}-${seat.col}`)
    );
    
    // Check if any of the selected seats are already booked
    const conflictingSeats = selectedSeats.filter(seat => 
      bookedSeatsSet.has(`${seat.row}-${seat.col}`)
    );
    
    if (conflictingSeats.length > 0) {
      return {
        available: false,
        error: `Seats ${conflictingSeats.map(s => formatSeatNumber(s.row, s.col)).join(', ')} are already booked`,
        conflictingSeats,
      };
    }
    
    // All selected seats are available
    return {
      available: true,
      message: 'All selected seats are available',
    };
  } catch (error) {
    console.error('Error checking seat availability:', error);
    // Default to available if there's an error (to not block bookings)
    // This ensures users can still book even if there's a technical issue
    return {
      available: true,
      error: error.message,
      warning: 'Could not verify seat availability, proceeding with booking',
    };
  }
};

/**
 * Create a booking
 */
export const createBooking = async (bookingData) => {
  try {
    const formattedDate = new Date(bookingData.date).toISOString().slice(0, 19).replace('T', ' ');
    
    const response = await fetch(`${API_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: bookingData.username,
        email: bookingData.email,
        from: bookingData.from,
        to: bookingData.to,
        date: formattedDate,
        time: bookingData.time,
        price: bookingData.price,
        seats: bookingData.seats,
      }),
    });

    if (response.ok) {
      const booking = await response.json();
      return {
        success: true,
        booking,
      };
    } else {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Failed to create booking',
      };
    }
  } catch (error) {
    console.error('Error creating booking:', error);
    return {
      success: false,
      error: error.message || 'Network error occurred',
    };
  }
};

/**
 * Send booking confirmation email
 */
export const sendBookingConfirmationEmail = (bookingDetails) => {
  const seatNumbers = formatSeatNumbers(bookingDetails.seats);

  const templateParams = {
    to_email: bookingDetails.email,
    from_name: 'Bus Booking System',
    reply_to: bookingDetails.email,
    message: `🎉 Booking Confirmed!\n\n
Bus Ticket Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${bookingDetails.username}
From: ${bookingDetails.from}
To: ${bookingDetails.to}
Date: ${bookingDetails.date}
Time: ${bookingDetails.time}
Price: ₹${bookingDetails.price}
Seat Numbers: ${seatNumbers}
Booking ID: ${bookingDetails.bookingId || 'N/A'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for choosing our service!
Your booking has been confirmed successfully.`,
  };

  return emailjs
    .send('service_7ihtz9y', 'template_avgn90f', templateParams, 'gcqIsQDMHP1koEUWh')
    .then((response) => {
      console.log('Email sent successfully:', response);
      return { success: true };
    })
    .catch((error) => {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    });
};

/**
 * Send booking failure email (when seats not available)
 */
export const sendBookingFailureEmail = (bookingDetails, reason) => {
  const templateParams = {
    to_email: bookingDetails.email,
    from_name: 'Bus Booking System',
    reply_to: bookingDetails.email,
    message: `❌ Booking Unavailable\n\n
We're sorry, but your booking request could not be completed.

Booking Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${bookingDetails.username}
From: ${bookingDetails.from}
To: ${bookingDetails.to}
Date: ${bookingDetails.date}
Time: ${bookingDetails.time}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reason: ${reason}

Please try selecting a different date, time, or route.
We apologize for any inconvenience.`,
  };

  return emailjs
    .send('service_7ihtz9y', 'template_avgn90f', templateParams, 'gcqIsQDMHP1koEUWh')
    .then((response) => {
      console.log('Failure email sent successfully:', response);
      return { success: true };
    })
    .catch((error) => {
      console.error('Error sending failure email:', error);
      return { success: false, error: error.message };
    });
};

/**
 * Integrated booking flow: Check availability, book, and send email
 */
export const integratedBooking = async (bookingDetails) => {
  const {
    source,
    destination,
    date,
    email,
    username,
    selectedBus,
    selectedSeats,
  } = bookingDetails;

  // Step 1: Check bus availability
  const availabilityCheck = await checkAvailability(source, destination, date);
  
  if (!availabilityCheck.available) {
    // Send failure email
    await sendBookingFailureEmail(
      { username, email, from: source, to: destination, date, time: 'N/A' },
      'No buses available for the selected route and date'
    );
    return {
      success: false,
      message: 'No buses available for the selected route and date',
      emailSent: true,
    };
  }

  // Step 2: If bus selected, check seat availability
  if (selectedBus && selectedSeats && selectedSeats.length > 0) {
    console.log('Checking seat availability for:', { selectedBus, selectedSeats });
    const seatCheck = await checkSeatAvailability(selectedBus, selectedSeats);
    console.log('Seat availability result:', seatCheck);
    
    if (!seatCheck.available) {
      console.log('Seats not available, sending failure email');
      await sendBookingFailureEmail(
        {
          username,
          email,
          from: selectedBus.from,
          to: selectedBus.to,
          date: selectedBus.date,
          time: selectedBus.time,
        },
        seatCheck.error || 'Selected seats are not available'
      );
      return {
        success: false,
        message: seatCheck.error || 'Selected seats are not available',
        emailSent: true,
      };
    }
    
    // Log if there's a warning but seats are still available
    if (seatCheck.warning) {
      console.warn('Seat availability warning:', seatCheck.warning);
    }
  }

  // Step 3: Create booking
  if (selectedBus && selectedSeats) {
    const bookingResult = await createBooking({
      username,
      email,
      from: selectedBus.from,
      to: selectedBus.to,
      date: selectedBus.date,
      time: selectedBus.time,
      price: selectedBus.price,
      seats: selectedSeats,
    });

    if (bookingResult.success) {
      // Mark seats as booked in localStorage
      const busKey = selectedBus.id || `${selectedBus.from}-${selectedBus.to}-${selectedBus.date}-${selectedBus.time}`;
      const bookedSeatsKey = `bookedSeats_${busKey}`;
      const existingBookedSeats = JSON.parse(localStorage.getItem(bookedSeatsKey) || '[]');
      const updatedBookedSeats = [...existingBookedSeats, ...selectedSeats];
      localStorage.setItem(bookedSeatsKey, JSON.stringify(updatedBookedSeats));

      // Step 4: Send confirmation email
      const emailResult = await sendBookingConfirmationEmail({
        username,
        email,
        from: selectedBus.from,
        to: selectedBus.to,
        date: selectedBus.date,
        time: selectedBus.time,
        price: selectedBus.price,
        seats: selectedSeats,
        bookingId: bookingResult.booking?.id || `BK${Date.now()}`,
      });

      return {
        success: true,
        booking: bookingResult.booking,
        emailSent: emailResult.success,
        message: 'Booking confirmed successfully!',
      };
    } else {
      // Send failure email for booking creation error
      await sendBookingFailureEmail(
        {
          username,
          email,
          from: selectedBus.from,
          to: selectedBus.to,
          date: selectedBus.date,
          time: selectedBus.time,
        },
        bookingResult.error || 'Failed to process booking'
      );
      return {
        success: false,
        message: bookingResult.error || 'Failed to process booking',
        emailSent: true,
      };
    }
  }

  // If no bus/seat selected, return available buses
  return {
    success: true,
    available: true,
    buses: availabilityCheck.buses,
    message: 'Buses available. Please select a bus and seats.',
  };
};

