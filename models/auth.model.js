const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, unique: true },
    phone: { type: String },
    address: { type: String },
    profileImage: { type: String },
    password: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    otp: { type: String },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

// Hash password before saving
userSchema.methods.generateHash = async (password) => {
    return bcrypt.hash(password, bcrypt.genSaltSync(6), null);
};

// Compare password
userSchema.methods.validatePassword = async (password, hashPassword) => {
    return bcrypt.compare(password, hashPassword);
};

module.exports = mongoose.model('User', userSchema);
