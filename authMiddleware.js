const { verifyToken } = require('./jwtUtils');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    const token = req.cookies.token;
    // Exclude token check for registration and login routes
    if (req.path === '/users/register' || req.path === '/users/login') {
        return next();
    }

    if (!token) {
        return res.status(401).send('Unauthorized');
    }

    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
        return res.status(403).send('Invalid token');
    }

    req.user = decodedToken;
    next();
}

module.exports = authenticateToken;
