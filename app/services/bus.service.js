const Bus = require('../models/bus.model');
const Booking = require('../models/booking.model');
const moment = require('moment');
const mongoose = require('mongoose');

module.exports = {
    registerNewBus,
    resetTickets,
    isBusExist,
    updateTicketStatus,
    getTicketsStatus,
    getTicketsByStatus,
    getBookingDetails,
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
async function resetTickets(selectedBuses = []) {
  try {
    const query = selectedBuses.length>0 ? { _id: { $in: selectedBuses } } : {};

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

/**
 * 
 * @param {*} id 
 * @returns 
 */
async function isBusExist(id) {
    const bus = await Bus.findOne({ _id: id });
    return bus; 
}

/**
 * 
 * @param {*} bus 
 * @param {*} seatDetails 
 * @returns 
 */
async function updateTicketStatus(userId, bus, seatDetails) {
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
          seatNo: seatNo,
          dateOfJourney: bus.dateOfJourney,
          bookedBy: userId,
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


/**
 * 
 * @param {*} busId 
 * @returns 
 */
async function getTicketsStatus(busId, requestedSeats = []) {
  try {
    const pipeline = [
      { $match: { _id: new mongoose.Types.ObjectId(busId) } },
      {
        $unwind: '$seats',
      },
    ];

    if (requestedSeats.length > 0) {
      pipeline.push({
        $match: {
          'seats.seatNo': { $in: requestedSeats },
        },
      });
    }

    pipeline.push({
      $project: {
        _id: 0,
        seatNo: '$seats.seatNo',
        section: '$seats.section',
        isAvailable: '$seats.isAvailable',
        bookingId: { $ifNull: ['$seats.bookingId', '$$REMOVE'] },
      },
    });

    const result = await Bus.aggregate(pipeline);
    return result;
  } catch (error) {
    throw error;
  }
}


/**
 * 
 * @param {*} busId 
 * @returns 
 */
async function getTicketsByStatus(busId, ticketStatus) {
  try {
    const matchCondition = ticketStatus === 'all'
      ? {}
      : ticketStatus === 'open'
        ? { 'seats.isAvailable': true }
        : { 'seats.isAvailable': false };

    const pipeline = [
      { $match: { _id: new mongoose.Types.ObjectId(busId) } },
      {
        $unwind: '$seats',
      },
      {
        $match: matchCondition,
      },
    ];

    if (ticketStatus !== 'open') {
      pipeline.push(
        {
          $lookup: {
            from: 'bookings',
            localField: 'seats.bookingId',
            foreignField: '_id',
            as: 'passengerDetails',
          },
        },
        {
          $addFields: {
            passengerDetails: { $arrayElemAt: ['$passengerDetails', 0] },
          },
        }
      );
    }

    pipeline.push({
      $project: {
        _id: 0,
        seatNo: '$seats.seatNo',
        section: '$seats.section',
        isAvailable: '$seats.isAvailable',
        bookingId: { $ifNull: ['$seats.bookingId', '$$REMOVE'] },
        passengerDetails: {
          $cond: [
            {$gt: ['$passengerDetails.age', null]},
            {
              gender: '$passengerDetails.gender',
              age: '$passengerDetails.age',
            },
            '$$REMOVE',
          ],
        },
      },
    });

    const result = await Bus.aggregate(pipeline);

    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * 
 * @param {*} busId 
 * @returns 
 */
async function getBookingDetails(busId, bookingIds = []) {
  try {
    const busObjectId = new mongoose.Types.ObjectId(busId);
    const bookingObjectIds = bookingIds.map((bookingId) => new mongoose.Types.ObjectId(bookingId));

    const matchCondition = bookingIds.length>0 ? {busId: busObjectId, _id: { $in: bookingObjectIds }}: {busId: busObjectId};
    const pipeline = [
      { $match: matchCondition},
      {
        $lookup: {
          from: 'users',
          localField: 'bookedBy',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $addFields: {
          userDetails: { $arrayElemAt: ['$userDetails', 0] },
        },
      },
      {
        $project: {
          _id: 0,
          bookingId: '$_id',
          seatNo: '$seatNo',
          passengerDetails: {
                firstName:'$firstName',
                lastName:'$lastName',
                email: '$email',
                gender: '$gender',
                age: '$age',
          },
          dateOfBooking: '$dateOfBooking',
          dateOfJourney: '$dateOfJourney',
          userDetails:{
            userId: '$userDetails._id',
            email: '$userDetails.email',
          }
        },
      }
    ];

    const result = await Booking.aggregate(pipeline);

    return result;
  } catch (error) {
    throw error;
  }
}
