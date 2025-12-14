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

    // Image from multer
    const image = req.file ? req.file.filename : null;

    if (!name || !email || !phonenumber) {
        res.status(400);
        throw new Error('Required fields missing');
    }

    const booking = await Booking.create({
        name,
        email,
        phonenumber,
        servicetype,
        location,
        image,
        ip
    });

    // optional mails
    try {
        await sendMail(email, name, "user");
        await sendMail(process.env.ADMIN_EMAIL, name, "admin");
    } catch (e) {
        console.log("Mail failed:", e.message);
    }

    res.status(201).json({
        success: true,
        booking
    });
});

module.exports = { createBooking };
