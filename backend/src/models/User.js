import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    hash_password: {
        type: String,
        required: function() {
            // Password is required only for non-Google users
            return !this.isGoogleUser;
        }
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin'],
    },
    experience: {
        type: Number,
        default: 0,
        min: 0
    },
    isGoogleUser: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true, 
});

// Static methods
const User = model('User', userSchema);

// Export individual functions for backwards compatibility
export const getUserById = async (userId) => {
    return User.findById(userId).exec();
};

export const getUserByUsername = async (username) => {
    return User.findOne({ username }).exec();
};

export const getUserByEmail = async (email) => {
    return User.findOne({ email: email.toLowerCase() }).exec();
};

export const createUser = async (userData) => {
    const user = await User.create({
        ...userData,
        email: userData.email?.toLowerCase()
    });
    return user;
};

export const updateUser = async (userId, updateData) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    
    Object.assign(user, updateData);
    await user.save();
    
    return user;
};

export default User;
