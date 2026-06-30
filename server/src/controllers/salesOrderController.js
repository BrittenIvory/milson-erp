const { SalesOrder, SalesOrderLine, Customer, Part, User, sequelize } = require('../models');
const { getPagination, formatPaginatedResponse } = require('../utils/pagination');
const { generateOrderNumber } = require('../utils/generateNumber');
const { Op } = require('sequelize');

const list = async (req, res, next) => {
  try {
    const { page, limit, offset, sort, order } = getPagination(req.query);
    const where = {};

    if (req.query.search) {
      where[Op.or] = [
        { order_number: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }

    if (req.query.status) {
      where.status = req.query.status;
    }

    if (req.query.customer_id) {
      where.customer_id = req.query.customer_id;
    }

    const data = await SalesOrder.findAndCountAll({
      where,
      include: [
        { model: Customer, attributes: ['id', 'name', 'code'] },
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
    const so = await SalesOrder.findByPk(req.params.id, {
      include: [
        { model: Customer },
        { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name'] },
        { model: User, as: 'updater', attributes: ['id', 'first_name', 'last_name'] },
        {
          model: SalesOrderLine,
          as: 'lines',
          include: [{ model: Part, attributes: ['id', 'part_number', 'description', 'unit_of_measure'] }],
          order: [['line_number', 'ASC']],
        },
      ],
    });

    if (!so) {
      return res.status(404).json({ success: false, error: { message: 'Sales order not found' } });
    }

    return res.json({ success: true, data: so });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { customer_id, order_date, required_date, shipping_address, notes, lines } = req.body;

    const orderNumber = await generateOrderNumber(SalesOrder, 'order_number', 'SO');

    let totalAmount = 0;
    if (lines && lines.length > 0) {
      lines.forEach((line) => {
        line.line_total = parseFloat(line.quantity) * parseFloat(line.unit_price);
        totalAmount += line.line_total;
      });
    }

    const so = await SalesOrder.create({
      order_number: orderNumber,
      customer_id,
      order_date: order_date || new Date(),
      required_date,
      shipping_address,
      notes,
      total_amount: totalAmount,
      created_by: req.user.id,
      updated_by: req.user.id,
    }, { transaction: t });

    if (lines && lines.length > 0) {
      const orderLines = lines.map((line, idx) => ({
        sales_order_id: so.id,
        part_id: line.part_id,
        line_number: idx + 1,
        quantity: line.quantity,
        unit_price: line.unit_price,
        line_total: line.line_total,
        notes: line.notes,
      }));

      await SalesOrderLine.bulkCreate(orderLines, { transaction: t });
    }

    await t.commit();

    const created = await SalesOrder.findByPk(so.id, {
      include: [
        { model: Customer },
        { model: SalesOrderLine, as: 'lines', include: [{ model: Part }] },
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
    const so = await SalesOrder.findByPk(req.params.id);
    if (!so) {
      await t.rollback();
      return res.status(404).json({ success: false, error: { message: 'Sales order not found' } });
    }

    if (so.status === 'Cancelled') {
      await t.rollback();
      return res.status(400).json({ success: false, error: { message: 'Cannot update cancelled order' } });
    }

    const { customer_id, required_date, shipping_address, notes, lines } = req.body;

    let totalAmount = 0;
    if (lines && lines.length > 0) {
      lines.forEach((line) => {
        line.line_total = parseFloat(line.quantity) * parseFloat(line.unit_price);
        totalAmount += line.line_total;
      });

      await SalesOrderLine.destroy({ where: { sales_order_id: so.id }, transaction: t });

      const orderLines = lines.map((line, idx) => ({
        sales_order_id: so.id,
        part_id: line.part_id,
        line_number: idx + 1,
        quantity: line.quantity,
        unit_price: line.unit_price,
        line_total: line.line_total,
        notes: line.notes,
      }));

      await SalesOrderLine.bulkCreate(orderLines, { transaction: t });
    }

    await so.update({
      customer_id: customer_id || so.customer_id,
      required_date: required_date !== undefined ? required_date : so.required_date,
      shipping_address: shipping_address !== undefined ? shipping_address : so.shipping_address,
      notes: notes !== undefined ? notes : so.notes,
      total_amount: lines ? totalAmount : so.total_amount,
      updated_by: req.user.id,
    }, { transaction: t });

    await t.commit();

    const updated = await SalesOrder.findByPk(so.id, {
      include: [
        { model: Customer },
        { model: SalesOrderLine, as: 'lines', include: [{ model: Part }] },
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
    const so = await SalesOrder.findByPk(req.params.id);
    if (!so) {
      return res.status(404).json({ success: false, error: { message: 'Sales order not found' } });
    }

    const { status } = req.body;
    const validTransitions = {
      'Draft': ['Confirmed', 'Cancelled'],
      'Confirmed': ['In Progress', 'Cancelled'],
      'In Progress': ['Shipped', 'Cancelled'],
      'Shipped': ['Delivered'],
      'Delivered': [],
      'Cancelled': [],
    };

    if (!validTransitions[so.status] || !validTransitions[so.status].includes(status)) {
      return res.status(400).json({
        success: false,
        error: { message: `Cannot transition from '${so.status}' to '${status}'` },
      });
    }

    await so.update({ status, updated_by: req.user.id });
    return res.json({ success: true, data: so });
  } catch (err) {
    next(err);
  }
};

const cancel = async (req, res, next) => {
  try {
    const so = await SalesOrder.findByPk(req.params.id);
    if (!so) {
      return res.status(404).json({ success: false, error: { message: 'Sales order not found' } });
    }

    if (['Delivered', 'Cancelled'].includes(so.status)) {
      return res.status(400).json({
        success: false,
        error: { message: `Cannot cancel order in '${so.status}' status` },
      });
    }

    await so.update({ status: 'Cancelled', updated_by: req.user.id });
    return res.json({ success: true, data: { message: 'Sales order cancelled' } });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById, create, update, updateStatus, cancel };
