const { User, Role } = require('../models');
const { getPagination, formatPaginatedResponse } = require('../utils/pagination');
const { Op } = require('sequelize');

const list = async (req, res, next) => {
  try {
    const { page, limit, offset, sort, order } = getPagination(req.query);
    const where = {};

    if (req.query.search) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${req.query.search}%` } },
        { first_name: { [Op.iLike]: `%${req.query.search}%` } },
        { last_name: { [Op.iLike]: `%${req.query.search}%` } },
        { email: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }

    const data = await User.findAndCountAll({
      where,
      include: [{ model: Role, attributes: ['id', 'name'] }],
      order: [[sort, order]],
      limit,
      offset,
    });

    return res.json(formatPaginatedResponse(data, page, limit));
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Role }],
    });

    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    return res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { username, email, password, first_name, last_name, role_id } = req.body;

    const user = await User.create({
      username,
      email,
      password_hash: password,
      first_name,
      last_name,
      role_id,
    });

    const created = await User.findByPk(user.id, {
      include: [{ model: Role }],
    });

    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    const { username, email, first_name, last_name, role_id, is_active, password } = req.body;

    if (username) user.username = username;
    if (email) user.email = email;
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (role_id) user.role_id = role_id;
    if (is_active !== undefined) user.is_active = is_active;
    if (password) user.password_hash = password;

    await user.save();

    const updated = await User.findByPk(user.id, {
      include: [{ model: Role }],
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

const deactivate = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    await user.update({ is_active: false });
    return res.json({ success: true, data: { message: 'User deactivated' } });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById, create, update, deactivate };
