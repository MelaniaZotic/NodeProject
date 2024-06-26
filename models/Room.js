const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    capacity: { type: Number, required: true },
    location: { type: String, required: true },
    description: { type: String }
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;