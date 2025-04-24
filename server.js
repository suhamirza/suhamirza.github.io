require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bookingRoutes = require('./routes/bookings');

const app = express();
let PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// Routes
app.use('/api/bookings', bookingRoutes);

// Fallback: serve booking.html for any unknown route (SPA-like)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'booking.html'));
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected');
    // Try to start server, if port is in use, try next available
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
    server.on('error', err => {
        if (err.code === 'EADDRINUSE') {
            console.warn(`Port ${PORT} in use, trying next available port...`);
            PORT++;
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        } else {
            console.error('Server error:', err);
        }
    });
}).catch(err => {
    console.error('MongoDB connection error:', err);
});
