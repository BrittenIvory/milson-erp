const { PurchaseReceipt, PurchaseReceiptLine, Container, Part, User, PurchaseOrderLine, PurchaseOrder } = require('../models');
const { getPagination, formatPaginatedResponse } = require('../utils/pagination');
const { Op } = require('sequelize');

const list = async (req, res, next) => {
  try {
    const { page, limit, offset, sort, order } = getPagination(req.query);
    const where = {};

    if (req.query.search) {
      where[Op.or] = [
        { receipt_number: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }

    const data = await PurchaseReceipt.findAndCountAll({
      where,
      include: [
        { model: Container, attributes: ['id', 'container_number'] },
        { model: User, as: 'receiver', attributes: ['id', 'first_name', 'last_name'] },
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
    const receipt = await PurchaseReceipt.findByPk(req.params.id, {
      include: [
        { model: Container },
        { model: User, as: 'receiver', attributes: ['id', 'first_name', 'last_name'] },
        { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name'] },
        {
          model: PurchaseReceiptLine,
          as: 'lines',
          include: [
            { model: Part, attributes: ['id', 'part_number', 'description', 'unit_of_measure'] },
            {
              model: PurchaseOrderLine,
              include: [{ model: PurchaseOrder, attributes: ['id', 'po_number'] }],
            },
          ],
        },
      ],
    });

    if (!receipt) {
      return res.status(404).json({ success: false, error: { message: 'Purchase receipt not found' } });
    }

    return res.json({ success: true, data: receipt });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById };
