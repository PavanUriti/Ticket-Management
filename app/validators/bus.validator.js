const Joi = require('joi');
const ID =require('../../shared/regular-expression').ID;

module.exports = {
    validateBusRegistration,
    validateResetTickets,
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