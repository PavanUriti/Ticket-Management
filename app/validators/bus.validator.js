const Joi = require('joi');
const ID =require('../../shared/regular-expression').ID;
const nameRegex =require('../../shared/regular-expression').NAME;
const phoneRegex =require('../../shared/regular-expression').PHONE;

module.exports = {
    validateBusRegistration,
    validateResetTickets,
    validateUpdateTicketStatus,
    validateGetTicketsStatus,
    validateGetBookingDetails,
}

/**
 *
 * @param {*} user schema
 * @return {validationResult} validationResult
 */
function validateBusRegistration(bus) {
    const schema = Joi.object({
        serviceId: Joi.string().trim().min(5).max(10).required(),
        busType: Joi.string().trim().min(5).max(50).required(),
        travels: Joi.string().trim().min(5).max(30).required(),
        toCity: Joi.string().trim().min(3).max(20).required(),
        fromCity: Joi.string().trim().min(3).max(20).required(),
        dateOfJourney: Joi.number().required(),
    });

    return schema.validate(bus);
}

/**
 *
 * @param {*} user schema
 * @return {validationResult} validationResult
 */
function validateResetTickets(bus) {
    const schema = Joi.object({
        selectedBuses : Joi.array().items(Joi.string().regex(ID)).min(0).optional(),
    });

    return schema.validate(bus);
}

/**
 *
 * @param {*} user schema
 * @return {validationResult} validationResult
 */
function validateUpdateTicketStatus(seatDeatils) {
    const seatDetailsSchema = Joi.object({
        status: Joi.string().valid('open', 'close').required(),
        seatNo: Joi.string().required(),
        PaxList: Joi.object({
                firstName: Joi.string().regex(nameRegex).max(30).required(),
                lastName: Joi.string().regex(nameRegex).max(30).required(),
                email: Joi.string().email().max(50).required(),
                phone: Joi.string().regex(phoneRegex).allow(''),
                gender: Joi.string().valid('male', 'female').required(),
                age: Joi.number().required(),
        }).when('status', {
            is: 'close',
            then: Joi.required(),
            otherwise: Joi.forbidden(),
        }),    
      });

    const schema = Joi.object({
        seatDetails : Joi.array().items(seatDetailsSchema).min(1).required(),
    });

    return schema.validate(seatDeatils);
}

/**
 *
 * @param {*} user schema
 * @return {validationResult} validationResult
 */
function validateGetTicketsStatus(seats) {
    const schema = Joi.object({
        seats : Joi.array().items(Joi.string().min(3).max(4)).min(0).optional(),
    });

    return schema.validate(seats);
}

/**
 *
 * @param {*} user schema
 * @return {validationResult} validationResult
 */
function validateGetBookingDetails(bookingIds) {
    const schema = Joi.object({
        bookingIds : Joi.array().items(Joi.string().regex(ID)).min(0).optional(),
    });

    return schema.validate(bookingIds);
}