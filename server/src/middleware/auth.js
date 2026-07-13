const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');
const { User, Role } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = req.headers['x-milson-auth-token']
      || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null);

    if (!token) {
      return res.status(401).json({ success: false, error: { message: 'No token provided' } });
    }

    const decoded = jwt.verify(token, jwtSecret);

    const user = await User.findByPk(decoded.id, {
      include: [{ model: Role }],
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, error: { message: 'Invalid or inactive user' } });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: { message: 'Token expired' } });
    }
    return res.status(401).json({ success: false, error: { message: 'Invalid token' } });
  }
};

module.exports = { authenticate };
