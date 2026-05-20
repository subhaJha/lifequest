const jwt = require('jsonwebtoken');

const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'change_this', { expiresIn: '7d' });
};

module.exports = { signToken };
