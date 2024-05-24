const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const { verifyToken, checkRole } = require('../jwtUtils');

// Route to render the add-room form
router.get('/add', verifyToken, checkRole('Admin'), (req, res) => {
    res.render('add-room');
});

// Create a new room
router.post('/add', verifyToken, checkRole('Admin'), async (req, res) => {
    try {
        const { name, capacity, location, description } = req.body;
        const newRoom = new Room({ name, capacity, location, description });
        await newRoom.save();
        res.redirect('/rooms'); // Redirect to rooms list after adding
    } catch (error) {
        console.error('Error creating room:', error.message);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Error creating room', error: error.message });
        }
    }
});

// Get all rooms
router.get('/', verifyToken, async (req, res) => {
    try {
        let query = {};
        const { name, capacity, location } = req.query;

        if (name) {
            query.name = { $regex: name, $options: "i" };
        }
        if (capacity) {
            query.capacity = { $gte: parseInt(capacity) };
        }
        if (location) {
            query.location = { $regex: location, $options: "i" };
        }

        const rooms = await Room.find(query);
        res.render('rooms-list', { rooms, user: req.user });
    } catch (error) {
        console.error('Error fetching rooms:', error.message);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Error fetching rooms', error: error.message });
        }
    }
});

// Render edit-room form
router.get('/edit/:id', verifyToken, checkRole('Admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const room = await Room.findById(id);
        if (!room) {
            return res.status(404).send('Room not found');
        }
        res.render('edit-room', { room });
    } catch (error) {
        console.error('Error fetching room details:', error.message);
        res.status(500).json({ message: 'Error fetching room details', error: error.message });
    }
});

// Update room
router.post('/update/:id', verifyToken, checkRole('Admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, capacity, location, description } = req.body;
        await Room.findByIdAndUpdate(id, { name, capacity, location, description });
        res.redirect('/rooms'); // Redirect to rooms list after updating
    } catch (error) {
        console.error('Error updating room:', error.message);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Error updating room', error: error.message });
        }
    }
});

// Delete a room
router.delete('/delete/:id', verifyToken, checkRole('Admin'), async (req, res) => {
    try {
        const { id } = req.params;
        await Room.findByIdAndDelete(id);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error deleting room:', error.message);
        res.status(500).json({ message: 'Error deleting room', error: error.message });
    }
});

module.exports = router;
