const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;
const EXPIRATION = process.env.JWT_EXPIRATION || '1h';

const generateToken = (payload) => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRATION });
};

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).send('Access denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).send('Invalid token.');
  }
};

module.exports = { generateToken, verifyToken };
