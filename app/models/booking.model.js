const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    firstName: { type: String, required: true},
    lastName: { type: String, required: true},
    email: { type: String, required: true },
    phone: { type: String, sparse: true },
    gender: { type: String, enum: ['male', 'female'], required: true },
    age: { type: Number, required: true},
    dateOfBooking: { type: Number, required: true},
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
    dateOfJourney: { type: Number, required: true},
});

module.exports = mongoose.model('Booking', bookingSchema);


