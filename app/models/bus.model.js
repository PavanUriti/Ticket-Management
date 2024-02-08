const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const seatSchema = new Schema({
    _id: false,
    seatNo: { type: Number, unique: true, required: true },
    section: { type: String, enum: ['lower', 'upper'], required: true },
    isBooked: { type: Boolean, default: false },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
});

const busSchema = new Schema({
    busNo: { type: String, required: true, trim: true, minlength: 5, maxlength: 15, unique: true, required: true },
    seats: [seatSchema],
});

module.exports = mongoose.model('Bus', busSchema);

