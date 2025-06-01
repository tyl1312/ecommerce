const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {type: String, unique: true},
    username: {type: String, unique: true},
    hash_password: String,
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

    async getUserByUsername(username) {
        return User.findOne({username}).exec();
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
        
        const userObject = user.toObject();
        delete userObject.hash_password;
        delete userObject.__v;
        
        return userObject;
    }
};
