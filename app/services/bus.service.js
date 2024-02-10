const Bus = require('../models/bus.model');
const Booking = require('../models/booking.model');
const moment = require('moment');
const mongoose = require('mongoose');
const { busEvents } = require('../../startup/event.handlers');

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

    busEvents.emit('busRegistered', {busId: savedBus._id, serviceId: serviceId})
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
        'seats.$[].isAvailable': true, 'seats.$[].bookingId': null,
      },
    });

    busEvents.emit('serverReset', { selectedBuses });
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
    const combinedSeatDetails = seatDetails
    .filter(seatDetail => seatDetail.status === 'close' && isSeatAvailable(bus, seatDetail.seatNo))
    .map(seatDetail => ({
      seatNo: seatDetail.seatNo,
      passengerDetails: seatDetail.PaxList,
    }));


    const bookingDetails = {
      busId: bus._id,
      seats: combinedSeatDetails,
      dateOfBooking: moment().unix(),
      dateOfJourney: bus.dateOfJourney,
      bookedBy: userId,
    };

    const insertedBooking = await Booking.create(bookingDetails);

    const bulkOperations = await Promise.all(
      seatDetails.map(async (seatDetail) => {
        const { seatNo } = seatDetail;

        if (seatDetail.status === 'open') {
          const seat = bus.seats.find(seat => seat.seatNo === seatNo);
          if (seat.bookingId) {
            await removeSeatFromBookingOperation(bus._id, seat.bookingId, seatNo)
          }
          return updateOpenSeatOperation(bus._id, seatNo);
        } else if (seatDetail.status === 'close') {
          return updateCloseSeatOperation(bus._id, seatNo, insertedBooking._id);
        }
      })
    );

    await Bus.collection.bulkWrite(bulkOperations);
    await Booking.deleteMany({ seats: [] });
    return 'Ticket status updated successfully';
  } catch (error) {
    throw error;
  }
}

function isSeatAvailable(bus, seatNo) {
  const seat = bus.seats.find(s => s.seatNo === seatNo);
  return seat ? seat.isAvailable : false;
}

function updateOpenSeatOperation(busId, seatNo) {
  busEvents.emit('ticketOpened', { busId, seatNo });
  return {
    updateOne: {
      filter: { _id: busId },
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

function updateCloseSeatOperation(busId, seatNo, bookingId) {
  busEvents.emit('ticketClosed', { busId, seatNo, bookingId });
  return {
    updateOne: {
      filter: { _id: busId },
      update: {
        $set: {
          'seats.$[element].isAvailable': false,
          'seats.$[element].bookingId': bookingId,
        },
      },
      arrayFilters: [
        { 'element.seatNo': seatNo, 'element.isAvailable': true },
      ],
    },
  };
}

async function removeSeatFromBookingOperation(busId, bookingId, seatNo) {
  try {
    const result = await Booking.updateOne({ _id: bookingId }, {
      $pull: {
        seats: { seatNo },
      },
    });
  } catch (error) {
    console.error("Error removing seat from booking:", error);
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
            'from': 'bookings',
            'let': {'bookingId':'$seats.bookingId' },
            'pipeline': [
              { $match: { $expr: { $eq: ['$_id', '$$bookingId'] } } },
              {
                $project: {
                  seats: '$seats',
                },
              },
            ],
            'as': 'bookingDetails',
          },
        },
        { '$unwind': '$bookingDetails' },
        { '$unwind': '$bookingDetails.seats' },
        { 
          $match: { 
            $expr: { 
              $eq: [ '$bookingDetails.seats.seatNo', '$seats.seatNo' ]
            }
          } 
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
            {$gt: ['$bookingDetails.seats.passengerDetails.age', null]},
            {
              gender: '$bookingDetails.seats.passengerDetails.gender',
              age: '$bookingDetails.seats.passengerDetails.age',
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
        $unwind: '$seats',
      },
      {
        $project: {
          _id: 0,
          bookingId: '$_id',
          seatNo: '$seats.seatNo',
          passengerDetails: {
                firstName:'$seats.passengerDetails.firstName',
                lastName:'$seats.passengerDetails.lastName',
                email: '$seats.passengerDetails.email',
                gender: '$seats.passengerDetails.gender',
                age: '$seats.passengerDetails.age',
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
