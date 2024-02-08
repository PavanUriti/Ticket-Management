const Bus = require('../models/bus.model');

module.exports = {
    registerNewBus,
    resetTickets,
};

/**
 * 
 * @param {*} serviceId 
 * @returns 
 */
async function registerNewBus(serviceId, busType, travels, toCity, fromCity) {
    // Create a bus with 40 seats - (lower -20 & upper -20)
    const busData = {
      serviceId, busType, travels, toCity, fromCity, 
      seats: [],
    };
  
    for (let i = 1; i <= 20; i++) {
        const lowerSeat = {
            seatNo: `L-${i}`,
            section: 'lower',
            isAvailable: true,
        };
        const upperSeat = {
            seatNo: `U-${i}`,
            section: 'upper',
            isAvailable: true,
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
    const query = selectedBuses ? { serviceId: { $in: selectedBuses } } : {};

    const result = await Bus.updateMany(query, {
      $set: {
        seats: Array.from({ length: 20 }, (_, i) => ({
            seatNo: `L-${i + 1}`,
            section: 'lower',
            isAvailable: true,
        })).concat(Array.from({ length: 20 }, (_, i) => ({
            seatNo: `U-${i + 1}`,
            section: 'upper',
            isAvailable: true,
        }))),
      },
    });

    return result.modifiedCount;
  } catch (error) {
    throw error;
  }
}
