const { PurchaseOrder, PurchaseOrderLine, Supplier, Part, User, sequelize } = require('../models');
const { getPagination, formatPaginatedResponse } = require('../utils/pagination');
const { generateOrderNumber } = require('../utils/generateNumber');
const { Op } = require('sequelize');

const list = async (req, res, next) => {
  try {
    const { page, limit, offset, sort, order } = getPagination(req.query);
    const where = {};

    if (req.query.search) {
      where[Op.or] = [
        { po_number: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }

    if (req.query.status) {
      where.status = req.query.status;
    }

    if (req.query.supplier_id) {
      where.supplier_id = req.query.supplier_id;
    }

    const data = await PurchaseOrder.findAndCountAll({
      where,
      include: [
        { model: Supplier, attributes: ['id', 'name', 'code'] },
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
    const po = await PurchaseOrder.findByPk(req.params.id, {
      include: [
        { model: Supplier },
        { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name'] },
        { model: User, as: 'updater', attributes: ['id', 'first_name', 'last_name'] },
        {
          model: PurchaseOrderLine,
          as: 'lines',
          include: [{ model: Part, attributes: ['id', 'part_number', 'description', 'unit_of_measure'] }],
          order: [['line_number', 'ASC']],
        },
      ],
    });

    if (!po) {
      return res.status(404).json({ success: false, error: { message: 'Purchase order not found' } });
    }

    return res.json({ success: true, data: po });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { supplier_id, order_date, expected_date, shipping_method, notes, lines } = req.body;

    const poNumber = await generateOrderNumber(PurchaseOrder, 'po_number', 'PO');

    let totalAmount = 0;
    if (lines && lines.length > 0) {
      lines.forEach((line) => {
        line.line_total = parseFloat(line.quantity) * parseFloat(line.unit_cost);
        totalAmount += line.line_total;
      });
    }

    const po = await PurchaseOrder.create({
      po_number: poNumber,
      supplier_id,
      order_date: order_date || new Date(),
      expected_date,
      shipping_method,
      notes,
      total_amount: totalAmount,
      created_by: req.user.id,
      updated_by: req.user.id,
    }, { transaction: t });

    if (lines && lines.length > 0) {
      const orderLines = lines.map((line, idx) => ({
        purchase_order_id: po.id,
        part_id: line.part_id,
        line_number: idx + 1,
        quantity: line.quantity,
        unit_cost: line.unit_cost,
        line_total: line.line_total,
        notes: line.notes,
      }));

      await PurchaseOrderLine.bulkCreate(orderLines, { transaction: t });
    }

    await t.commit();

    const created = await PurchaseOrder.findByPk(po.id, {
      include: [
        { model: Supplier },
        { model: PurchaseOrderLine, as: 'lines', include: [{ model: Part }] },
      ],
    });

    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

const update = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) {
      await t.rollback();
      return res.status(404).json({ success: false, error: { message: 'Purchase order not found' } });
    }

    if (po.status === 'Cancelled' || po.status === 'Received') {
      await t.rollback();
      return res.status(400).json({ success: false, error: { message: `Cannot update order in '${po.status}' status` } });
    }

    const { supplier_id, expected_date, shipping_method, notes, lines } = req.body;

    let totalAmount = 0;
    if (lines && lines.length > 0) {
      lines.forEach((line) => {
        line.line_total = parseFloat(line.quantity) * parseFloat(line.unit_cost);
        totalAmount += line.line_total;
      });

      await PurchaseOrderLine.destroy({ where: { purchase_order_id: po.id }, transaction: t });

      const orderLines = lines.map((line, idx) => ({
        purchase_order_id: po.id,
        part_id: line.part_id,
        line_number: idx + 1,
        quantity: line.quantity,
        unit_cost: line.unit_cost,
        line_total: line.line_total,
        notes: line.notes,
      }));

      await PurchaseOrderLine.bulkCreate(orderLines, { transaction: t });
    }

    await po.update({
      supplier_id: supplier_id || po.supplier_id,
      expected_date: expected_date !== undefined ? expected_date : po.expected_date,
      shipping_method: shipping_method !== undefined ? shipping_method : po.shipping_method,
      notes: notes !== undefined ? notes : po.notes,
      total_amount: lines ? totalAmount : po.total_amount,
      updated_by: req.user.id,
    }, { transaction: t });

    await t.commit();

    const updated = await PurchaseOrder.findByPk(po.id, {
      include: [
        { model: Supplier },
        { model: PurchaseOrderLine, as: 'lines', include: [{ model: Part }] },
      ],
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) {
      return res.status(404).json({ success: false, error: { message: 'Purchase order not found' } });
    }

    const { status } = req.body;
    const validTransitions = {
      'Draft': ['Sent', 'Cancelled'],
      'Sent': ['Confirmed', 'Cancelled'],
      'Confirmed': ['Partially Received', 'Received', 'Cancelled'],
      'Partially Received': ['Received', 'Cancelled'],
      'Received': [],
      'Cancelled': [],
    };

    if (!validTransitions[po.status] || !validTransitions[po.status].includes(status)) {
      return res.status(400).json({
        success: false,
        error: { message: `Cannot transition from '${po.status}' to '${status}'` },
      });
    }

    await po.update({ status, updated_by: req.user.id });
    return res.json({ success: true, data: po });
  } catch (err) {
    next(err);
  }
};

const cancel = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) {
      return res.status(404).json({ success: false, error: { message: 'Purchase order not found' } });
    }

    if (['Received', 'Cancelled'].includes(po.status)) {
      return res.status(400).json({
        success: false,
        error: { message: `Cannot cancel order in '${po.status}' status` },
      });
    }

    await po.update({ status: 'Cancelled', updated_by: req.user.id });
    return res.json({ success: true, data: { message: 'Purchase order cancelled' } });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById, create, update, updateStatus, cancel };
