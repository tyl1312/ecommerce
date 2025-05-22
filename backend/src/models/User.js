const { hash } = require('bcrypt');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: {type: String, unique: true},
    phone_number: {type: String, unique: true, match: /^(09|03|07|08|05)\d{8}$/},
    hash_password: String,
    home_address: String,
    createdAt: Date,
    updatedAt: Date,
});

const User = mongoose.model('User', userSchema);

userSchema.statics.findById = function (id) {
    return this.where({id: new RegExp(id, 'i')});
}
module.exports = {
    User,

    async getUserById(userId) {
        return User.findById(userId).exec();
    },

    async getUserByNumber(phone_number) {
        return User.findOne({phone_number}).exec();
    },

    async getUserByEmail(email) {
        return User.findOne({email}).exec();
    },

    async createUser(userData) {
        const user = await User.create(userData);
        return user;
    },

    async updateUser(userId, updateData) {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        Object.assign(user, updateData);
        user.updatedAt = new Date();
        await user.save();
        return user;
    }
};
