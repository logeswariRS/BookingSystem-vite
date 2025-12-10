import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { BiSolidDashboard, BiUser } from 'react-icons/bi';
import { FaBookmark, FaClipboardList, FaCog, FaSignOutAlt, FaTicketAlt } from 'react-icons/fa';
import emailjs from 'emailjs-com';
import './Dashboard.css';

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('overview');
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user session
    localStorage.removeItem('userToken');
    navigate('/login');
  };

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: BiSolidDashboard },
    { id: 'aibooking', label: 'AI Booking', icon: FaClipboardList },
    { id: 'bookings', label: 'My Bookings', icon: FaBookmark },
    { id: 'tickets', label: 'Tickets', icon: FaTicketAlt },
    { id: 'profile', label: 'Profile', icon: BiUser },
    { id: 'settings', label: 'Settings', icon: FaCog },
  ];

  const renderContent = () => {
    switch(activeMenu) {
      case 'overview':
        return <DashboardOverview />;
      case 'aibooking':
        return <AIBooking />;
      case 'bookings':
        return <MyBookings />;
      case 'tickets':
        return <Tickets />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2 className="logo">
            <BiSolidDashboard size={24} /> BookingHub
          </h2>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`menu-item ${activeMenu === item.id ? 'active' : ''}`}
                onClick={() => setActiveMenu(item.id)}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button 
            className="logout-btn"
            onClick={handleLogout}
          >
            <FaSignOutAlt size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="dashboard-header">
          <button 
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FiMenu size={24} />
          </button>
          <div className="header-right">
            <div className="user-info">
              <img src="https://via.placeholder.com/40" alt="User" className="avatar" />
              <div className="user-details">
                <p className="user-name">John Doe</p>
                <p className="user-status">Premium Member</p>
              </div>
            </div>
          </div>
        </header>

        <section className="content-section">
          {renderContent()}
        </section>
      </main>
    </div>
  );
}

