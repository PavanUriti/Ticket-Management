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
        busNo: Joi.string().trim().min(5).max(10).required(),
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