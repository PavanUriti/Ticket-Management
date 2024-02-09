const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const seatSchema = new Schema({
    _id: false,
    seatNo: { type: String, unique: true, required: true },
    section: { type: String, enum: ['lower', 'upper'], required: true },
    isAvailable: { type: Boolean, default: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
});

const busSchema = new Schema({
    serviceId: { type: String, required: true, trim: true, minlength: 5, maxlength: 15, unique: true, required: true },
    busType: { type: String, required: true, trim: true, minlength: 5, maxlength: 50, required: true },
    travels: { type: String, required: true, trim: true, minlength: 5, maxlength: 30, required: true },
    toCity: { type: String, required: true, trim: true, minlength: 3, maxlength: 20, required: true },
    fromCity: { type: String, required: true, trim: true, minlength: 3, maxlength: 20, required: true },
    dateOfJourney: { type: Number, required: true},
    seats: [seatSchema],
},{ timestamps: true });

module.exports = mongoose.model('Bus', busSchema);