// Dashboard Overview Component
function DashboardOverview() {
  return (
    <div className="dashboard-overview">
      <h1>Dashboard Overview</h1>
      
      <div className="stats-grid">
        <StatCard 
          title="Active Bookings" 
          value="3" 
          icon="📅"
          color="blue"
        />
        <StatCard 
          title="Total Spent" 
          value="₹4,500" 
          icon="💰"
          color="green"
        />
        <StatCard 
          title="Miles Traveled" 
          value="1,250 km" 
          icon="🚌"
          color="purple"
        />
        <StatCard 
          title="Loyalty Points" 
          value="850" 
          icon="⭐"
          color="orange"
        />
      </div>

      <div className="dashboard-grid">
        <div className="card upcoming-trips">
          <h2>Upcoming Trips</h2>
          <div className="trip-item">
            <div className="trip-route">
              <p className="route-from">Mumbai</p>
              <div className="route-arrow">→</div>
              <p className="route-to">Delhi</p>
            </div>
            <p className="trip-date">Dec 15, 2024 • 10:00 PM</p>
            <p className="trip-status">Confirmed</p>
          </div>
          <div className="trip-item">
            <div className="trip-route">
              <p className="route-from">Delhi</p>
              <div className="route-arrow">→</div>
              <p className="route-to">Agra</p>
            </div>
            <p className="trip-date">Dec 20, 2024 • 6:00 AM</p>
            <p className="trip-status">Confirmed</p>
          </div>
          <Link to="/bookings" className="view-all-link">View All</Link>
        </div>

        <div className="card quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-btn primary">
              🎫 Book New Trip
            </button>
            <button className="action-btn secondary">
              🔔 My Alerts
            </button>
            <button className="action-btn secondary">
              💳 Payment Methods
            </button>
            <button className="action-btn secondary">
              ❓ Help & Support
            </button>
          </div>
        </div>

        <div className="card recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-item">
            <span className="activity-date">Today</span>
            <p>Booked ticket from Mumbai to Delhi</p>
          </div>
          <div className="activity-item">
            <span className="activity-date">2 days ago</span>
            <p>Completed trip to Pune</p>
          </div>
          <div className="activity-item">
            <span className="activity-date">5 days ago</span>
            <p>Added new payment method</p>
          </div>
        </div>

        <div className="card wallet-section">
          <h2>Wallet & Offers</h2>
          <div className="wallet-info">
            <p>Available Balance</p>
            <h3>₹500</h3>
            <button className="add-money-btn">Add Money</button>
          </div>
          <div className="offers-preview">
            <p className="offers-label">Active Offers</p>
            <div className="offer-tag">Get 20% off on next booking</div>
            <div className="offer-tag">Free cancellation available</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
}

// My Bookings Component
function MyBookings() {
  const bookings = [
    { id: 1, from: 'Mumbai', to: 'Delhi', date: 'Dec 15, 2024', status: 'Confirmed', seats: 'A1, A2' },
    { id: 2, from: 'Delhi', to: 'Agra', date: 'Dec 20, 2024', status: 'Confirmed', seats: 'B5' },
    { id: 3, from: 'Bangalore', to: 'Hyderabad', date: 'Nov 30, 2024', status: 'Completed', seats: 'C3' },
  ];

  return (
    <div className="my-bookings">
      <div className="section-header">
        <h1>My Bookings</h1>
        <Link to="/busbookingpage" className="new-booking-btn">+ New Booking</Link>
      </div>

      <div className="bookings-list">
        {bookings.map((booking) => (
          <div key={booking.id} className="booking-card">
            <div className="booking-left">
              <div className="booking-route">
                <p className="from">{booking.from}</p>
                <span className="arrow">→</span>
                <p className="to">{booking.to}</p>
              </div>
              <p className="booking-date">{booking.date}</p>
            </div>
            <div className="booking-middle">
              <p className="booking-seats">Seats: {booking.seats}</p>
              <span className={`booking-status ${booking.status.toLowerCase()}`}>
                {booking.status}
              </span>
            </div>
            <div className="booking-right">
              <button className="action-link">View Details</button>
              <button className="action-link">Cancel</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Tickets Component
function Tickets() {
  const tickets = [
    { id: 'TKT001', booking: 'Mumbai to Delhi', date: 'Dec 15, 2024', status: 'Active' },
    { id: 'TKT002', booking: 'Delhi to Agra', date: 'Dec 20, 2024', status: 'Upcoming' },
  ];

  return (
    <div className="tickets">
      <h1>My Tickets</h1>
      <div className="tickets-list">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="ticket-card">
            <div className="ticket-number">#{ticket.id}</div>
            <div className="ticket-info">
              <p className="ticket-booking">{ticket.booking}</p>
              <p className="ticket-date">{ticket.date}</p>
            </div>
            <span className={`ticket-status ${ticket.status.toLowerCase()}`}>
              {ticket.status}
            </span>
            <button className="download-btn">Download PDF</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Profile Component
function Profile() {
  return (
    <div className="profile">
      <h1>My Profile</h1>
      <div className="profile-card">
        <div className="profile-header">
          <img src="https://via.placeholder.com/100" alt="User" className="profile-avatar" />
          <div className="profile-info">
            <h2>John Doe</h2>
            <p>john.doe@email.com</p>
            <p>Premium Member</p>
          </div>
        </div>
        <div className="profile-form">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" defaultValue="John Doe" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" defaultValue="john.doe@email.com" />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="tel" defaultValue="+91 98765 43210" />
          </div>
          <div className="form-group">
            <label>City</label>
            <input type="text" defaultValue="Mumbai" />
          </div>
          <button className="save-btn">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// Settings Component
function Settings() {
  return (
    <div className="settings">
      <h1>Settings</h1>
      <div className="settings-section">
        <h2>Notifications</h2>
        <div className="setting-item">
          <label>Email Notifications</label>
          <input type="checkbox" defaultChecked />
        </div>
        <div className="setting-item">
          <label>SMS Alerts</label>
          <input type="checkbox" defaultChecked />
        </div>
      </div>
      <div className="settings-section">
        <h2>Privacy</h2>
        <div className="setting-item">
          <label>Profile Visibility</label>
          <select>
            <option>Private</option>
            <option>Public</option>
          </select>
        </div>
      </div>
      <div className="settings-section">
        <h2>Security</h2>
        <button className="change-password-btn">Change Password</button>
      </div>
    </div>
  );
}

// AI Booking Component
function AIBooking() {
  const [formData, setFormData] = useState({
    location: '',
    from: '',
    to: '',
    date: '',
    time: '',
    seats: '',
    email: ''
  });

  const [bookingStatus, setBookingStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableSeats, setAvailableSeats] = useState({});

  // Initialize available seats database
  React.useEffect(() => {
    const seatsDatabase = JSON.parse(localStorage.getItem('seatsDatabase') || '{}');
    if (Object.keys(seatsDatabase).length === 0) {
      // Initialize with sample data if empty
      const initialSeats = {
        'Mumbai-Delhi-2024-12-15-22:00': ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4'],
        'Delhi-Agra-2024-12-20-06:00': ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4'],
        'Bangalore-Hyderabad-2024-12-25-09:00': ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4'],
      };
      localStorage.setItem('seatsDatabase', JSON.stringify(initialSeats));
      setAvailableSeats(initialSeats);
    } else {
      setAvailableSeats(seatsDatabase);
    }
  }, []);

  // Auto-initialize seats when route/date/time is selected
  React.useEffect(() => {
    if (formData.from && formData.to && formData.date && formData.time) {
      const normalizedDate = normalizeDate(formData.date);
      const normalizedTime = normalizeTime(formData.time);
      const key = `${formData.from}-${formData.to}-${normalizedDate}-${normalizedTime}`;
      
      // Only initialize if this route doesn't have seats yet
      if (!availableSeats[key] || availableSeats[key].length === 0) {
        const allSeats = generateAllSeats();
        const updatedSeats = { ...availableSeats };
        updatedSeats[key] = allSeats;
        setAvailableSeats(updatedSeats);
        localStorage.setItem('seatsDatabase', JSON.stringify(updatedSeats));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.from, formData.to, formData.date, formData.time]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Generate all possible seat numbers (A1-A4, B1-B4, C1-C4, D1-D4)
  const generateAllSeats = () => {
    const seats = [];
    for (let row = 0; row < 4; row++) {
      const rowLetter = String.fromCharCode(65 + row); // A, B, C, D
      for (let col = 0; col < 4; col++) {
        seats.push(`${rowLetter}${col + 1}`);
      }
    }
    return seats; // Returns: ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4']
  };

  // Normalize time format (remove AM/PM and convert to 24-hour if needed)
  const normalizeTime = (time) => {
    if (!time) return '';
    // Remove AM/PM and extra spaces
    let normalized = time.replace(/\s*(AM|PM|am|pm)\s*/i, '').trim();
    // If it's in 12-hour format, convert to 24-hour
    if (time.toUpperCase().includes('PM') && !normalized.includes(':')) {
      const hour = parseInt(normalized);
      if (hour < 12) normalized = `${hour + 12}:00`;
    } else if (time.toUpperCase().includes('AM') && !normalized.includes(':')) {
      const hour = parseInt(normalized);
      if (hour === 12) normalized = '00:00';
      else normalized = `${hour}:00`;
    }
    // Ensure format is HH:MM
    if (!normalized.includes(':')) {
      normalized = `${normalized}:00`;
    }
    return normalized;
  };

  // Normalize date format
  const normalizeDate = (date) => {
    if (!date) return '';
    // If date is in MM/DD/YYYY format, convert to YYYY-MM-DD
    if (date.includes('/')) {
      const parts = date.split('/');
      if (parts.length === 3) {
        const month = parts[0].padStart(2, '0');
        const day = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${year}-${month}-${day}`;
      }
    }
    return date; // Already in YYYY-MM-DD format
  };

  const getAvailableSeatsForRoute = () => {
    if (!formData.from || !formData.to || !formData.date || !formData.time) {
      return [];
    }
    
    const normalizedDate = normalizeDate(formData.date);
    const normalizedTime = normalizeTime(formData.time);
    const key = `${formData.from}-${formData.to}-${normalizedDate}-${normalizedTime}`;
    
    // If seats don't exist for this route, initialize with all seats
    if (!availableSeats[key] || availableSeats[key].length === 0) {
      const allSeats = generateAllSeats();
      const updatedSeats = { ...availableSeats };
      updatedSeats[key] = allSeats;
      setAvailableSeats(updatedSeats);
      localStorage.setItem('seatsDatabase', JSON.stringify(updatedSeats));
      return allSeats;
    }
    
    return availableSeats[key] || [];
  };

  // Convert seat number to proper format (e.g., "1" -> "A1", "5" -> "B1")
  const normalizeSeatNumber = (seatInput) => {
    const trimmed = seatInput.trim().toUpperCase();
    // If it's already in A1 format, return as is
    if (/^[A-D]\d+$/.test(trimmed)) {
      return trimmed;
    }
    // If it's just a number, convert to seat format (1-4 = A1-A4, 5-8 = B1-B4, etc.)
    const seatNum = parseInt(trimmed);
    if (!isNaN(seatNum) && seatNum >= 1 && seatNum <= 16) {
      const row = Math.floor((seatNum - 1) / 4);
      const col = ((seatNum - 1) % 4) + 1;
      const rowLetter = String.fromCharCode(65 + row); // A, B, C, D
      return `${rowLetter}${col}`;
    }
    return trimmed; // Return as is if can't convert
  };

  const areSeatsAvailable = (seatsToBook) => {
    if (!seatsToBook) return false;
    
    const seatsArray = seatsToBook.split(',').map(s => normalizeSeatNumber(s));
    const available = getAvailableSeatsForRoute();
    
    // Check if all requested seats are available
    return seatsArray.every(seat => available.includes(seat));
  };

  const sendBookingEmail = async (bookingDetails) => {
    try {
      const templateParams = {
        to_email: bookingDetails.email,
        from_name: 'Bus Booking System',
        reply_to: bookingDetails.email,
        message: `🎉 Booking Confirmed!\n\n
Bus Ticket Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
From: ${bookingDetails.from}
To: ${bookingDetails.to}
Date: ${bookingDetails.date}
Time: ${bookingDetails.time}
Seat Numbers: ${bookingDetails.seats}
Booking ID: ${bookingDetails.id}
Status: ${bookingDetails.status}
Booked At: ${bookingDetails.bookedAt}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for choosing our service!
Your booking has been confirmed successfully.`,
      };

      const response = await emailjs.send(
        'service_7ihtz9y',
        'template_avgn90f',
        templateParams,
        'gcqIsQDMHP1koEUWh'
      );

      console.log('Email sent successfully:', response);
      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      // Don't show error to user, just log it
      return { success: false, error: error.message };
    }
  };

  const handleAutoBook = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!formData.from || !formData.to || !formData.date || !formData.time || !formData.seats || !formData.email) {
      setBookingStatus('❌ Please fill all fields');
      return;
    }

    // Check if seats are available
    if (!areSeatsAvailable(formData.seats)) {
      setBookingStatus('❌ Selected seats are not available! Please choose different seats.');
      return;
    }

    setIsLoading(true);
    setBookingStatus('🔄 Processing your booking...');

    // Process booking
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const bookingId = `BK${Date.now()}`;
        const seatsArray = formData.seats.split(',').map(s => normalizeSeatNumber(s));

        // Create booking object
        const booking = {
          id: bookingId,
          from: formData.from,
          to: formData.to,
          date: formData.date,
          time: formData.time,
          seats: seatsArray.join(', '),
          email: formData.email,
          status: 'Confirmed',
          bookedAt: new Date().toLocaleString()
        };

        // Update available seats - remove booked seats
        const normalizedDate = normalizeDate(formData.date);
        const normalizedTime = normalizeTime(formData.time);
        const key = `${formData.from}-${formData.to}-${normalizedDate}-${normalizedTime}`;
        const updatedSeatsDB = { ...availableSeats };
        
        if (!updatedSeatsDB[key]) {
          updatedSeatsDB[key] = [];
        }

        updatedSeatsDB[key] = updatedSeatsDB[key].filter(seat => !seatsArray.includes(seat));
        localStorage.setItem('seatsDatabase', JSON.stringify(updatedSeatsDB));
        setAvailableSeats(updatedSeatsDB);

        // Save booking to localStorage
        const existingBookings = JSON.parse(localStorage.getItem('aiBookings') || '[]');
        existingBookings.push(booking);
        localStorage.setItem('aiBookings', JSON.stringify(existingBookings));

        // Show success message
        setBookingStatus('✅ Booking confirmed! Email is being sent...');

        // Send email
        const emailResult = await sendBookingEmail({
          ...booking,
          email: formData.email
        });

        if (emailResult.success) {
          setBookingStatus('✅ Booking confirmed! Email sent successfully.');
        } else {
          setBookingStatus('✅ Booking confirmed! (Email sending failed, but booking is saved)');
        }

        // Reset form after 2 seconds
        setTimeout(() => {
          setFormData({
            location: '',
            from: '',
            to: '',
            date: '',
            time: '',
            seats: '',
            email: ''
          });
          if (emailResult.success) {
            setBookingStatus('📧 Confirmation email sent successfully!');
          } else {
            setBookingStatus('✅ Booking saved! (Email could not be sent)');
          }
        }, 2000);

    } catch (error) {
      setBookingStatus('❌ Error processing booking. Please try again.');
      console.error('Booking error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-booking">
      <h1>🤖 AI Smart Booking</h1>
      <p className="ai-subtitle">Let AI handle your booking instantly with location, date, time, and seat preferences</p>

      <div className="ai-booking-card">
        <form onSubmit={handleAutoBook}>
          <div className="form-grid">
            <div className="form-group">
              <label>📍 From</label>
              <input
                type="text"
                name="from"
                placeholder="e.g., Mumbai"
                value={formData.from}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>📍 To</label>
              <input
                type="text"
                name="to"
                placeholder="e.g., Delhi"
                value={formData.to}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>📅 Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>🕐 Time</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>🪑 Seat Numbers</label>
              <input
                type="text"
                name="seats"
                placeholder="e.g., A1, A2, B5"
                value={formData.seats}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              {formData.from && formData.to && formData.date && formData.time && (
                <div className="available-seats-hint">
                  <p className="hint-label">Available Seats: {getAvailableSeatsForRoute().length > 0 ? getAvailableSeatsForRoute().join(', ') : 'No seats available'}</p>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>📧 Email</label>
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="ai-book-btn"
            disabled={isLoading}
          >
            {isLoading ? '⏳ Processing...' : '🚀 Auto Book Now'}
          </button>
        </form>

        {bookingStatus && (
          <div className={`booking-status ${bookingStatus.includes('✅') ? 'success' : bookingStatus.includes('❌') ? 'error' : 'processing'}`}>
            {bookingStatus}
          </div>
        )}
      </div>

      <div className="ai-features">
        <h2>AI Booking Benefits</h2>
        <div className="benefits-grid">
          <div className="benefit-item">
            <span className="benefit-icon">⚡</span>
            <h3>Instant Booking</h3>
            <p>Complete your booking in seconds</p>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">📧</span>
            <h3>Auto Email Confirmation</h3>
            <p>Get instant confirmation via email</p>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🔍</span>
            <h3>Smart Selection</h3>
            <p>AI optimizes your seat selection</p>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">✅</span>
            <h3>Guaranteed Seats</h3>
            <p>Confirm your preferred seats instantly</p>
          </div>
        </div>
      </div>

      <div className="recent-ai-bookings">
        <h2>Your Recent AI Bookings</h2>
        <AIBookingsList />
      </div>
    </div>
  );
}

// AI Bookings List Component
function AIBookingsList() {
  const [bookings, setBookings] = useState([]);

  React.useEffect(() => {
    const storedBookings = JSON.parse(localStorage.getItem('aiBookings') || '[]');
    setBookings(storedBookings.slice(-5)); // Show last 5 bookings
  }, []);

  if (bookings.length === 0) {
    return <p className="no-bookings">No AI bookings yet. Create your first booking!</p>;
  }

  return (
    <div className="bookings-list">
      {bookings.map((booking) => (
        <div key={booking.id} className="ai-booking-item">
          <div className="booking-route">
            <p className="from">{booking.from}</p>
            <span className="arrow">→</span>
            <p className="to">{booking.to}</p>
          </div>
          <div className="booking-details">
            <p><strong>Date:</strong> {booking.date} at {booking.time}</p>
            <p><strong>Seats:</strong> {booking.seats}</p>
            <p><strong>Booked:</strong> {booking.bookedAt}</p>
          </div>
          <span className="booking-badge">{booking.status}</span>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;
