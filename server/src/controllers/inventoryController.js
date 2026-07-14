const { Inventory, InventoryTransaction, Part, User, sequelize } = require('../models');
const { getPagination, formatPaginatedResponse } = require('../utils/pagination');
const { Op } = require('sequelize');

const list = async (req, res, next) => {
  try {
    const { page, limit, offset, sort, order } = getPagination(req.query);

    const includeWhere = {};
    if (req.query.search) {
      includeWhere[Op.or] = [
        { part_number: { [Op.iLike]: `%${req.query.search}%` } },
        { description: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }

    const data = await Inventory.findAndCountAll({
      include: [
        {
          model: Part,
          attributes: ['id', 'part_number', 'description', 'unit_of_measure', 'is_active'],
          where: Object.keys(includeWhere).length > 0 ? includeWhere : undefined,
        },
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

const getByPartId = async (req, res, next) => {
  try {
    const inventory = await Inventory.findOne({
      where: { part_id: req.params.partId },
      include: [{ model: Part }],
    });

    if (!inventory) {
      return res.status(404).json({ success: false, error: { message: 'Inventory record not found' } });
    }

    return res.json({ success: true, data: inventory });
  } catch (err) {
    next(err);
  }
};

const adjust = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { quantity, reason, transaction_type } = req.body;

    const [inventory] = await Inventory.findOrCreate({
      where: { part_id: req.params.partId },
      defaults: { part_id: req.params.partId },
      transaction: t,
    });

    const adjustmentType = transaction_type || 'Adjustment';

    await inventory.update({
      quantity_on_hand: sequelize.literal(`quantity_on_hand + ${parseFloat(quantity)}`),
    }, { transaction: t });

    await InventoryTransaction.create({
      part_id: req.params.partId,
      transaction_type: adjustmentType,
      quantity: parseFloat(quantity),
      reference_type: 'Manual',
      notes: reason || 'Manual adjustment',
      created_by: req.user.id,
    }, { transaction: t });

    await t.commit();

    const updated = await Inventory.findOne({
      where: { part_id: req.params.partId },
      include: [{ model: Part }],
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

const transactions = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const where = {};

    if (req.query.part_id) {
      where.part_id = req.query.part_id;
    }

    if (req.query.transaction_type) {
      where.transaction_type = req.query.transaction_type;
    }

    const data = await InventoryTransaction.findAndCountAll({
      where,
      include: [
        { model: Part, attributes: ['id', 'part_number', 'description'] },
        { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name'] },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    return res.json(formatPaginatedResponse(data, page, limit));
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getByPartId, adjust, transactions };
