const { Part, User, Inventory } = require('../models');
const { getPagination, formatPaginatedResponse } = require('../utils/pagination');
const { Op } = require('sequelize');

const list = async (req, res, next) => {
  try {
    const { page, limit, offset, sort, order } = getPagination(req.query);
    const where = {};

    if (req.query.search) {
      where[Op.or] = [
        { part_number: { [Op.iLike]: `%${req.query.search}%` } },
        { description: { [Op.iLike]: `%${req.query.search}%` } },
        { material: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }

    if (req.query.is_active !== undefined) {
      where.is_active = req.query.is_active === 'true';
    }

    const data = await Part.findAndCountAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name'] },
      ],
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
    const part = await Part.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name'] },
        { model: User, as: 'updater', attributes: ['id', 'first_name', 'last_name'] },
        { model: Inventory },
      ],
    });

    if (!part) {
      return res.status(404).json({ success: false, error: { message: 'Part not found' } });
    }

    return res.json({ success: true, data: part });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const part = await Part.create({
      ...req.body,
      created_by: req.user.id,
      updated_by: req.user.id,
    });

    await Inventory.create({ part_id: part.id });

    return res.status(201).json({ success: true, data: part });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const part = await Part.findByPk(req.params.id);
    if (!part) {
      return res.status(404).json({ success: false, error: { message: 'Part not found' } });
    }

    await part.update({ ...req.body, updated_by: req.user.id });
    return res.json({ success: true, data: part });
  } catch (err) {
    next(err);
  }
};

const deactivate = async (req, res, next) => {
  try {
    const part = await Part.findByPk(req.params.id);
    if (!part) {
      return res.status(404).json({ success: false, error: { message: 'Part not found' } });
    }

    await part.update({ is_active: false, updated_by: req.user.id });
    return res.json({ success: true, data: { message: 'Part deactivated' } });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById, create, update, deactivate };
