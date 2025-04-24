const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const nodemailer = require('nodemailer');
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

// Helper: Generate pretty HTML email
function generateBookingEmail(booking) {
    return `
    <div style="font-family:'ClashDisplay',Arial,sans-serif;background:#fff;padding:32px 16px;border-radius:12px;border:2px solid #d47e9a;max-width:420px;margin:auto;">
      <h2 style="color:#d47e9a;text-align:center;margin-bottom:8px;">Rani's Salon Booking Confirmed!</h2>
      <hr style="border:0;border-top:2px solid #d47e9a;margin:12px 0;">
      <p style="color:#727272;margin-bottom:16px;text-align:center;">Thank you, <b>${booking.name}</b>, for booking with us.</p>
      <div style="background:#fbeaf1;padding:18px 16px;border-radius:10px;margin-bottom:16px;">
        <p style="margin:0 0 8px 0;"><b>Service:</b> <span style="color:#d47e9a;">${booking.service}</span></p>
        <p style="margin:0 0 8px 0;"><b>Date:</b> <span style="color:#d47e9a;">${booking.date}</span></p>
        <p style="margin:0 0 8px 0;"><b>Time:</b> <span style="color:#d47e9a;">${booking.time}</span></p>
        ${booking.notes ? `<p style='margin:0 0 8px 0;'><b>Notes:</b> <span style='color:#d47e9a;'>${booking.notes}</span></p>` : ''}
      </div>
      <p style="text-align:center;color:#727272;font-size:0.98rem;">We look forward to seeing you!<br>Rani's Salon Team</p>
      <div style="text-align:center;margin-top:18px;">
        <img src="https://cdn-icons-png.flaticon.com/512/3062/3062634.png" alt="Salon Icon" width="48" style="opacity:0.8;"/>
      </div>
    </div>
    `;
}

// Get all bookings (for admin or debug)
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get bookings for a specific date
router.get('/date/:date', async (req, res) => {
    try {
        const bookings = await Booking.find({ date: req.params.date });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new booking
router.post('/', async (req, res) => {
    try {
        const { name, phone, service, date, time, email, notes } = req.body;
        if (!name || !phone || !service || !date || !time || !email) {
            return res.status(400).json({ error: 'All fields are required.' });
        }
        const booking = new Booking({ name, phone, service, date, time, email, notes });
        await booking.save();

        // Log the full booking object and recipient
        console.log('Booking object:', booking);
        console.log('About to send email to:', booking.email);
        if (!booking.email || typeof booking.email !== 'string' || !booking.email.trim()) {
            console.error('Booking email missing or invalid:', booking.email);
            return res.status(400).json({ error: 'Email address missing for confirmation email.' });
        }

        // Send confirmation email (safe)
        try {
            await transporter.sendMail({
                from: `Rani's Salon <${EMAIL_USER}>`,
                to: booking.email,
                subject: "Your Rani's Salon Booking is Confirmed!",
                html: generateBookingEmail(booking)
            });
        } catch (mailErr) {
            console.error('Nodemailer error:', mailErr);
            return res.status(500).json({ error: 'Failed to send confirmation email.' });
        }

        res.status(201).json(booking);
    } catch (err) {
        console.error('Booking POST error:', err); // Log error to terminal
        if (err.code === 11000) {
            // Duplicate booking
            return res.status(409).json({ error: 'This time slot is already booked.' });
        }
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
