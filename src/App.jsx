import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './Home';
import BusBookingPage from './BusBookingPage';
import BusDetailsPage from './BusDetailsPage';
import BusSeatingPage from './BusSeatingPage';
import BusCheckoutPage from './BusCheckoutPage';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/busbookingpage" element={<BusBookingPage />} />
          <Route path="/bus-details" element={<BusDetailsPage />} />
          <Route path="/bus-seating" element={<BusSeatingPage />} />
          <Route path="/bus-checkout" element={<BusCheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
