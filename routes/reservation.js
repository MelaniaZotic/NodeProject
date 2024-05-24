const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const { verifyToken, checkRole } = require('../jwtUtils');


router.get('/all-reservations', verifyToken, checkRole('Admin'), async (req, res) => {
    try {
        const reservations = await Reservation.find({})
            .populate('room', 'name')  // Presupun că fiecare rezervare are un câmp 'room' care este o referință la un model de cameră
            .populate('user', 'username'); // Presupun că 'user' este o referință la modelul de utilizator, și dorim să afișăm numele de utilizator

        res.render('reservations-list', { reservations });
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).send('Error loading reservations page');
    }
});


// Fetch and display all reservations for the logged-in user
router.get('/my-reservations', verifyToken, async (req, res) => {
    console.log("Entered the /my-reservations route");
    try {
        const userId = req.user.userId;
        console.log("User ID:", userId);
        const reservations = await Reservation.find({ user: userId })
            .populate('room', 'name');
        console.log("Reservations:", reservations);

        // Filtrăm rezervările care nu au room populat
        const filteredReservations = reservations.filter(reservation => reservation.room !== null);

        res.render('my-reservations', { reservations: filteredReservations });
    } catch (error) {
        console.error('Error fetching user reservations:', error);
        res.status(500).send('Error loading reservations page');
    }
});

router.delete('/delete/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        await Reservation.findByIdAndDelete(id);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error deleting room:', error.message);
        res.status(500).json({ message: 'Error deleting reservation', error: error.message });
    }
});



router.post('/add', verifyToken, async (req, res) => {
    console.log(req.body);
    console.log("User ID from token:", req.user.userId);

    try {
        const { room, date, startTime, endTime } = req.body;
        const userId = req.user.userId;

        const newReservation = new Reservation({
            room,
            user: userId,
            date,
            startTime,
            endTime
        });

        await newReservation.save();
        res.redirect('/rooms');
    } catch (error) {
        console.error('Error creating reservation:', error);
        res.status(500).send('Failed to create reservation');
    }
});

module.exports = router;
