const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Otp = require('../models/Otp');

function generateOTP(length = 6) {
    return crypto.randomInt(0, Math.pow(10, length)).toString().padStart(length, '0');
}

async function sendOTP(email, otp, purpose = 'registration') {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    let subject, text;
    if (purpose === 'reset-password') {
        subject = 'OTP code to reset your password';
        text = `Your OTP code for password reset is ${otp}. Only valid for 5 minutes. Please do NOT share it with anyone.`;
    } else {
        subject = 'OTP code to validate your account';
        text = `Your OTP code is ${otp}. Only valid for 5 minutes. Please do NOT share it with anyone.`;
    }

    const mailOptions = {
        from: `"E-commerce" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw error;
    }
}

async function storeOTP(email, otp, purpose = 'registration') {
    await Otp.deleteMany({ email, purpose });
    await Otp.create({
        email,
        otp,
        purpose,
        expiry: Date.now() + 50 * 60 * 1000, 
        attempts: 0,
        verified: false,
    });
}

async function verifyOTP(email, otp, purpose = 'registration') {
    const record = await Otp.findOne({ email, purpose });
    if (!record) return { status: false, message: 'OTP not found or expired' };
    if (Date.now() > record.expiry) {
        await Otp.deleteOne({ _id: record._id });
        return { status: false, message: 'OTP has expired' };
    }
    if (record.attempts >= 3) {
        await Otp.deleteOne({ _id: record._id });
        return { status: false, message: 'Too many invalid attempts' };
    }
    if (record.otp !== otp) {
        record.attempts += 1;
        await record.save();
        return { status: false, message: 'Invalid OTP' };
    }
    
    // Mark as verified for reset-password, or delete for registration
    if (purpose === 'reset-password') {
        record.verified = true;
        await record.save();
    } else {
        await Otp.deleteOne({ _id: record._id });
    }
    return { status: true, message: 'OTP verified successfully' };
}

module.exports = {
    generateOTP,
    sendOTP,
    storeOTP,
    verifyOTP,
};