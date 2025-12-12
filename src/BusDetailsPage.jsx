import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaBus, FaCalendarAlt, FaClock, FaTag, FaArrowLeft, FaMapMarkerAlt, FaFilter, FaSort } from 'react-icons/fa';
import './BusDetailsPage.css';

const BusDetailsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const buses = location.state?.buses || [];
    const email = location.state?.email || '';
    const username = location.state?.username || '';
    const searchParams = location.state?.searchParams || {};

    // Filter states
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('all');
    const [sortBy, setSortBy] = useState('price');

    // Get min and max prices from buses
    const priceRangeData = useMemo(() => {
        if (buses.length === 0) return { min: 0, max: 10000 };
        const prices = buses.map(bus => bus.price || 0);
        return {
            min: Math.min(...prices),
            max: Math.max(...prices)
        };
    }, [buses]);

    // Initialize price range with actual bus prices
    React.useEffect(() => {
        if (priceRangeData.max > 0) {
            setPriceRange([priceRangeData.min, priceRangeData.max]);
        }
    }, [priceRangeData]);

    // Filter and sort buses
    const filteredAndSortedBuses = useMemo(() => {
        let filtered = [...buses];

        // Filter by price
        filtered = filtered.filter(bus => {
            const price = bus.price || 0;
            return price >= priceRange[0] && price <= priceRange[1];
        });

        // Filter by time slot
        if (selectedTimeSlot !== 'all') {
            filtered = filtered.filter(bus => {
                const time = bus.time || '';
                const hour = parseInt(time.split(':')[0]) || 0;
                
                switch (selectedTimeSlot) {
                    case 'before6am':
                        return hour < 6;
                    case '6am-12pm':
                        return hour >= 6 && hour < 12;
                    case '12pm-6pm':
                        return hour >= 12 && hour < 18;
                    case 'after6pm':
                        return hour >= 18;
                    default:
                        return true;
                }
            });
        }

        // Sort buses
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'price':
                    return (a.price || 0) - (b.price || 0);
                case 'time':
                    const timeA = a.time || '00:00';
                    const timeB = b.time || '00:00';
                    return timeA.localeCompare(timeB);
                case 'name':
                    return (a.bus_name || '').localeCompare(b.bus_name || '');
                default:
                    return 0;
            }
        });

        return filtered;
    }, [buses, priceRange, selectedTimeSlot, sortBy]);

    const handleBookNow = (bus) => {
        navigate('/bus-seating', {
            state: {
                selectedBus: bus,
                email,
                username
            }
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}, ${days[date.getDay()]}`;
    };

    return (
        <div className="bus-details-container">
            {/* Search Query Header */}
            <div className="search-query-header">
                <div className="search-query-info">
                    <div className="route-display">
                        <FaMapMarkerAlt />
                        <span>{searchParams.source || 'Source'} - {searchParams.destination || 'Destination'}</span>
                    </div>
                    <div className="date-travellers">
                        {searchParams.date && formatDate(searchParams.date)} | 1 TRAVELLER
                    </div>
                </div>
                <button className="change-search-btn" onClick={() => navigate('/busbookingpage')}>
                    Change
                </button>
            </div>

            <div className="main-content-wrapper">
                {/* Filters Panel */}
                <div className="filters-panel">
                    <div className="filters-header">
                        <FaFilter />
                        <span>FILTERS</span>
                    </div>

                    <div className="filter-section">
                        <label className="filter-label">Price Range</label>
                        <div className="price-range-display">
                            ₹{priceRange[0]} - ₹{priceRange[1]}
                        </div>
                        <input
                            type="range"
                            min={priceRangeData.min}
                            max={priceRangeData.max}
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                            className="price-slider"
                        />
                        <div className="price-inputs">
                            <input
                                type="number"
                                min={priceRangeData.min}
                                max={priceRangeData.max}
                                value={priceRange[0]}
                                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                                className="price-input"
                            />
                            <span>-</span>
                            <input
                                type="number"
                                min={priceRangeData.min}
                                max={priceRangeData.max}
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || priceRangeData.max])}
                                className="price-input"
                            />
                        </div>
                    </div>

                    <div className="filter-section">
                        <label className="filter-label">Depart Time</label>
                        <div className="time-options">
                            <label className="time-option">
                                <input
                                    type="radio"
                                    name="timeSlot"
                                    value="all"
                                    checked={selectedTimeSlot === 'all'}
                                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                                />
                                <span>All Times</span>
                            </label>
                            <label className="time-option">
                                <input
                                    type="radio"
                                    name="timeSlot"
                                    value="before6am"
                                    checked={selectedTimeSlot === 'before6am'}
                                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                                />
                                <span>Before 6am</span>
                            </label>
                            <label className="time-option">
                                <input
                                    type="radio"
                                    name="timeSlot"
                                    value="6am-12pm"
                                    checked={selectedTimeSlot === '6am-12pm'}
                                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                                />
                                <span>6am - 12pm</span>
                            </label>
                            <label className="time-option">
                                <input
                                    type="radio"
                                    name="timeSlot"
                                    value="12pm-6pm"
                                    checked={selectedTimeSlot === '12pm-6pm'}
                                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                                />
                                <span>12pm - 6pm</span>
                            </label>
                            <label className="time-option">
                                <input
                                    type="radio"
                                    name="timeSlot"
                                    value="after6pm"
                                    checked={selectedTimeSlot === 'after6pm'}
                                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                                />
                                <span>After 6pm</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Results Panel */}
                <div className="results-panel">
                    <div className="results-header">
                        <div className="results-count">
                            {filteredAndSortedBuses.length} Results
                        </div>
                        <div className="sort-options">
                            <FaSort style={{ marginRight: '8px' }} />
                            <span>Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="sort-select"
                            >
                                <option value="price">Price (Low to High)</option>
                                <option value="time">Departure Time</option>
                                <option value="name">Bus Name</option>
                            </select>
                        </div>
                    </div>

                    {filteredAndSortedBuses.length > 0 ? (
                        <div className="bus-results-list">
                            {filteredAndSortedBuses.map((bus, index) => (
                                <div key={bus.id || index} className="bus-result-card">
                                    <div className="bus-result-left">
                                        <div className="bus-operator">
                                            <FaBus className="bus-icon" />
                                            <span className="bus-name">{bus.bus_name || 'Express Bus'}</span>
                                        </div>
                                        <div className="bus-timing">
                                            <div className="departure-info">
                                                <div className="time">{bus.time || 'N/A'}</div>
                                                <div className="location">{bus.from || 'Source'}</div>
                                                <div className="date">{formatDate(bus.date)}</div>
                                            </div>
                                            <div className="duration-info">
                                                <div className="duration-line"></div>
                                                <div className="duration-text">Direct</div>
                                            </div>
                                            <div className="arrival-info">
                                                <div className="time">
                                                    {bus.time ? (() => {
                                                        const [hours, minutes] = bus.time.split(':');
                                                        const arrivalHour = (parseInt(hours) + 8) % 24;
                                                        return `${arrivalHour.toString().padStart(2, '0')}:${minutes}`;
                                                    })() : 'N/A'}
                                                </div>
                                                <div className="location">{bus.to || 'Destination'}</div>
                                                <div className="date">{formatDate(bus.date)}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bus-result-right">
                                        <div className="bus-price">
                                            <div className="price-amount">₹{bus.price || 0}</div>
                                            <div className="price-label">per person</div>
                                        </div>
                                        <button
                                            className="book-btn"
                                            onClick={() => handleBookNow(bus)}
                                        >
                                            Book
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-results">
                            <FaBus style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.5 }} />
                            <p>No buses found matching your filters.</p>
                            <p style={{ marginTop: '10px', fontSize: '16px', opacity: 0.7 }}>
                                Try adjusting your filters or search again.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <button className="back-button" onClick={() => navigate('/busbookingpage')}>
                <FaArrowLeft style={{ marginRight: '8px' }} />
                Back to Search
            </button>
        </div>
    );
};

export default BusDetailsPage;
