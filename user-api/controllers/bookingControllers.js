const asyncHandler = require('express-async-handler');
const Booking = require('../models/bookingModel');
const { sendMail } = require('../utils/mail');

const createBooking = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        phonenumber,
        servicetype,
        location,
        ip
    } = req.body;

    // Image from multer (GridFS / filename)
    const image = req.file ? req.file.filename : null;

    // ------------------------
    // Basic validation
    // ------------------------
    if (!name || !email || !phonenumber) {
        res.status(400);
        throw new Error('Required fields missing');
    }

    // ------------------------
    // Save booking to MongoDB
    // ------------------------
    const booking = await Booking.create({
        name,
        email,
        phonenumber,
        servicetype,
        location,
        image,
        ip
    });

    // ------------------------
    // Respond immediately (IMPORTANT)
    // ------------------------
    res.status(201).json({
        success: true,
        booking
    });

    // ------------------------
    // Fire-and-forget emails
    // ------------------------
    sendMail(email, name, "user")
        .catch(err => console.error("User mail failed:", err.message));

    sendMail(process.env.ADMIN_EMAIL, name, "admin")
        .catch(err => console.error("Admin mail failed:
