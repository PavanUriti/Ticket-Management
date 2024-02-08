const jwt = require('jsonwebtoken');
const config = require('../config/default.json');

const jwtSecretKey = config.JWTPrivateKey;

exports.authenticateAdmin = authenticateAdmin;
exports.authenticateCustomer = authenticateCustomer;

// Middleware to authenticate Admin
function authenticateAdmin(req, res, next) {
    const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: 'Authorization token missing.' });
  }

  try {
    const decodedToken = jwt.verify(token, jwtSecretKey);
    if (decodedToken.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }

    // Attach user object to the request to be used by other handlers
    req.user = decodedToken;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
}

// Middleware to authenticate Customer
function authenticateCustomer(req, res, next) {
    const token = req.header('Authorization');
    const acceptRange = req.header('Accept-Ranges') || null;
    const range = req.header('Content-Range');

    if (!token) {
      return res.status(401).json({ error: 'Authorization token missing.' });
    }
  
    try {
      const decodedToken = jwt.verify(token, jwtSecretKey);
      if (decodedToken.role !== 'customer') {
        return res.status(403).json({ error: 'Unauthorized. Customer access required.' });
      }
      
      // Attach user object to the request to be used by other handlers
      req.user = decodedToken;

      if(acceptRange){
        req.headers.range = range;
      }
  
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token.' });
    }
}