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
        const { serviceId, busType, travels, toCity, fromCity } = req.body;

        const { error } = busValidator.validateBusRegistration(req.body);
        if (error) {
            throw new ClientError(StatusCodes.BAD_REQUEST, INVALID_REQUEST_BODY_FORMAT, error.message);
        }

        const savedBusId = await busService.registerNewBus(serviceId, busType, travels, toCity, fromCity);
    
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
