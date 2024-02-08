const express = require('express');
const busController = require('../controllers/bus.controller');
const {adminOnly} = require('../../auth/authorization');

const busRouter = express.Router();
module.exports = busRouter;


busRouter.post('/', adminOnly, busController.registerNewBus);

busRouter.post('/reset-tickets', adminOnly, busController.resetTickets);