const express = require('express');
const busController = require('../controllers/bus.controller');
const {adminOnly} = require('../../auth/authorization');

const busRouter = express.Router();
module.exports = busRouter;


busRouter.post('/', adminOnly, busController.registerNewBus);

busRouter.post('/reset-tickets', adminOnly, busController.resetTickets);

busRouter.put('/:id/ticket/update', busController.updateTicketStatus);

busRouter.get('/:id/ticket?', busController.getTicketsByStatus);

busRouter.post('/:id/ticket/status', busController.getTicketsStatus);

busRouter.post('/:id/ticket/bookings', busController.getBookingDetails);