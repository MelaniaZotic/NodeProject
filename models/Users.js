const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['Admin', 'User'], default: 'User' } // Adding role field
});

const User = mongoose.model('User', userSchema);

module.exports = User;
