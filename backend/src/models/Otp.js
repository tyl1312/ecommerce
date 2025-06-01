const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    purpose: { type: String, enum: ['registration', 'reset-password'], default: 'registration' },
    verified: { 
        type: Boolean, 
        default: false 
    },
    expiry: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now, expires: '5m' },
});

module.exports = mongoose.model('Otp', otpSchema);