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
      // If backend is not available, allow booking to proceed (frontend-only mode)
      console.warn('Backend not available, proceeding with frontend-only booking');
      return {
        available: true, // Allow booking even if backend is down
        buses: [],
        warning: 'Backend server is not responding. Proceeding with frontend-only booking.',
        timeout: true,
      };
    }
    
    // If backend error, still allow booking (frontend-only mode)
    console.warn('Backend error, proceeding with frontend-only booking');
    return {
      available: true, // Allow booking even if backend has errors
      buses: [],
      warning: 'Backend error. Proceeding with frontend-only booking.',
    };
  }
};

/**
 * Generate a consistent busKey for a bus object
 */
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

/**
 * Get current logged-in user
 */
const getCurrentUser = () => {
  try {
    const userToken = localStorage.getItem('userToken');
    if (userToken) {
      return JSON.parse(userToken);
    }
    return null;
  } catch (e) {
    return null;
  }
};

/**
 * Check seat availability for a specific bus
 * Excludes seats booked by the current user (so they can see their own bookings)
 */
export const checkSeatAvailability = async (bus, selectedSeats, currentUserEmail = null) => {
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

    // Get current user if not provided
    if (!currentUserEmail) {
      const currentUser = getCurrentUser();
      currentUserEmail = currentUser?.email || null;
    }

    // Create a unique key for this bus route/date/time combination
    // Use consistent key generation
    const busKey = getBusKey(bus);
    if (!busKey) {
      return {
        available: true,
        warning: 'Could not generate bus key, proceeding with booking',
      };
    }
    
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

    // Filter bookings for this specific bus route
    const busBookings = allBookings.filter(booking => {
      const bookingBusKey = getBusKey({
        from: booking.from,
        to: booking.to,
        date: booking.date,
        time: booking.time,
      });
      return bookingBusKey === busKey && booking.status !== 'Cancelled';
    });

    // Exclude bookings by current user (so they can see their own seats)
    const otherUsersBookings = busBookings.filter(
      booking => booking.email !== currentUserEmail
    );

    // Get all booked seats from other users
    const bookedSeatsSet = new Set();
    otherUsersBookings.forEach(booking => {
      if (booking.seats && Array.isArray(booking.seats)) {
        booking.seats.forEach(seat => {
          if (seat.row !== undefined && seat.col !== undefined) {
            bookedSeatsSet.add(`${seat.row}-${seat.col}`);
          }
        });
      }
    });
    
    // Check if any of the selected seats are already booked by other users
    const conflictingSeats = selectedSeats.filter(seat => 
      bookedSeatsSet.has(`${seat.row}-${seat.col}`)
    );
    
    if (conflictingSeats.length > 0) {
      return {
        available: false,
        error: `Seats ${conflictingSeats.map(s => formatSeatNumber(s.row, s.col)).join(', ')} are already booked by another user`,
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

  // Step 1: Check bus availability (but don't block if backend is unavailable)
  const availabilityCheck = await checkAvailability(source, destination, date);
  
  // Only fail if backend explicitly says no buses AND it's not a backend error
  if (!availabilityCheck.available && !availabilityCheck.warning && !availabilityCheck.timeout) {
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
  
  // If there's a warning (backend unavailable), log it but continue
  if (availabilityCheck.warning) {
    console.warn('Availability check warning:', availabilityCheck.warning);
  }

  // Step 2: If bus selected, check seat availability
  if (selectedBus && selectedSeats && selectedSeats.length > 0) {
    console.log('Checking seat availability for:', { selectedBus, selectedSeats, email });
    
    // Pass current user email to exclude their own bookings
    const seatCheck = await checkSeatAvailability(selectedBus, selectedSeats, email);
    console.log('Seat availability result:', seatCheck);
    
    // Only block if seats are explicitly unavailable (not just a warning)
    if (!seatCheck.available && !seatCheck.warning) {
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
      console.warn('Seat availability warning (but proceeding):', seatCheck.warning);
    }
  }

  // Step 3: Create booking (try backend first, but continue with frontend if it fails)
  if (selectedBus && selectedSeats) {
    let bookingResult = await createBooking({
      username,
      email,
      from: selectedBus.from,
      to: selectedBus.to,
      date: selectedBus.date,
      time: selectedBus.time,
      price: selectedBus.price,
      seats: selectedSeats,
    });

    // If backend booking fails, proceed with frontend-only booking
    if (!bookingResult.success) {
      console.warn('Backend booking failed, proceeding with frontend-only booking:', bookingResult.error);
      // Create a mock success result for frontend-only booking
      bookingResult = {
        success: true,
        booking: null, // No backend booking ID
      };
    }

    if (bookingResult.success) {
      // Get current user info
      const currentUser = getCurrentUser();
      const userId = currentUser?.id || Date.now();
      
      // Create booking object with user info
      const bookingId = bookingResult.booking?.id || `BK${Date.now()}`;
      const bookingObject = {
        id: bookingId,
        userId: userId,
        email: email,
        username: username,
        from: selectedBus.from,
        to: selectedBus.to,
        date: selectedBus.date,
        time: selectedBus.time,
        price: selectedBus.price,
        seats: selectedSeats,
        status: 'Confirmed',
        bookedAt: new Date().toISOString(),
      };

      // Store booking in localStorage with user info
      let allBookings = [];
      try {
        const storedBookings = localStorage.getItem('userBookings');
        if (storedBookings) {
          allBookings = JSON.parse(storedBookings);
        }
      } catch (e) {
        console.warn('Error parsing bookings:', e);
      }
      
      allBookings.push(bookingObject);
      localStorage.setItem('userBookings', JSON.stringify(allBookings));

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
        bookingId: bookingId,
      });

      return {
        success: true,
        booking: bookingObject,
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

/**
 * Get all bookings for the current user
 */
export const getUserBookings = (userEmail = null) => {
  try {
    // Get current user if not provided
    if (!userEmail) {
      const currentUser = getCurrentUser();
      userEmail = currentUser?.email || null;
    }

    if (!userEmail) {
      return [];
    }

    // Get all bookings from localStorage
    let allBookings = [];
    try {
      const storedBookings = localStorage.getItem('userBookings');
      if (storedBookings) {
        allBookings = JSON.parse(storedBookings);
      }
    } catch (parseError) {
      console.warn('Error parsing bookings from localStorage:', parseError);
      return [];
    }

    // Filter bookings for current user
    return allBookings.filter(booking => booking.email === userEmail);
  } catch (error) {
    console.error('Error getting user bookings:', error);
    return [];
  }
};

/**
 * Clear all bookings and seat reservations (for testing/reset purposes)
 */
export const clearAllBookings = () => {
  try {
    // Clear all booking-related localStorage items
    localStorage.removeItem('userBookings');
    localStorage.removeItem('aiBookings');
    localStorage.removeItem('seatsDatabase');
    
    // Clear old bookedSeats format if it exists
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('bookedSeats_')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('All bookings and seat reservations cleared');
    return {
      success: true,
      message: 'All bookings and seat reservations cleared',
    };
  } catch (error) {
    console.error('Error clearing bookings:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Cancel a booking
 */
export const cancelBooking = (bookingId, userEmail = null) => {
  try {
    // Get current user if not provided
    if (!userEmail) {
      const currentUser = getCurrentUser();
      userEmail = currentUser?.email || null;
    }

    if (!userEmail) {
      return {
        success: false,
        error: 'User not logged in',
      };
    }

    // Get all bookings from localStorage
    let allBookings = [];
    try {
      const storedBookings = localStorage.getItem('userBookings');
      if (storedBookings) {
        allBookings = JSON.parse(storedBookings);
      }
    } catch (parseError) {
      console.warn('Error parsing bookings from localStorage:', parseError);
      return {
        success: false,
        error: 'Failed to load bookings',
      };
    }

    // Find the booking
    const bookingIndex = allBookings.findIndex(
      booking => booking.id === bookingId && booking.email === userEmail
    );

    if (bookingIndex === -1) {
      return {
        success: false,
        error: 'Booking not found or you do not have permission to cancel it',
      };
    }

    // Update booking status to Cancelled
    allBookings[bookingIndex].status = 'Cancelled';
    allBookings[bookingIndex].cancelledAt = new Date().toISOString();

    // Save back to localStorage
    localStorage.setItem('userBookings', JSON.stringify(allBookings));

    return {
      success: true,
      message: 'Booking cancelled successfully',
      booking: allBookings[bookingIndex],
    };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return {
      success: false,
      error: error.message || 'Failed to cancel booking',
    };
  }
};

