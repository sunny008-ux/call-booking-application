const asyncHandler = require('express-async-handler');
const Booking = require('../models/bookingModel');
const { httpRequestTimer, counter } = require('../metrics');
const { sendMail } = require('../utils/mail');

const createBooking = asyncHandler(async (req, res) => {
  const apiPath = req.baseUrl;
  const end = httpRequestTimer.startTimer();

  const {
    name,
    email,
    phonenumber,
    servicetype,
    location,
    ip,
  } = req.body;

  // Block repeated booking from same IP within 2 minutes
  const prevBooking = await Booking.findOne({
    ip,
    createdAt: { $gt: new Date(Date.now() - 2 * 60 * 1000) },
  });

  if (prevBooking) {
    counter.labels('Booking Blocked', '400').inc();
    end({ route: apiPath, code: 400, method: req.method });

    return res.status(400).json({
      message: 'Please wait for a while before booking again',
    });
  }

  // Create booking
  const booking = await Booking.create({
    name,
    email,
    phonenumber,
    servicetype,
    location,
    image: req.file?.filename || null,
    ip,
  });

  // Respond immediately (IMPORTANT)
  counter.labels('Booking Success', '201').inc();
  end({ route: apiPath, code: 201, method: req.method });

  res.status(201).json({
    message: 'Booking created successfully',
    booking,
  });

  // Fire-and-forget emails (NON-BLOCKING)
  sendMail(email, name, 'user').catch(console.error);
  sendMail(process.env.ADMIN_EMAIL, name, 'admin').catch(console.error);
});

module.exports = { createBooking };
