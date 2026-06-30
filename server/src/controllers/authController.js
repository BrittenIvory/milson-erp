const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/auth');
const { User, Role } = require('../models');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Username and password are required' },
      });
    }

    const user = await User.findOne({
      where: { username },
      include: [{ model: Role }],
    });

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' },
      });
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' },
      });
    }

    await user.update({ last_login: new Date() });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.Role.name },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );

    return res.json({
      success: true,
      data: {
        token,
        user: user.toJSON(),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res) => {
  return res.json({
    success: true,
    data: req.user.toJSON(),
  });
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: { message: 'Current password and new password are required' },
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: { message: 'New password must be at least 8 characters' },
      });
    }

    const user = await User.findByPk(req.user.id);
    const isValid = await user.validatePassword(currentPassword);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: { message: 'Current password is incorrect' },
      });
    }

    user.password_hash = newPassword;
    await user.save();

    return res.json({
      success: true,
      data: { message: 'Password changed successfully' },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getMe, changePassword };
