const { Supplier, User, SupplierPrice, Part } = require('../models');
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

    const data = await Supplier.findAndCountAll({
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
    const supplier = await Supplier.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name'] },
        { model: SupplierPrice, as: 'prices', include: [{ model: Part, attributes: ['id', 'part_number', 'description'] }] },
      ],
    });

    if (!supplier) {
      return res.status(404).json({ success: false, error: { message: 'Supplier not found' } });
    }

    return res.json({ success: true, data: supplier });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const supplier = await Supplier.create({
      ...req.body,
      created_by: req.user.id,
      updated_by: req.user.id,
    });

    return res.status(201).json({ success: true, data: supplier });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, error: { message: 'Supplier not found' } });
    }

    await supplier.update({ ...req.body, updated_by: req.user.id });
    return res.json({ success: true, data: supplier });
  } catch (err) {
    next(err);
  }
};

const deactivate = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, error: { message: 'Supplier not found' } });
    }

    await supplier.update({ is_active: false, updated_by: req.user.id });
    return res.json({ success: true, data: { message: 'Supplier deactivated' } });
  } catch (err) {
    next(err);
  }
};

const setPrices = async (req, res, next) => {
  try {
    const { part_id, cost, effective_date, expiry_date } = req.body;
    const price = await SupplierPrice.create({
      supplier_id: req.params.id,
      part_id,
      cost,
      effective_date,
      expiry_date,
    });

    return res.status(201).json({ success: true, data: price });
  } catch (err) {
    next(err);
  }
};

const getPrices = async (req, res, next) => {
  try {
    const prices = await SupplierPrice.findAll({
      where: { supplier_id: req.params.id },
      include: [{ model: Part, attributes: ['id', 'part_number', 'description'] }],
      order: [['effective_date', 'DESC']],
    });

    return res.json({ success: true, data: prices });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById, create, update, deactivate, setPrices, getPrices };
