const busService = require('../services/bus.service');
const ClientError = require('../../shared/client-error');
const handleResponse = require('../../shared/responsehandler');
const ServerError = require('../../shared/server-error');
const {StatusCodes} = require('http-status-codes');
const busValidator = require('../validators/bus.validator');

const INVALID_REQUEST_BODY_FORMAT = 'Invalid Request Body Format';

module.exports = {
    registerNewBus,
    resetTickets,
    updateTicketStatus,
    getTicketsStatus,
    getTicketsByStatus,
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function registerNewBus(req, res, next) {
    try {
        const { serviceId, busType, travels, toCity, fromCity, dateOfJourney } = req.body;

        const { error } = busValidator.validateBusRegistration(req.body);
        if (error) {
            throw new ClientError(StatusCodes.BAD_REQUEST, INVALID_REQUEST_BODY_FORMAT, error.message);
        }

        const savedBusId = await busService.registerNewBus(serviceId, busType, travels, toCity, fromCity, dateOfJourney);
    
        return handleResponse(req, res, next, StatusCodes.OK, {'busId': savedBusId}, ` Bus - ${serviceId} registered successfully!`, '', null);
    } catch (error) {
        if (error instanceof ClientError) {
            return next(error);
        }
        next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred during registration.', error.message));
    }
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function resetTickets(req, res, next) {
    try {
        const {selectedBuses} = req.body

        const { error } = busValidator.validateResetTickets(req.body);
        if (error) {
            throw new ClientError(StatusCodes.BAD_REQUEST, INVALID_REQUEST_BODY_FORMAT, error.message);
        }

        const modifiedCount = await busService.resetTickets(selectedBuses);
    
        return handleResponse(req, res, next, StatusCodes.OK, {}, `Server reset successful`, '', null);
    } catch (error) {
        if (error instanceof ClientError) {
            return next(error);
        }
        next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred during reset tickets.', error.message));
    }
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function updateTicketStatus(req, res, next) {
    try {
        const {seatDetails} = req.body

        const { error } = busValidator.validateUpdateTicketStatus(req.body);
        if (error) {
            throw new ClientError(StatusCodes.BAD_REQUEST, INVALID_REQUEST_BODY_FORMAT, error.message);
        }

        const bus = await busService.isBusExist(req.params.id);

        if (!!!bus) {
            throw new ClientError(StatusCodes.BAD_REQUEST,'Bus not found');
        }

        const result = await busService.updateTicketStatus(bus, seatDetails);
    
        return handleResponse(req, res, next, StatusCodes.OK, {}, `Ticket(s) Status Updated successfully`, '', null);
    } catch (error) {
        if (error instanceof ClientError) {
            return next(error);
        }
        next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred during update ticket status.', error.message));
    }
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function getTicketsStatus(req, res, next) {
    try {
        const {seats} = req.body

        const { error } = busValidator.validateGetTicketsStatus(req.body);
        if (error) {
            throw new ClientError(StatusCodes.BAD_REQUEST, INVALID_REQUEST_BODY_FORMAT, error.message);
        }

        const bookedSeats = await busService.getTicketsStatus(req.params.id, seats);
    
        return handleResponse(req, res, next, StatusCodes.OK, bookedSeats, `Ticket Status Retreived successfully`, '', null);
    } catch (error) {
        if (error instanceof ClientError) {
            return next(error);
        }
        next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred during getting ticket status.', error.message));
    }
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function getTicketsByStatus(req, res, next) {
    try {
        const ticketStatus = req.query.status || 'all';

        if (ticketStatus !== 'open' && ticketStatus !== 'close' && ticketStatus !== 'all') {
            throw new ClientError(StatusCodes.BAD_REQUEST, 'Invalid ticket status' );
        }

        const bookedSeats = await busService.getTicketsByStatus(req.params.id, ticketStatus);
    
        return handleResponse(req, res, next, StatusCodes.OK, bookedSeats, `Ticket Status Retreived successfully`, '', null);
    } catch (error) {
        if (error instanceof ClientError) {
            return next(error);
        }
        next(new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred during getting ticket status.', error.message));
    }
};
