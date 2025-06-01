import { Schema, model } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

// create User Schema with username, email, password, createAt, experience
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        minlength: 3,   
        match : [/^[a-zA-Z0-9]+$/, 'is invalid, only contain a-z, A-Z, 0-9!'],
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/, 'Must match an email address!'],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verifyToken:{
        type: String,
        default: '',
    },
    resetPasswordToken: {
        type: String,
        default: '',
    },
    resetPasswordExpires: {
        type: Date,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    passwordHistory: {
        type: [String],
        default: [],
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    experience: {
        type: Number,
        default: 0,
    },
    refreshToken: {
        type: String,
        default: '',
    },
    loginAttempts: {
        type: Number,
        default: 0,
    },
});

// Hash password before save
userSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified('password')) {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        // Encrypt password with salt
        const hashedPassword = await bcrypt.hash(this.password, salt); 
        
        // Remove password history if it is more than 5
        if (this.passwordHistory.length >= 5) {
            this.passwordHistory.shift();
        }

        this.password = hashedPassword;
        this.passwordHistory.push(hashedPassword);
    }
    next();
});

// Compare input password with the hashed password
userSchema.methods.isCorrectPassword = async function (password) {
    return bcrypt.compare(password, this.password);
};
// generate access token
userSchema.methods.generateAccessToken = function () {
    const payload = { _id: this._id, email: this.email };
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const expiresIn = process.env.ACCESS_TOKEN_EXPIRY;

    if (!secret) {
        throw new Error('ACCESS_TOKEN_SECRET is not defined in environment variables');
    }

    if (!expiresIn) {
        throw new Error('ACCESS_TOKEN_EXPIRY is not defined in environment variables');
    }

    try {
        return jwt.sign(payload, secret, { expiresIn });
    } catch (error) {
        console.error('Error signing the access token:', error);
        throw new Error('Access token signing failed');
    }
};

// generate refresh token
userSchema.methods.generateRefreshToken = function () {
    const payload = { _id: this._id, email: this.email };
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRY;

    if (!secret) {
        throw new Error('REFRESH_TOKEN_SECRET is not defined in environment variables');
    }

    if (!expiresIn) {
        throw new Error('REFRESH_TOKEN_EXPIRY is not defined in environment variables');
    }

    try {
        return jwt.sign(payload, secret, { expiresIn });
    } catch (error) {
        console.error('Error signing the refresh token:', error);
        throw new Error('Refresh token signing failed');
    }
};

const User = model('User', userSchema)

export default User;
