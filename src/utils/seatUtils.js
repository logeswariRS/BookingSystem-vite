/**
 * Convert row and column indices to seat number format (e.g., A1, B3, C2)
 * @param {number} row - Row index (0-based)
 * @param {number} col - Column index (0-based)
 * @returns {string} Seat number in format like "A1", "B3", etc.
 */
export const formatSeatNumber = (row, col) => {
  const rowLetter = String.fromCharCode(65 + row); // A=65, B=66, C=67, D=68
  const seatNumber = col + 1; // Col 0 = 1, Col 1 = 2, etc.
  return `${rowLetter}${seatNumber}`;
};

/**
 * Convert array of seat objects with row/col to seat number strings
 * @param {Array} seats - Array of seat objects with {row, col} properties
 * @returns {string} Comma-separated seat numbers (e.g., "A1, B3, C2")
 */
export const formatSeatNumbers = (seats) => {
  if (!seats || !Array.isArray(seats) || seats.length === 0) {
    return 'Not Selected';
  }
  
  return seats
    .map((seat) => {
      if (typeof seat === 'object' && seat.row !== undefined && seat.col !== undefined) {
        return formatSeatNumber(seat.row, seat.col);
      }
      // If already a string, return as is
      return seat;
    })
    .join(', ');
};

/**
 * Convert seat number string (e.g., "A1") back to row/col format
 * @param {string} seatNumber - Seat number like "A1", "B3"
 * @returns {Object} Object with {row, col} properties
 */
export const parseSeatNumber = (seatNumber) => {
  const match = seatNumber.match(/^([A-Z])(\d+)$/);
  if (!match) {
    return null;
  }
  
  const row = match[1].charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
  const col = parseInt(match[2], 10) - 1; // 1=0, 2=1, 3=2, 4=3
  
  return { row, col };
};



