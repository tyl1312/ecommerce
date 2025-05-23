const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Otp = require('../models/Otp');

function generateOTP(length = 6) {
    return crypto.randomInt(0, Math.pow(10, length)).toString().padStart(length, '0');
}

async function sendOTP(email, otp) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw error;
    }
}

async function storeOTP(email, otp) {
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp });
}

async function verifyOTP(email, otp) {
    const record = await Otp.findOne({ email, otp });
    if (record) {
        await Otp.deleteOne({ _id: record._id }); 
        return true;
    }
    return false;
}

module.exports = {
    generateOTP,
    sendOTP,
    storeOTP,
    verifyOTP,
};