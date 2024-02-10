const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const passengerSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, sparse: true },
    gender: { type: String, enum: ['male', 'female'], required: true },
    age: { type: Number, required: true },
});

const bookingSchema = new Schema({
    seats: [
        {
            seatNo: { type: String, required: true },
            passengerDetails: { type: passengerSchema, required: true },
        }
    ],
    dateOfBooking: { type: Number, required: true },
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
    dateOfJourney: { type: Number, required: true },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Booking', bookingSchema);
