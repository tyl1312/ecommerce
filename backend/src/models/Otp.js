import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const otpSchema = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        required: true,
        enum: ['registration', 'reset-password'],
        default: 'registration'
    },
    expiry: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 5 * 60 * 1000) 
    },
    verified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Auto-delete expired OTPs
otpSchema.index({ expiry: 1 }, { expireAfterSeconds: 0 });

// Index for faster queries
otpSchema.index({ email: 1, purpose: 1 });

const Otp = model('Otp', otpSchema);

export default Otp;