const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');
const { User, Role } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: { message: 'No token provided' } });
    }

    const token = authHeader.split(' ')[1];
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
