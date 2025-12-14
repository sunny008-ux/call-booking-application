const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 5000, // ⏱ prevent hanging
  greetingTimeout: 5000,
  socketTimeout: 5000,
});

const sendMail = async (
  to = "bar@example.com",
  name = "User",
  forRole = "user"
) => {
  try {
    await transporter.sendMail({
      from: `"Call Booking" <${process.env.SMTP_USER}>`,
      to,
      subject: "Booking Confirmation ✔",
      html: forRole === "user"
        ? getUserTemplate(name)
        : getAdminTemplate(),
    });

    console.log("📧 Mail sent to", to);
  } catch (err) {
    console.error("❌ Mail failed:", err.message);
    // DO NOT throw — never break API
  }
};

module.exports = { sendMail };
