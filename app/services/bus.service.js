const Bus = require('../models/bus.model');
const Booking = require('../models/booking.model');
const moment = require('moment');

module.exports = {
    registerNewBus,
    resetTickets,
    isBusExist,
    updateTicketStatus,
};

/**
 * 
 * @param {*} serviceId 
 * @returns 
 */
async function registerNewBus(serviceId, busType, travels, toCity, fromCity, dateOfJourney) {
    // Create a bus with 40 seats - (lower -20 & upper -20)
    const busData = {
      serviceId, busType, travels, toCity, fromCity, dateOfJourney,
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
    const query = selectedBuses ? { _id: { $in: selectedBuses } } : {};

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

async function isBusExist(id) {
    const bus = await Bus.findOne({ _id: id });
    return bus; 
}

async function updateTicketStatus(bus, seatDetails) {
  try {
    const bulkOperations = await Promise.all(
      seatDetails.map(async (seatDetail) => {
        const { seatNo } = seatDetail;

        if (seatDetail.status === 'open') {
          const bookingIdToDelete = bus.seats.find(
            (seat) => seat.seatNo === seatNo
          ).bookingId;

          await Booking.deleteOne({ _id: bookingIdToDelete });

          return {
            updateOne: {
              filter: { _id: bus._id },
              update: {
                $set: {
                  'seats.$[element].isAvailable': true,
                  'seats.$[element].bookingId': null,
                },
              },
              arrayFilters: [{ 'element.seatNo': seatNo }],
            },
          };
        }

        const bookingDetails = {
          firstName: seatDetail.PaxList.firstName,
          lastName: seatDetail.PaxList.lastName,
          email: seatDetail.PaxList.email,
          phone: seatDetail.PaxList.phone,
          gender: seatDetail.PaxList.gender,
          age: seatDetail.PaxList.age,
          dateOfBooking: moment().unix(),
          busId: bus._id,
          dateOfJourney: bus.dateOfJourney,
        };
        // Insert booking details into the Booking collection
        const insertedBooking = await Booking.create(bookingDetails);

        return {
          updateOne: {
            filter: { _id: bus._id},
            update: {
              $set: {
                'seats.$[element].isAvailable': false,
                'seats.$[element].bookingId': insertedBooking._id,
              },
            },
            arrayFilters: [{ 'element.seatNo': seatNo, 'element.isAvailable': true }],
          },
        };
      })
    );

    await Bus.collection.bulkWrite(bulkOperations);
    return 'Ticket status updated successfully';
  } catch (error) {
    throw error;
  }
}


  
