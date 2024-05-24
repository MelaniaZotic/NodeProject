const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../jwtUtils');
const jwt = require('jsonwebtoken');


const validateRegistration = (req, res, next) => {
    const { username, password, email } = req.body;
    const errors = [];

    if (!username) errors.push('Username is required');
    if (!email) errors.push('Email is required');
    if (!password || password.length < 6) errors.push('Password must be at least 6 characters long');

    if (errors.length > 0) {
        res.status(400).json({ errors });
    } else {
        next();
    }
};

router.post('/register', validateRegistration, async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: role || 'User'
        });
        await newUser.save();
        console.log("User registered successfully");
        res.redirect('/users/login');
    } catch (error) {
        error.status = 500;
        next(error);
    }
});

// GET route for register page
router.get('/register', (req, res) => {
    res.render('register');
});

// GET route for login page
router.get('/login', (req, res) => {
    res.render('login');
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log("Attempting to login with the following data:", username, password);

        const user = await User.findOne({ username });
        console.log("Found user:", user);

        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const token = generateToken(user._id.toString(), user.username, user.role);

        res.cookie('token', token, { httpOnly: true });

        if (user.role === 'Admin') {
            res.redirect('/dashboard-admin');
        } else {
            res.redirect('/dashboard-user');
        }
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/all', async (req, res) => {
    try {
        // Vom prelua doar username-ul și email-ul pentru fiecare utilizator non-admin
        const users = await User.find({ role: { $ne: 'Admin' } }, 'username email');
        // Trimite datele la client sau la un template Pug
        res.render('users-list', { users });
    } catch (error) {
        console.error('Error fetching non-admin users:', error);
        res.status(500).send('Internal Server Error');
    }
});


router.get('/logout', (req, res, next) => {
    try {
        res.clearCookie('token');
        res.redirect('/users/login');
    } catch (error) {
        next(error);
    }
});


router.get('/edit-user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send('User not found');
        res.render('edit-user', { user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Ruta pentru a actualiza utilizatorul
router.post('/update-user/:id', async (req, res) => {
    const { username, email } = req.body;
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { username, email }, { new: true });
        res.redirect('/users/non-admin-users');
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Ruta pentru ștergerea utilizatorului
router.post('/delete-user/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.redirect('/users/non-admin-users');
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;
