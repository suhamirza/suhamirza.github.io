const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    service: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String, required: true }, // e.g. '14:00'
    notes: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Prevent double booking for same date/time/service
BookingSchema.index({ date: 1, time: 1, service: 1 }, { unique: true });

module.exports = mongoose.model('Booking', BookingSchema);
