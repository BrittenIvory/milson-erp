const { Customer, User, CustomerPrice, Part } = require('../models');
const { getPagination, formatPaginatedResponse } = require('../utils/pagination');
const { Op } = require('sequelize');

const list = async (req, res, next) => {
  try {
    const { page, limit, offset, sort, order } = getPagination(req.query);
    const where = {};

    if (req.query.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${req.query.search}%` } },
        { code: { [Op.iLike]: `%${req.query.search}%` } },
        { contact_person: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }

    if (req.query.is_active !== undefined) {
      where.is_active = req.query.is_active === 'true';
    }

    const data = await Customer.findAndCountAll({
      where,
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
    const customer = await Customer.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name'] },
        { model: CustomerPrice, as: 'prices', include: [{ model: Part, attributes: ['id', 'part_number', 'description'] }] },
      ],
    });

    if (!customer) {
      return res.status(404).json({ success: false, error: { message: 'Customer not found' } });
    }

    return res.json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const customer = await Customer.create({
      ...req.body,
      created_by: req.user.id,
      updated_by: req.user.id,
    });

    return res.status(201).json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, error: { message: 'Customer not found' } });
    }

    await customer.update({ ...req.body, updated_by: req.user.id });
    return res.json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

const deactivate = async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, error: { message: 'Customer not found' } });
    }

    await customer.update({ is_active: false, updated_by: req.user.id });
    return res.json({ success: true, data: { message: 'Customer deactivated' } });
  } catch (err) {
    next(err);
  }
};

const setPrices = async (req, res, next) => {
  try {
    const { part_id, price, effective_date, expiry_date } = req.body;
    const cp = await CustomerPrice.create({
      customer_id: req.params.id,
      part_id,
      price,
      effective_date,
      expiry_date,
    });

    return res.status(201).json({ success: true, data: cp });
  } catch (err) {
    next(err);
  }
};

const getPrices = async (req, res, next) => {
  try {
    const prices = await CustomerPrice.findAll({
      where: { customer_id: req.params.id },
      include: [{ model: Part, attributes: ['id', 'part_number', 'description'] }],
      order: [['effective_date', 'DESC']],
    });

    return res.json({ success: true, data: prices });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById, create, update, deactivate, setPrices, getPrices };
