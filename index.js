const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const userRoutes = require('./routes/users');
const roomRoutes = require('./routes/rooms');
const reservationRoutes = require('./routes/reservation');
const jwt = require('jsonwebtoken');
const { verifyToken, checkRole } = require('./jwtUtils');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.set('view engine', 'jade');

mongoose.connect('mongodb://localhost:27017/nodeApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.log(err));

app.use('/users', userRoutes);
app.use('/rooms', roomRoutes);
app.use('/reservations', reservationRoutes);

app.get('/dashboard-user', verifyToken, checkRole('User'), (req, res) => {
  res.render('dashboard-user', { user: req.user });
});

app.get('/dashboard-admin', verifyToken, checkRole('Admin'), (req, res) => {
  res.render('dashboard-admin', { user: req.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Middleware error
app.use((err, req, res, next) => {
  console.error(err.stack); // Loghează stack-ul de eroare pentru debugging
  const statusCode = err.statusCode || 500; // Setează statusul HTTP la 500 dacă nu a fost setat de către rute
  res.status(statusCode).json({
      status: 'error',
      statusCode: statusCode,
      message: err.message
  });
});
