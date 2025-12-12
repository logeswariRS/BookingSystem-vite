# Clear All Bookings - Instructions

To clear all bookings and seat reservations, you can use one of these methods:

## Method 1: Browser Console (Recommended)

Open your browser's Developer Console (F12) and run:

```javascript
// Clear all bookings
localStorage.removeItem('userBookings');
localStorage.removeItem('aiBookings');
localStorage.removeItem('seatsDatabase');

// Clear old bookedSeats format
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('bookedSeats_')) {
    localStorage.removeItem(key);
  }
});

console.log('✅ All bookings and seat reservations cleared!');
```

## Method 2: Using the clearAllBookings function

In the browser console, you can also import and use the function:

```javascript
// First, make sure you're on a page that has the bookingService imported
// Then in console:
import { clearAllBookings } from './services/bookingService';
clearAllBookings();
```

## Method 3: Clear Everything (Nuclear Option)

To clear ALL localStorage (including user login, etc.):

```javascript
localStorage.clear();
console.log('✅ All localStorage cleared!');
```

**Note:** This will also clear your login session, so you'll need to log in again.

