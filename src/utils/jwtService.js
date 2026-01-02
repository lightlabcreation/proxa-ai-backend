const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (payload, expiresIn) => {
  return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

module.exports = { generateToken, verifyToken };
