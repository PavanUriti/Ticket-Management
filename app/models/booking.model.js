const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    firstName: { type: String, required: true},
    lastName: { type: String, required: true},
    email: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female'], required: true },
    dateOfBooking: { type: Number },
});

module.exports = mongoose.model('Booking', bookingSchema);


