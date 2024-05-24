const jwt = require('jsonwebtoken');
const secretKey = 'yourSecretKey';

function generateToken(userId, username, role) {
    return jwt.sign(
        { userId, username, role }, 
        secretKey,
        { expiresIn: '1h' }
    );
}


function verifyToken(req, res, next) {
    const token = req.cookies.token || '';  
    if (!token) {
        return res.status(403).send('A token is required for authentication');
    }
    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        console.log('Decoded token:', decoded); // Adăugăm această linie pentru debugging
    } catch (err) {
        return res.status(401).send('Invalid Token');
    }
    return next();
}

function checkRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    };
}

module.exports = { generateToken, verifyToken, checkRole };
