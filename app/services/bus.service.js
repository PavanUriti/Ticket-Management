const Bus = require('../models/bus.model');

module.exports = {
    registerNewBus,
    resetTickets,
};

/**
 * 
 * @param {*} busNo 
 * @returns 
 */
async function registerNewBus(busNo) {
    // Create a bus with 40 seats - (lower -20 & upper -20)
    const busData = {
      busNo,
      seats: [],
    };
  
    for (let i = 1; i <= 20; i++) {
        const lowerSeat = {
            seatNo: i,
            section: 'lower',
            isBooked: false,
        };
        const upperSeat = {
            seatNo: i,
            section: 'upper',
            isBooked: false,
        };
      
        busData.seats.push(lowerSeat, upperSeat);
      }
      
  
    // Save the bus to the database
    const bus = new Bus(busData);
    const savedBus = await bus.save();

    // Return the bus_id
    return savedBus._id;
}

/**
 * 
 * @param {*} selectedBuses 
 * @returns 
 */
async function resetTickets(selectedBuses) {
  try {
    const query = selectedBuses ? { busNo: { $in: selectedBuses } } : {};

    const result = await Bus.updateMany(query, {
      $set: {
        seats: Array.from({ length: 20 }, (_, i) => ({
            seatNo: i + 1,
            section: 'lower',
            isBooked: false,
        })).concat(Array.from({ length: 20 }, (_, i) => ({
            seatNo: i + 1,
            section: 'upper',
            isBooked: false,
        }))),
      },
    });

    return result.modifiedCount;
  } catch (error) {
    throw error;
  }
}
