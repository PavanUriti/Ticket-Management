const { EventEmitter } = require('events');

const userEvents = new EventEmitter();
const busEvents = new EventEmitter();

function initializeEventHandlers() {
  // Event when a new user is registered
   userEvents.on('userRegistered', ({ userId, email, role }) => {
    console.log(`User Registered: UserId ${userId}, Email: ${email}, Role:${role}`);
  });

  // Event when a new bus is registered
   busEvents.on('busRegistered', ({ busId, serviceId }) => {
    console.log(`Bus Registered: BusId ${busId}, ServiceId: ${serviceId}`);
  });

  // Event when a ticket is opened
  busEvents.on('ticketOpened', ({ busId, seatNo }) => {
    console.log(`Ticket Opened for seat ${seatNo} of Bus Id: ${busId}`);
  });

  // Event when a ticket is closed
  busEvents.on('ticketClosed', ({ busId, seatNo, bookingId }) => {
    console.log(`Ticket closed for seat ${seatNo}, Booking ID: ${bookingId} of Bus Id: ${busId}`);
  });

  // Event when the server is reset
  busEvents.on('serverReset', () => {
    console.log('Server reset event received');
  });
}

module.exports = {userEvents, busEvents, initializeEventHandlers };
